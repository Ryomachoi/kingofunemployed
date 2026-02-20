import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// 네이버 OAuth 콜백 처리
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // 에러 처리
  if (error) {
    console.error('네이버 OAuth 에러:', error)
    return redirect('/login?error=oauth_error')
  }
  
  if (!code || !state) {
    console.error('네이버 OAuth: 코드 또는 state 누락')
    return redirect('/login?error=missing_code')
  }
  
  // CSRF 보호: state 검증
  const storedState = request.cookies.get('naver_oauth_state')?.value
  if (!storedState || storedState !== state) {
    console.error('네이버 OAuth: state 불일치')
    return redirect('/login?error=invalid_state')
  }
  
  try {
    // 네이버 액세스 토큰 요청
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code,
        state,
      }),
    })
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('네이버 토큰 요청 실패:', tokenData)
      return redirect('/login?error=token_error')
    }
    
    // 네이버 사용자 정보 요청
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })
    
    const userData = await userResponse.json()
    
    if (userData.resultcode !== '00') {
      console.error('네이버 사용자 정보 요청 실패:', userData)
      return redirect('/login?error=user_info_error')
    }
    
    const naverUser = userData.response
    
    // Supabase 클라이언트 생성
    const supabase = await createClient()
    
    // JWT 페이로드 생성
    const payload = {
      user_metadata: {
        full_name: naverUser.name,
        name: naverUser.name,
        nickname: naverUser.nickname,
        profile_image: naverUser.profile_image,
        provider: 'naver',
        naver_id: naverUser.id
      }
    }
    
    // Supabase에서 사용자 생성 또는 로그인
    // 네이버 ID 기반의 안정적인 내부 이메일을 항상 사용해 동일 계정으로 연결
    const stableEmail = `naver_${naverUser.id}@naver.local`
    const tempPassword = `naver_temp_${process.env.NAVER_CLIENT_SECRET}`

    let user: any

    // 1) 기존 사용자 로그인 시도 (항상 동일한 stableEmail 사용)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: stableEmail,
      password: tempPassword
    })

    if (signInData?.user && !signInError) {
      user = signInData.user
      console.log('네이버 기존 사용자 로그인 성공:', user.email)
    } else {
      console.log('네이버 로그인 실패, 신규 사용자 생성 시도...')

      // 2) 신규 사용자 생성 (stableEmail로만 회원가입)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: stableEmail,
        password: tempPassword,
        options: {
          data: {
            ...payload.user_metadata,
            // 네이버가 제공한 실제 이메일은 메타데이터로만 보관 (표시 용도)
            original_naver_email: naverUser.email || null,
            naver_id: naverUser.id
          }
        }
      })

      if (signUpError) {
        console.error('네이버 신규 사용자 생성 실패:', signUpError)
        return redirect('/login?error=signup_failed')
      }

      user = signUpData.user
      console.log('네이버 신규 사용자 생성 성공:', user?.email || stableEmail)

      // 3) 일부 프로젝트에서 이메일 확인 설정에 따라 세션이 즉시 생성되지 않을 수 있음
      //    세션이 없다면 동일 자격으로 재로그인하여 세션 확보
      const { data: postSignupSession } = await supabase.auth.getSession()
      if (!postSignupSession?.session) {
        const { data: secondSignIn, error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: stableEmail,
          password: tempPassword
        })
        if (secondSignInError) {
          console.error('네이버 회원가입 후 재로그인 실패:', secondSignInError)
          return redirect('/login?error=session_failed')
        }
        user = secondSignIn.user
        console.log('네이버 회원가입 후 재로그인 성공:', user?.email || stableEmail)
      }
    }
    
    if (!user) {
      console.error('네이버 로그인: 사용자 생성/로그인 실패')
      return redirect('/login?error=user_creation_failed')
    }
    
    // 사용자 프로필 확인 및 생성 (카카오와 동일한 방식)
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // 신규 사용자인 경우 프로필 생성
    if (!existingProfile) {
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.nickname ||
                         `사용자${user.id.substring(0, 8)}`
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          display_name: displayName,
          nickname: null, // 사용자가 직접 설정하도록
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('네이버 프로필 생성 오류:', profileError)
        console.error('네이버 사용자 메타데이터:', user.user_metadata)
        console.error('네이버 원본 데이터:', naverUser)
        // 프로필 생성 실패해도 로그인은 성공으로 처리
      } else {
        console.log('네이버 프로필 생성 성공:', { id: user.id, display_name: displayName })
      }
    }
    
    console.log('네이버 로그인 성공:', { id: user.id, email: user.email })
    
    // 세션 설정 확인
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('네이버 로그인: 세션 설정 실패')
      return redirect('/login?error=session_failed')
    }
    
    // 리다이렉트 URL 가져오기
    const redirectTo = request.cookies.get('naver_redirect_to')?.value || '/'
    
    // 쿠키 정리
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo}`)
    response.cookies.delete('naver_oauth_state')
    response.cookies.delete('naver_redirect_to')
    
    console.log('네이버 로그인 완료, 리다이렉트:', redirectTo)
    return response
    
  } catch (error) {
    console.error('네이버 OAuth 처리 중 오류:', error)
    return redirect('/login?error=server_error')
  }
}
