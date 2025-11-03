require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLSPolicies() {
  try {
    console.log('=== 면접 질문 조회 테스트 ===');

    // 특정 면접의 질문 조회 테스트
    console.log('\n=== 공유된 면접의 질문 조회 테스트 ===');
    
    // 공유된 면접 찾기
    const { data: sharedInterviews, error: sharedError } = await supabase
      .from('interviews')
      .select('id, company_name, position, is_shared')
      .eq('is_shared', true)
      .limit(1);

    if (sharedError) {
      console.error('공유된 면접 조회 오류:', sharedError);
      return;
    }

    if (sharedInterviews && sharedInterviews.length > 0) {
      const interview = sharedInterviews[0];
      console.log(`공유된 면접 발견: ${interview.company_name} - ${interview.position}`);
      
      // 해당 면접의 질문들 조회
      const { data: questions, error: questionsError } = await supabase
        .from('interview_questions')
        .select('question, answer, question_order')
        .eq('interview_id', interview.id)
        .order('question_order', { ascending: true });

      if (questionsError) {
        console.error('질문 조회 오류:', questionsError);
      } else {
        console.log(`질문 개수: ${questions ? questions.length : 0}`);
        if (questions && questions.length > 0) {
          questions.forEach((q, index) => {
            console.log(`\n질문 ${q.question_order}: ${q.question.substring(0, 50)}...`);
            console.log(`답변: ${q.answer.substring(0, 50)}...`);
          });
        } else {
          console.log('질문이 없습니다.');
        }
      }
    } else {
      console.log('공유된 면접이 없습니다.');
    }

  } catch (error) {
    console.error('전체 오류:', error);
  }
}

checkRLSPolicies();