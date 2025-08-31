// questions_and_answers 컬럼의 NOT NULL 제약조건 제거
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

async function fixQuestionsConstraint() {
  console.log('🔧 questions_and_answers 컬럼 제약조건 수정...');
  console.log('=' .repeat(60));

  try {
    // questions_and_answers 컬럼을 NULL 허용으로 변경
    console.log('1. questions_and_answers 컬럼을 NULL 허용으로 변경...');
    const { error: alterError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE interviews ALTER COLUMN questions_and_answers DROP NOT NULL;' 
      });

    if (alterError) {
      console.log('RPC 함수가 없어서 직접 시도합니다...');
      
      // 직접 SQL 실행 시도 (이것은 작동하지 않을 수 있음)
      const { error: directError } = await supabase
        .from('interviews')
        .update({ questions_and_answers: null })
        .eq('id', 'non-existent-id'); // 실제로는 실행되지 않음
        
      console.log('❌ 직접 스키마 변경은 Supabase 클라이언트로는 불가능합니다.');
      console.log('✅ Supabase 대시보드에서 다음 SQL을 실행해주세요:');
      console.log('\n--- 실행할 SQL ---');
      console.log('ALTER TABLE interviews ALTER COLUMN questions_and_answers DROP NOT NULL;');
      console.log('--- SQL 끝 ---\n');
    } else {
      console.log('✅ questions_and_answers 컬럼 제약조건이 수정되었습니다.');
    }

    // 테스트: 빈 레코드 삽입 시도
    console.log('2. 테스트: 최소한의 데이터로 레코드 삽입 시도...');
    const { data: testInsert, error: testError } = await supabase
      .from('interviews')
      .insert([{
        user_id: '00000000-0000-0000-0000-000000000000', // 임시 UUID
        company_name: '테스트 회사',
        position: '테스트 직무',
        ai_analysis_status: 'completed'
      }])
      .select('id');

    if (testError) {
      console.log('❌ 테스트 삽입 실패:', testError);
      
      if (testError.code === '23502') {
        console.log('\n🔍 NOT NULL 제약조건 위반 필드들:');
        if (testError.message.includes('questions_and_answers')) {
          console.log('- questions_and_answers: NOT NULL 제약조건 있음');
        }
        if (testError.message.includes('company_name')) {
          console.log('- company_name: NOT NULL 제약조건 있음');
        }
        if (testError.message.includes('position')) {
          console.log('- position: NOT NULL 제약조건 있음');
        }
      }
    } else {
      console.log('✅ 테스트 삽입 성공:', testInsert);
      
      // 테스트 레코드 삭제
      if (testInsert && testInsert[0]?.id) {
        await supabase
          .from('interviews')
          .delete()
          .eq('id', testInsert[0].id);
        console.log('✅ 테스트 레코드 삭제 완료');
      }
    }

  } catch (error) {
    console.error('❌ 제약조건 수정 중 오류 발생:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔧 제약조건 수정 완료');
  console.log('\n📋 다음 단계:');
  console.log('1. Supabase 대시보드 → SQL Editor로 이동');
  console.log('2. 다음 SQL 실행: ALTER TABLE interviews ALTER COLUMN questions_and_answers DROP NOT NULL;');
  console.log('3. 면접 분석 다시 테스트');
}

// 스크립트 실행
fixQuestionsConstraint();