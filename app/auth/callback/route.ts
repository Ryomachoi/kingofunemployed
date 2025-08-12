import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    try {
      // OAuth 코드를 세션으로 교환
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth 세션 교환 오류:', error)
        return NextResponse.redirect(new URL('/login?error=oauth_error', request.url))
      }

      if (user) {
        // 기존 사용자 프로필 확인 및 생성을 병렬로 처리
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
                              user.user_metadata?.preferred_username ||
                              `사용자${user.id.substring(0, 8)}`

           const { error: profileError } = await supabase
             .from('user_profiles')
             .insert({
               id: user.id,
               display_name: displayName,
               nickname: null,
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString()
             })

           if (profileError) {
             console.error('프로필 생성 오류:', profileError)
             console.error('사용자 메타데이터:', user.user_metadata)
             console.error('앱 메타데이터:', user.app_metadata)
             // 프로필 생성 실패해도 로그인은 성공으로 처리
           } else {
             console.log('프로필 생성 성공:', { id: user.id, display_name: displayName })
           }
         }

         // 성공적으로 로그인된 경우 메인 페이지로 리다이렉트
          return NextResponse.redirect(new URL(next, request.url))
      }
    } catch (error) {
      console.error('OAuth 처리 중 오류:', error)
      return NextResponse.redirect(new URL('/login?error=server_error', request.url))
    }
  }

  // 코드가 없거나 처리 실패한 경우
  return NextResponse.redirect(new URL('/login?error=no_code', request.url))
}