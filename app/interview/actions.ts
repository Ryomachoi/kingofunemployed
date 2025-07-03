'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createInterview(formData: FormData) {
  const supabase = await createClient()
  
  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }
  
  const qaCount = Number(formData.get('qa_count')) || 2
  let qaList = [];
  for (let i = 1; i <= qaCount; i++) {
    const q = formData.get(`question_${i}`) as string; // 언더스코어 추가
    const a = formData.get(`answer_${i}`) as string;   // 언더스코어 추가
    if (q && a) {
      qaList.push({ question: q, answer: a });
    }
  }

  const interviewData = {
    user_id: user.id,
    company_name: formData.get('company_name') as string,
    position: formData.get('position') as string,
    interview_date: formData.get('interview_date') as string,
    interview_type: formData.get('interview_type') as string,
    questions_and_answers: JSON.stringify(qaList), // JSON 문자열로 저장
    difficulty_level: formData.get('difficulty_level') as string || null,
    result: formData.get('result') as string || null,
    overall_rating: formData.get('overall_rating') ? parseInt(formData.get('overall_rating') as string) : null,
    feedback_and_tips: formData.get('feedback_and_tips') as string || null,
    // created_at 제거 - Supabase에서 자동으로 처리
  }
  
  const { error } = await supabase
    .from('interviews')
    .insert([interviewData])
  
  if (error) {
    console.error('Error creating interview:', error)
    return redirect(`/interview/new?message=${encodeURIComponent('면접 복기 작성 중 오류가 발생했습니다.')}`)
  }
  return redirect(`/interview?message=${encodeURIComponent('면접 복기가 성공적으로 작성되었습니다!')}`)
}