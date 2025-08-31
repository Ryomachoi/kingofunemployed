require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('=== auth.users 확인 ===');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('auth.users 조회 오류:', authError.message);
      return;
    }
    
    if (!authUsers || authUsers.users.length === 0) {
      console.log('❌ 인증된 사용자가 없습니다.');
      return;
    }
    
    const userId = authUsers.users[0].id;
    console.log('사용자 ID:', userId);
    
    console.log('=== 테스트 데이터 삽입 시도 ===');
    const testData = {
      user_id: userId,
      company_name: '테스트회사',
      position: '테스트직무',
      interview_date: '2024-08-31',
      interview_type: 'technical',
      difficulty_level: 'medium',
      result: 'pass',
      overall_rating: 4,
      feedback_and_tips: '테스트 피드백',
      ai_feedback: { test: 'data' },
      ai_analysis_metadata: { test: true },
      analysis_timestamp: new Date().toISOString(),
      ai_analysis_status: 'completed',
      is_shared: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('interviews')
      .insert([testData])
      .select('id')
      .single();
    
    if (error) {
      console.error('❌ 삽입 오류:', error);
      console.error('오류 코드:', error.code);
      console.error('오류 메시지:', error.message);
      console.error('오류 세부사항:', error.details);
      console.error('오류 힌트:', error.hint);
    } else {
      console.log('✅ 삽입 성공:', data);
      // 테스트 데이터 삭제
      await supabase.from('interviews').delete().eq('id', data.id);
      console.log('테스트 데이터 삭제 완료');
    }
  } catch (err) {
    console.error('스크립트 실행 오류:', err.message);
  }
})();