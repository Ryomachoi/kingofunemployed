require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('=== 제약조건 확인 ===');
    
    // PostgreSQL 시스템 테이블에서 제약조건 조회
    const { data, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            conname as constraint_name,
            pg_get_constraintdef(oid) as constraint_definition
          FROM pg_constraint 
          WHERE conrelid = 'interviews'::regclass 
            AND contype = 'c'
            AND conname LIKE '%interview_type%';
        `
      });
    
    if (error) {
      console.error('제약조건 조회 오류:', error.message);
      
      // 대안: 직접 테스트 삽입으로 확인
      console.log('\n=== 테스트 삽입으로 제약조건 확인 ===');
      const testData = {
        user_id: '1ebb580f-8b79-4836-93c7-e9d78b12acec',
        company_name: '테스트회사',
        position: '테스트직무',
        interview_date: '2024-08-31',
        interview_type: 'invalid_type', // 잘못된 값으로 테스트
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
      
      const { data: insertData, error: insertError } = await supabase
        .from('interviews')
        .insert([testData]);
      
      if (insertError) {
        console.log('예상된 오류 (잘못된 interview_type):', insertError.message);
      }
      
      // 올바른 값으로 테스트
      testData.interview_type = 'other';
      const { data: insertData2, error: insertError2 } = await supabase
        .from('interviews')
        .insert([testData])
        .select('id')
        .single();
      
      if (insertError2) {
        console.log('other 타입 삽입 오류:', insertError2.message);
      } else {
        console.log('other 타입 삽입 성공:', insertData2.id);
        // 테스트 데이터 삭제
        await supabase.from('interviews').delete().eq('id', insertData2.id);
        console.log('테스트 데이터 삭제 완료');
      }
    } else {
      console.log('제약조건 정보:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('스크립트 실행 오류:', err.message);
  }
})();