import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

// 세션 ID 생성 또는 가져오기
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('anonymous_session_id')?.value
  
  if (!sessionId) {
    sessionId = uuidv4()
    cookieStore.set('anonymous_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30일
    })
  }
  
  return sessionId
}

// 현재 세션 ID 가져오기
export async function getCurrentSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('anonymous_session_id')?.value || null
}