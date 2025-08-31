const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConstraints() {
  try {
    console.log('현재 데이터베이스 제약조건 확인 중...');
    
    // 1. 직접 SQL로 제약조건 확인
    const { data: constraints, error: constraintError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT conname, pg_get_constraintdef(oid) as definition
          FROM pg_constraint 
          WHERE conrelid = 'interviews'::regclass 
          AND contype = 'c'
          AND conname LIKE '%interview_type%';
        `
      });
    
    if (constraintError) {
      console.log('제약조건 직접 조회 실패:', constraintError.message);
    } else {
      console.log('제약조건 정보:', constraints);
    }
    
    // 2. 테스트 삽입으로 확인
    console.log('\n=== 테스트 삽입으로 제약조건 확인 ===');
    
    // 사용자 ID 가져오기
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError || !users || users.length === 0) {
      console.error('사용자를 찾을 수 없습니다:', usersError);
      return;
    }
    
    const userId = users[0].id;
    console.log('테스트용 사용자 ID:', userId);
    
    // 각 interview_type 값 테스트
    const testTypes = ['video', 'in_person', 'phone', 'other', 'technical', 'behavioral', 'coding', 'presentation', '화상면접', '대면면접'];
    
    for (const type of testTypes) {
      try {
        const { data, error } = await supabase
          .from('interviews')
          .insert({
            user_id: userId,
            company_name: '테스트 회사',
            position: '테스트 포지션',
            interview_date: '2024-01-15',
            interview_type: type,
            questions_and_answers: [{ question: '테스트', answer: '테스트' }],
            ai_feedback: { summary: '테스트' }
          })
          .select('id')
          .single();
        
        if (error) {
          console.log(`❌ '${type}': ${error.message}`);
        } else {
          console.log(`✅ '${type}': 성공 (ID: ${data.id})`);
          // 테스트 데이터 삭제
          await supabase.from('interviews').delete().eq('id', data.id);
        }
      } catch (err) {
        console.log(`❌ '${type}': ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('전체 오류:', error);
  }
}

checkConstraints();