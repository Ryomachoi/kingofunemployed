require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConstraints() {
  console.log('🔍 데이터베이스 제약조건 확인 중...');
  
  try {
    // 1. 현재 interview_type 값들 확인
    console.log('\n1. 현재 interview_type 값들:');
    const { data: typeData, error: typeError } = await supabase
      .from('interviews')
      .select('interview_type')
      .not('interview_type', 'is', null);
    
    if (typeError) {
      console.log('   ❌ interview_type 조회 오류:', typeError.message);
    } else {
      const uniqueTypes = [...new Set(typeData.map(item => item.interview_type))];
      console.log('   고유한 interview_type 값들:', uniqueTypes);
    }
    
    // 2. 테스트 데이터 삽입 시도 (questions_and_answers = null)
    console.log('\n2. questions_and_answers = null 테스트:');
    const testData1 = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      company_name: '테스트회사1',
      position: '테스트직무1',
      interview_date: new Date().toISOString().split('T')[0],
      interview_type: 'other',
      difficulty_level: 'medium',
      result: 'pending',
      overall_rating: 3,
      ai_feedback: { test: 'data1' },
      analysis_timestamp: new Date().toISOString(),
      ai_analysis_status: 'completed',
      questions_and_answers: null
    };
    
    const { data: insertData1, error: insertError1 } = await supabase
      .from('interviews')
      .insert(testData1)
      .select();
    
    if (insertError1) {
      console.log('   ❌ 삽입 실패:', insertError1.code, '-', insertError1.message);
    } else {
      console.log('   ✅ questions_and_answers = null 삽입 성공!');
      // 테스트 데이터 삭제
      await supabase.from('interviews').delete().eq('id', insertData1[0].id);
    }
    
    // 3. 테스트 데이터 삽입 시도 (한국어 interview_type)
    console.log('\n3. 한국어 interview_type 테스트:');
    const testData2 = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      company_name: '테스트회사2',
      position: '테스트직무2',
      interview_date: new Date().toISOString().split('T')[0],
      interview_type: '화상면접',
      difficulty_level: 'medium',
      result: 'pending',
      overall_rating: 3,
      ai_feedback: { test: 'data2' },
      analysis_timestamp: new Date().toISOString(),
      ai_analysis_status: 'completed',
      questions_and_answers: { test: 'questions' }
    };
    
    const { data: insertData2, error: insertError2 } = await supabase
      .from('interviews')
      .insert(testData2)
      .select();
    
    if (insertError2) {
      console.log('   ❌ 삽입 실패:', insertError2.code, '-', insertError2.message);
    } else {
      console.log('   ✅ 한국어 interview_type 삽입 성공!');
      // 테스트 데이터 삭제
      await supabase.from('interviews').delete().eq('id', insertData2[0].id);
    }
    
    console.log('\n📋 결론:');
    if (insertError1 && insertError1.code === '23502') {
      console.log('   ❌ questions_and_answers NOT NULL 제약조건이 여전히 존재합니다.');
      console.log('   💡 해결방법: ALTER TABLE interviews ALTER COLUMN questions_and_answers DROP NOT NULL;');
    }
    if (insertError2 && insertError2.code === '23514') {
      console.log('   ❌ interview_type 체크 제약조건이 여전히 한국어를 허용하지 않습니다.');
      console.log('   💡 해결방법: 기존 제약조건을 삭제하고 새로운 제약조건을 추가해야 합니다.');
    }
    if (!insertError1 && !insertError2) {
      console.log('   ✅ 모든 제약조건이 올바르게 수정되었습니다!');
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류 발생:', error.message);
  }
}

verifyConstraints();