require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInterviewCreation() {
  try {
    console.log('=== 면접 분석 API 테스트 ===');
    
    // 테스트 데이터
    const testData = {
      company_name: "테스트 회사",
      position: "테스트 직무",
      interview_date: "2025-01-20",
      interview_type: "technical",
      difficulty_level: "medium",
      questions_and_answers: [
        {
          question: "자기소개를 해주세요.",
          answer: "안녕하세요. 저는 개발자입니다."
        },
        {
          question: "왜 이 회사에 지원하셨나요?",
          answer: "회사의 비전에 공감하기 때문입니다."
        }
      ],
      result: "pass",
      overall_rating: 4,
      feedback_and_tips: "전반적으로 좋았습니다.",
      analysis_type: "개인 후기"
    };

    console.log('테스트 데이터:', JSON.stringify(testData, null, 2));

    // API 호출
    const response = await fetch('http://localhost:3000/api/interview/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('\nAPI 응답:', result);

    if (result.interviewId) {
      console.log('\n=== 저장된 데이터 확인 ===');
      
      // 면접 데이터 확인
      const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', result.interviewId)
        .single();

      if (interviewError) {
        console.error('면접 데이터 조회 오류:', interviewError);
      } else {
        console.log('저장된 면접 데이터:', interview);
      }

      // 질문 데이터 확인
      const { data: questions, error: questionsError } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('interview_id', result.interviewId)
        .order('question_order', { ascending: true });

      if (questionsError) {
        console.error('질문 데이터 조회 오류:', questionsError);
      } else {
        console.log('저장된 질문 데이터:', questions);
      }
    }

  } catch (error) {
    console.error('테스트 오류:', error);
  }
}

testInterviewCreation();