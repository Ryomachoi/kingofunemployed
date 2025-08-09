import { createClient } from '@/lib/supabase/client'

/**
 * 카카오 OAuth 로그인 시작
 */
export async function signInWithKakao() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      // scopes 제거 - Supabase가 기본 스코프를 사용하도록 함
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('카카오 로그인 오류:', error)
    throw error
  }

  return data
}

/**
 * 네이버 OAuth 로그인 시작
 */
export async function signInWithNaver() {
  try {
    // 네이버 OAuth API 라우트로 리다이렉트
    window.location.href = '/api/auth/naver'
  } catch (error) {
    console.error('네이버 로그인 오류:', error)
    throw error
  }
}

/**
 * 현재 사용자 세션 확인
 */
export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('사용자 정보 조회 오류:', error)
    return null
  }
  
  return user
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('프로필 조회 오류:', error)
    return null
  }
  
  return data
}

/**
 * 로그아웃
 */
export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('로그아웃 오류:', error)
    throw error
  }
  
  // 페이지 새로고침으로 상태 초기화
  window.location.href = '/'
}