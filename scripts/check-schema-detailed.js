const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// .env.local 파일에서 환경 변수 읽기
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('환경 변수 파일 읽기 실패:', error.message);
    return {};
  }
}

async function checkDetailedSchema() {
  const envVars = loadEnvFile();
  
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 interviews 테이블 스키마 상세 확인...');
    
    // 1. 테이블 존재 확인
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'interviews');
    
    if (tablesError) {
      console.log('테이블 존재 확인 실패 (정상적일 수 있음):', tablesError.message);
    } else {
      console.log('📋 테이블 존재 여부:', tables?.length > 0 ? '존재함' : '존재하지 않음');
    }
    
    // 2. 컬럼 정보 확인
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'interviews')
      .order('ordinal_position');
    
    if (columnsError) {
      console.log('컬럼 정보 확인 실패 (정상적일 수 있음):', columnsError.message);
    } else if (columns && columns.length > 0) {
      console.log('\n📊 컬럼 정보:');
      console.table(columns);
      
      // questions_and_answers 컬럼 특별 확인
      const qaColumn = columns.find(col => col.column_name === 'questions_and_answers');
      if (qaColumn) {
        console.log('\n🎯 questions_and_answers 컬럼 상세:');
        console.log('- 데이터 타입:', qaColumn.data_type);
        console.log('- NULL 허용:', qaColumn.is_nullable);
        console.log('- 기본값:', qaColumn.column_default);
      } else {
        console.log('\n❌ questions_and_answers 컬럼을 찾을 수 없습니다.');
      }
    }
    
    // 3. 제약조건 확인
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'interviews');
    
    if (constraintsError) {
      console.log('제약조건 확인 실패 (정상적일 수 있음):', constraintsError.message);
    } else if (constraints && constraints.length > 0) {
      console.log('\n🔒 테이블 제약조건:');
      console.table(constraints);
    }
    
    // 4. 실제 데이터 삽입 테스트
    console.log('\n🧪 데이터 삽입 테스트...');
    const testRecord = {
      user_id: '550e8400-e29b-41d4-a716-446655440000', // 유효한 UUID 형식
      company_name: '테스트 회사',
      position: '테스트 직무',
      interview_date: new Date().toISOString().split('T')[0],
      interview_type: 'technical',
      difficulty_level: 'medium',
      result: 'pending',
      overall_rating: 3,
      ai_feedback: { test: 'data' },
      analysis_timestamp: new Date().toISOString(),
      ai_analysis_status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('interviews')
      .insert([testRecord])
      .select('id');
    
    if (insertError) {
      console.log('❌ 삽입 테스트 실패:', insertError);
    } else {
      console.log('✅ 삽입 테스트 성공:', insertResult);
      
      // 테스트 데이터 삭제
      if (insertResult && insertResult[0]?.id) {
        await supabase
          .from('interviews')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🗑️ 테스트 데이터 삭제 완료');
      }
    }
    
  } catch (error) {
    console.error('❌ 스키마 확인 중 오류:', error);
  }
}

checkDetailedSchema();