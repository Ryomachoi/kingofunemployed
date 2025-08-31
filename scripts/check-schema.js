// 현재 interviews 테이블의 실제 스키마 확인
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

async function checkSchema() {
  console.log('🔍 interviews 테이블 스키마 확인...');
  console.log('=' .repeat(60));

  try {
    // interviews 테이블 컬럼 정보 확인
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'interviews' });

    if (error) {
      console.log('RPC 함수가 없어서 직접 쿼리합니다...');
      
      // 직접 information_schema 쿼리
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', 'interviews')
        .order('ordinal_position');

      if (schemaError) {
        console.error('❌ 스키마 조회 오류:', schemaError);
        
        // 대안: 빈 레코드 삽입 시도로 제약조건 확인
        console.log('\n대안: 빈 레코드 삽입 테스트...');
        const { error: insertError } = await supabase
          .from('interviews')
          .insert([{}]);
        
        if (insertError) {
          console.log('삽입 오류 (제약조건 정보):', insertError);
        }
      } else {
        console.table(schemaData);
      }
    } else {
      console.table(columns);
    }

    // 제약조건 확인 시도
    console.log('\n🔒 제약조건 확인 시도...');
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'interviews' });

    if (constraintError) {
      console.log('제약조건 RPC 함수 없음:', constraintError.message);
    } else {
      console.table(constraints);
    }

    // 실제 테이블 존재 여부 확인
    console.log('\n📋 테이블 존재 여부 확인...');
    const { data: tableExists, error: tableError } = await supabase
      .from('interviews')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      console.error('❌ 테이블 접근 오류:', tableError);
    } else {
      console.log(`✅ interviews 테이블 존재, 총 레코드 수: ${tableExists.count}`);
    }

    // interview_questions 테이블도 확인
    console.log('\n📋 interview_questions 테이블 확인...');
    const { data: questionsTableExists, error: questionsTableError } = await supabase
      .from('interview_questions')
      .select('count', { count: 'exact', head: true });

    if (questionsTableError) {
      console.error('❌ interview_questions 테이블 접근 오류:', questionsTableError);
    } else {
      console.log(`✅ interview_questions 테이블 존재, 총 레코드 수: ${questionsTableExists.count}`);
    }

  } catch (error) {
    console.error('❌ 스키마 확인 중 오류 발생:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 스키마 확인 완료');
}

// 스크립트 실행
checkSchema();