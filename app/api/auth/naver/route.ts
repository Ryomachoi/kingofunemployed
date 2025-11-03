import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 네이버 OAuth 로그인 시작
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirectTo') || '/'
  
  // CSRF 보호를 위한 state 생성
  const state = crypto.randomUUID()
  
  // 네이버 OAuth URL 생성
  const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
  naverAuthUrl.searchParams.set('response_type', 'code')
  naverAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!)
  naverAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/naver/callback`)
  naverAuthUrl.searchParams.set('state', state)
  
  // state를 쿠키에 저장 (CSRF 보호)
  const response = NextResponse.redirect(naverAuthUrl.toString())
  response.cookies.set('naver_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10분
  })
  
  // 리다이렉트 URL도 쿠키에 저장
  response.cookies.set('naver_redirect_to', redirectTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10분
  })
  
  return response
}