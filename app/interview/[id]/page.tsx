import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InterviewDetailClient from './InterviewDetailClient'

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // 현재 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id
  
  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .single()

  // 사용자 프로필 정보를 별도로 조회
  let userProfile = null
  if (interview?.user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('nickname, display_name')
      .eq('user_id', interview.user_id)
      .single()
    userProfile = profile
  }

  if (!interview) return notFound()

  // 질문/답변 파싱
  let qaList: { question: string; answer: string }[] = []
  try {
    qaList = JSON.parse(interview.questions_and_answers || '[]')
  } catch (e) {
    qaList = []
  }

  return (
    <InterviewDetailClient 
      interview={interview}
      userProfile={userProfile}
      currentUserId={currentUserId}
      parsedQAList={qaList}
    />
  )
}