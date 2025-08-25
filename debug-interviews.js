const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// .env.local 파일 읽기
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInterviewsTable() {
  try {
    console.log('=== interviews 테이블 데이터 조회 ===');
    
    // 모든 interviews 데이터 조회
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('데이터 조회 오류:', error);
    } else {
      console.log('조회된 데이터 개수:', interviews?.length || 0);
      if (interviews && interviews.length > 0) {
        console.log('첫 번째 데이터 구조:');
        console.log(JSON.stringify(interviews[0], null, 2));
        
        console.log('\n모든 컬럼 목록:');
        console.log(Object.keys(interviews[0]));
      } else {
        console.log('데이터가 없습니다.');
      }
    }
    
    // is_public 컬럼이 있는지 확인
    console.log('\n=== is_public 컬럼 확인 ===');
    const { data: publicData, error: publicError } = await supabase
      .from('interviews')
      .select('id, is_public')
      .limit(1);
    
    if (publicError) {
      console.error('is_public 컬럼 조회 오류:', publicError.message);
    } else {
      console.log('is_public 컬럼이 존재합니다.');
    }
    
  } catch (err) {
    console.error('전체 오류:', err);
  }
}

checkInterviewsTable();