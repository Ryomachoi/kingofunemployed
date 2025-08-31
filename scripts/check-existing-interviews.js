require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Service role key로 Supabase 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingInterviews() {
  try {
    console.log('=== 기존 면접 데이터 분석 ===');
    
    // 모든 면접 데이터 조회
    const { data: interviews, error: interviewsError } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (interviewsError) {
      console.error('면접 데이터 조회 오류:', interviewsError);
      return;
    }

    console.log(`총 면접 개수: ${interviews.length}`);
    
    for (const interview of interviews) {
      console.log(`\n--- 면접 ID: ${interview.id} ---`);
      console.log(`회사: ${interview.company_name}, 직무: ${interview.position}`);
      console.log(`생성일: ${interview.created_at}`);
      console.log(`공유 상태: ${interview.is_shared}`);
      
      // 기존 questions_and_answers 컬럼 확인
      if (interview.questions_and_answers) {
        console.log('기존 questions_and_answers 컬럼:', typeof interview.questions_and_answers);
        if (typeof interview.questions_and_answers === 'object') {
          console.log('Q&A 개수:', Array.isArray(interview.questions_and_answers) ? interview.questions_and_answers.length : 'Not array');
        }
      } else {
        console.log('기존 questions_and_answers 컬럼: null');
      }
      
      // interview_questions 테이블에서 질문 확인
      const { data: questions, error: questionsError } = await supabaseAdmin
        .from('interview_questions')
        .select('*')
        .eq('interview_id', interview.id)
        .order('question_order', { ascending: true });

      if (questionsError) {
        console.error('질문 데이터 조회 오류:', questionsError);
      } else {
        console.log(`interview_questions 테이블 질문 개수: ${questions.length}`);
        if (questions.length > 0) {
          questions.forEach((q, index) => {
            console.log(`  ${index + 1}. Q: ${q.question.substring(0, 50)}...`);
            console.log(`     A: ${q.answer.substring(0, 50)}...`);
          });
        }
      }
    }

    // 전체 통계
    console.log('\n=== 전체 통계 ===');
    const { data: totalQuestions, error: totalError } = await supabaseAdmin
      .from('interview_questions')
      .select('interview_id', { count: 'exact' });

    if (totalError) {
      console.error('전체 질문 통계 오류:', totalError);
    } else {
      console.log(`전체 interview_questions 테이블 레코드 수: ${totalQuestions.length}`);
    }

  } catch (error) {
    console.error('오류:', error);
  }
}

checkExistingInterviews();