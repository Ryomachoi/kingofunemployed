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
  
  const company_name = formData.get('company_name') as string;
  const position = formData.get('position') as string;
  const interview_date = formData.get('interview_date') as string;
  const interview_type = formData.get('interview_type') as string;
  const difficulty = formData.get('difficulty') as string;
  const result = formData.get('result') as string;
  const overall_rating = formData.get('overall_rating') as string;
  const feedback_and_tips = formData.get('feedback_and_tips') as string;
  const qaCount = Number(formData.get('qa_count')) || 2
  let qaList = [];
  for (let i = 1; i <= qaCount; i++) {
    const q = formData.get(`question_${i}`) as string; // 언더스코어 추가
    const a = formData.get(`answer_${i}`) as string;   // 언더스코어 추가
    if (q && a) {
      qaList.push({ question: q, answer: a, order: i });
    }
  }

  const interviewData = {
    user_id: user.id,
    company_name,
    position,
    interview_date,
    interview_type,
    difficulty_level: difficulty?.trim() || null,
    result: result || null,
    overall_rating: overall_rating ? parseInt(overall_rating) : null,
    feedback_and_tips: feedback_and_tips || null,
    // created_at 제거 - Supabase에서 자동으로 처리
  }
  
  // 1. 먼저 면접 정보를 저장하고 ID를 받아옴
  const { data: interview, error: interviewError } = await supabase
    .from('interviews')
    .insert([interviewData])
    .select('id')
    .single()
  
  if (interviewError) {
    console.error('Error creating interview:', interviewError)
    return redirect(`/interview/new?message=${encodeURIComponent('면접 복기 작성 중 오류가 발생했습니다.')}`)
  }

  // 2. 질문과 답변을 interview_questions 테이블에 저장
  if (qaList.length > 0 && interview?.id) {
    const questionsData = qaList.map((qa) => ({
      interview_id: interview.id,
      question_order: qa.order,
      question: qa.question,
      answer: qa.answer
    }))

    const { error: questionsError } = await supabase
      .from('interview_questions')
      .insert(questionsData)

    if (questionsError) {
      console.error('Error creating interview questions:', questionsError)
      // 면접은 생성되었지만 질문 저장에 실패한 경우, 면접을 삭제할지 결정
      // 여기서는 경고 메시지와 함께 진행
      return redirect(`/interview/community?message=${encodeURIComponent('면접 복기는 저장되었지만 일부 질문 저장에 실패했습니다.')}`)
    }
  }
  return redirect(`/interview/community?message=${encodeURIComponent('면접 복기가 성공적으로 작성되었습니다!')}`)
}