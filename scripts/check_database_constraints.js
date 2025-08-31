// 데이터베이스 제약조건 상태 확인 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ 설정됨' : '❌ 없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseConstraints() {
  console.log('🔍 데이터베이스 제약조건 상태 확인 중...');
  console.log('=' .repeat(50));

  try {
    // 1. interviews 테이블에서 샘플 데이터 조회 시도
    console.log('\n📋 1. interviews 테이블 접근 테스트:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('interviews')
      .select('id, interview_type, questions_and_answers')
      .limit(1);

    if (sampleError) {
      console.log('❌ interviews 테이블 접근 오류:', sampleError.message);
    } else {
      console.log('✅ interviews 테이블 접근 성공');
      console.log('   샘플 데이터 개수:', sampleData?.length || 0);
    }

    // 2. 현재 interview_type 값들 확인
    console.log('\n📊 2. 현재 interview_type 값들:');
    const { data: interviewTypes, error: typesError } = await supabase
      .from('interviews')
      .select('interview_type')
      .not('interview_type', 'is', null);

    if (typesError) {
      console.log('❌ interview_type 조회 오류:', typesError.message);
    } else {
      const typeCounts = {};
      interviewTypes.forEach(item => {
        typeCounts[item.interview_type] = (typeCounts[item.interview_type] || 0) + 1;
      });
      
      if (Object.keys(typeCounts).length === 0) {
        console.log('   📝 데이터가 없습니다.');
      } else {
        Object.entries(typeCounts).forEach(([type, count]) => {
          console.log(`   ${type}: ${count}개`);
        });
      }
    }

    // 3. 테스트 데이터 삽입 시도
    console.log('\n🧪 3. 테스트 데이터 삽입 시도:');
    const testData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      company_name: '테스트 회사',
      position: '테스트 직무',
      interview_date: new Date().toISOString().split('T')[0],
      interview_type: 'other',
      difficulty_level: 'medium',
      result: 'pending',
      overall_rating: 3,
      ai_feedback: { test: 'data' },
      analysis_timestamp: new Date().toISOString(),
      ai_analysis_status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
      // questions_and_answers는 의도적으로 제외 (NULL 테스트)
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('interviews')
      .insert([testData])
      .select('id')
      .single();

    if (insertError) {
      console.log('❌ 테스트 데이터 삽입 실패:', insertError.message);
      console.log('   코드:', insertError.code);
      
      if (insertError.code === '23502') {
        console.log('\n🔧 해결방법: questions_and_answers 컬럼의 NOT NULL 제약조건을 제거해야 합니다.');
      }
      if (insertError.code === '23514') {
        console.log('\n🔧 해결방법: interview_type_check 제약조건을 수정해야 합니다.');
      }
    } else {
      console.log('✅ 테스트 데이터 삽입 성공! ID:', insertResult.id);
      
      // 테스트 데이터 삭제
      await supabase
        .from('interviews')
        .delete()
        .eq('id', insertResult.id);
      console.log('🗑️  테스트 데이터 삭제 완료');
    }

  } catch (error) {
    console.error('❌ 확인 중 오류 발생:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📝 다음 단계:');
  console.log('1. Supabase 대시보드 → SQL Editor 이동');
  console.log('2. sql/fix_all_interview_constraints.sql 파일 내용 복사');
  console.log('3. SQL Editor에서 실행');
  console.log('4. 이 스크립트를 다시 실행하여 확인');
}

checkDatabaseConstraints();