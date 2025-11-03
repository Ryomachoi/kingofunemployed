require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugInterviewQuestions() {
  try {
    console.log('=== 면접 질문 데이터 디버깅 ===');
    
    // 1. 공유된 면접 찾기
    const { data: sharedInterviews, error: sharedError } = await supabase
      .from('interviews')
      .select('id, company_name, position, is_shared, user_id')
      .eq('is_shared', true)
      .limit(3);

    if (sharedError) {
      console.error('공유된 면접 조회 오류:', sharedError);
      return;
    }

    console.log('공유된 면접들:', sharedInterviews);

    if (sharedInterviews && sharedInterviews.length > 0) {
      for (const interview of sharedInterviews) {
        console.log(`\n--- 면접 ID: ${interview.id} ---`);
        console.log(`회사: ${interview.company_name}, 직무: ${interview.position}`);
        console.log(`공유 상태: ${interview.is_shared}, 사용자 ID: ${interview.user_id}`);
        
        // 2. 해당 면접의 모든 질문 조회 (RLS 우회)
        const { data: allQuestions, error: allQuestionsError } = await supabase
          .from('interview_questions')
          .select('*')
          .eq('interview_id', interview.id);

        if (allQuestionsError) {
          console.error('질문 조회 오류 (RLS 우회):', allQuestionsError);
        } else {
          console.log(`전체 질문 개수 (RLS 우회): ${allQuestions ? allQuestions.length : 0}`);
          if (allQuestions && allQuestions.length > 0) {
            allQuestions.forEach((q, index) => {
              console.log(`질문 ${q.question_order}: ${q.question.substring(0, 30)}...`);
            });
          }
        }

        // 3. 일반 클라이언트로 질문 조회 (RLS 적용)
        const normalClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: normalQuestions, error: normalError } = await normalClient
          .from('interview_questions')
          .select('question, answer, question_order')
          .eq('interview_id', interview.id)
          .order('question_order', { ascending: true });

        if (normalError) {
          console.error('일반 클라이언트 질문 조회 오류:', normalError);
        } else {
          console.log(`일반 클라이언트 질문 개수: ${normalQuestions ? normalQuestions.length : 0}`);
        }
      }
    }

    // 4. interview_questions 테이블 전체 통계
    console.log('\n=== interview_questions 테이블 통계 ===');
    const { data: stats, error: statsError } = await supabase
      .from('interview_questions')
      .select('interview_id')
      .limit(1000);

    if (statsError) {
      console.error('통계 조회 오류:', statsError);
    } else {
      const uniqueInterviews = new Set(stats?.map(s => s.interview_id) || []);
      console.log(`전체 질문 개수: ${stats ? stats.length : 0}`);
      console.log(`질문이 있는 면접 개수: ${uniqueInterviews.size}`);
    }

    // 5. 최근 생성된 질문들 확인
    console.log('\n=== 최근 생성된 질문들 ===');
    const { data: recentQuestions, error: recentError } = await supabase
      .from('interview_questions')
      .select('interview_id, question, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('최근 질문 조회 오류:', recentError);
    } else {
      console.log('최근 질문들:');
      recentQuestions?.forEach(q => {
        console.log(`면접 ID: ${q.interview_id}, 생성일: ${q.created_at}`);
        console.log(`질문: ${q.question.substring(0, 50)}...\n`);
      });
    }

  } catch (error) {
    console.error('전체 오류:', error);
  }
}

debugInterviewQuestions();