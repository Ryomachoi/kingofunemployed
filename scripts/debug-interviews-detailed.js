// 면접 분석 후 저장 문제 디버깅 스크립트
// 면접 ID가 없다는 오류와 마이페이지 조회 문제 해결을 위한 진단

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// .env.local 파일에서 환경변수 읽기
let envVars = {};
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.error('❌ .env.local 파일을 읽을 수 없습니다:', error.message);
  process.exit(1);
}

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function debugInterviewIssues() {
  console.log('🔍 면접 데이터 디버깅 시작...');
  console.log('=' .repeat(60));

  try {
    // 1. 최근 생성된 면접 데이터 확인
    console.log('\n📊 1. 최근 생성된 면접 데이터 (최근 10개):');
    const { data: recentInterviews, error: recentError } = await supabase
      .from('interviews')
      .select('id, company_name, position, user_id, created_at, ai_analysis_status, is_shared')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ 최근 면접 조회 오류:', recentError);
    } else {
      console.table(recentInterviews);
    }

    // 2. 면접 질문 테이블과의 연결 상태 확인
    console.log('\n🔗 2. 면접-질문 연결 상태 (최근 7일):');
    const { data: interviewQuestionStats, error: statsError } = await supabase
      .rpc('get_interview_question_stats');

    if (statsError) {
      console.log('RPC 함수가 없어서 직접 조회합니다...');
      
      // 직접 조회
      const { data: interviews } = await supabase
        .from('interviews')
        .select('id, company_name, position, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (interviews) {
        const interviewsWithQuestions = await Promise.all(
          interviews.map(async (interview) => {
            const { count } = await supabase
              .from('interview_questions')
              .select('*', { count: 'exact', head: true })
              .eq('interview_id', interview.id);

            return {
              ...interview,
              question_count: count || 0
            };
          })
        );
        console.table(interviewsWithQuestions);
      }
    } else {
      console.table(interviewQuestionStats);
    }

    // 3. AI 분석 상태별 면접 개수 확인
    console.log('\n🤖 3. AI 분석 상태별 분포:');
    const { data: analysisStats } = await supabase
      .from('interviews')
      .select('ai_analysis_status')
      .not('ai_analysis_status', 'is', null);

    if (analysisStats) {
      const statusCounts = analysisStats.reduce((acc, item) => {
        acc[item.ai_analysis_status || 'NULL'] = (acc[item.ai_analysis_status || 'NULL'] || 0) + 1;
        return acc;
      }, {});
      console.table(statusCounts);
    }

    // 4. 공유 상태별 면접 개수 확인
    console.log('\n📤 4. 공유 상태별 분포:');
    const { data: shareStats } = await supabase
      .from('interviews')
      .select('is_shared');

    if (shareStats) {
      const shareCounts = shareStats.reduce((acc, item) => {
        const status = item.is_shared === null ? 'NULL' : 
                      item.is_shared === true ? 'SHARED' : 'NOT_SHARED';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      console.table(shareCounts);
    }

    // 5. 사용자별 면접 개수 확인 (최근 30일)
    console.log('\n👥 5. 사용자별 면접 개수 (최근 30일):');
    const { data: userStats } = await supabase
      .from('interviews')
      .select('user_id, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (userStats) {
      const userCounts = userStats.reduce((acc, item) => {
        acc[item.user_id] = (acc[item.user_id] || 0) + 1;
        return acc;
      }, {});
      
      const sortedUsers = Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([user_id, count]) => ({ user_id: user_id.substring(0, 8) + '...', count }));
      
      console.table(sortedUsers);
    }

    // 6. 데이터 품질 확인
    console.log('\n🔍 6. 데이터 품질 확인:');
    const { data: allInterviews } = await supabase
      .from('interviews')
      .select('company_name, position, ai_feedback, user_id');

    if (allInterviews) {
      const qualityStats = {
        total_interviews: allInterviews.length,
        empty_company: allInterviews.filter(i => !i.company_name || i.company_name.trim() === '').length,
        empty_position: allInterviews.filter(i => !i.position || i.position.trim() === '').length,
        no_ai_feedback: allInterviews.filter(i => !i.ai_feedback).length,
        no_user_id: allInterviews.filter(i => !i.user_id).length
      };
      console.table([qualityStats]);
    }

    // 7. 최근 면접의 상세 정보 (최근 1일)
    console.log('\n📋 7. 최근 면접 상세 정보 (최근 1일):');
    const { data: recentDetails } = await supabase
      .from('interviews')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (recentDetails && recentDetails.length > 0) {
      recentDetails.forEach(interview => {
        console.log(`\n면접 ID: ${interview.id}`);
        console.log(`회사: ${interview.company_name}`);
        console.log(`직무: ${interview.position}`);
        console.log(`사용자 ID: ${interview.user_id?.substring(0, 8)}...`);
        console.log(`AI 분석 상태: ${interview.ai_analysis_status}`);
        console.log(`공유 상태: ${interview.is_shared}`);
        console.log(`생성일: ${interview.created_at}`);
        console.log(`AI 피드백 상태: ${interview.ai_feedback ? 'HAS_DATA' : 'NULL'}`);
        console.log('-'.repeat(40));
      });
    } else {
      console.log('최근 1일 내 생성된 면접이 없습니다.');
    }

    // 8. 면접 질문 데이터 상태 확인
    console.log('\n❓ 8. 면접 질문 데이터 상태:');
    const { data: allQuestions } = await supabase
      .from('interview_questions')
      .select('interview_id, question, answer, question_order');

    if (allQuestions) {
      const questionStats = {
        total_questions: allQuestions.length,
        interviews_with_questions: new Set(allQuestions.map(q => q.interview_id)).size,
        avg_question_order: allQuestions.reduce((sum, q) => sum + (q.question_order || 0), 0) / allQuestions.length,
        empty_questions: allQuestions.filter(q => !q.question || q.question.trim() === '').length,
        empty_answers: allQuestions.filter(q => !q.answer || q.answer.trim() === '').length
      };
      console.table([questionStats]);
    }

    // 9. 최근 생성된 면접 질문들 (최근 1일)
    console.log('\n📝 9. 최근 생성된 면접 질문들 (최근 1일):');
    const { data: recentQuestions } = await supabase
      .from('interview_questions')
      .select(`
        interview_id,
        question_order,
        question,
        answer,
        created_at,
        interviews!inner(company_name, position)
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (recentQuestions && recentQuestions.length > 0) {
      recentQuestions.forEach(q => {
        console.log(`\n면접 ID: ${q.interview_id}`);
        console.log(`회사: ${q.interviews.company_name}`);
        console.log(`직무: ${q.interviews.position}`);
        console.log(`질문 순서: ${q.question_order}`);
        console.log(`질문: ${q.question?.substring(0, 100)}${q.question?.length > 100 ? '...' : ''}`);
        console.log(`답변: ${q.answer?.substring(0, 100)}${q.answer?.length > 100 ? '...' : ''}`);
        console.log(`생성일: ${q.created_at}`);
        console.log('-'.repeat(40));
      });
    } else {
      console.log('최근 1일 내 생성된 면접 질문이 없습니다.');
    }

  } catch (error) {
    console.error('❌ 디버깅 중 오류 발생:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 면접 데이터 디버깅 완료');
}

// 스크립트 실행
debugInterviewIssues();