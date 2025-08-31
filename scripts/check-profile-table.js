const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfileTable() {
  try {
    console.log('프로필 테이블 구조 확인 중...');
    
    // 1. user_profiles 테이블 구조 확인
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'user_profiles'
          ORDER BY ordinal_position;
        `
      });
    
    if (tableError) {
      console.log('테이블 구조 조회 실패, 직접 조회 시도...');
      
      // 2. 직접 프로필 데이터 조회 시도 (id 컬럼 사용)
      const { data: profilesById, error: profilesByIdError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5);
      
      if (profilesByIdError) {
        console.log('id 컬럼으로 조회 실패:', profilesByIdError.message);
        
        // 3. user_id 컬럼으로 시도
        const { data: profilesByUserId, error: profilesByUserIdError } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(5);
        
        if (profilesByUserIdError) {
          console.log('user_id 컬럼으로 조회 실패:', profilesByUserIdError.message);
        } else {
          console.log('user_id 컬럼으로 조회 성공:', profilesByUserId);
        }
      } else {
        console.log('id 컬럼으로 조회 성공:', profilesById);
      }
    } else {
      console.log('테이블 구조:', tableInfo);
    }
    
    // 4. 사용자 목록 확인
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError || !users || users.length === 0) {
      console.error('사용자를 찾을 수 없습니다:', usersError);
      return;
    }
    
    const userId = users[0].id;
    console.log('\n테스트 사용자 ID:', userId);
    
    // 5. 해당 사용자의 프로필 조회 (id 기준)
    const { data: profileById, error: profileByIdError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileByIdError) {
      console.log('id로 프로필 조회 실패:', profileByIdError.message);
    } else {
      console.log('id로 프로필 조회 성공:', profileById);
    }
    
    // 6. 해당 사용자의 프로필 조회 (user_id 기준)
    const { data: profileByUserId, error: profileByUserIdError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileByUserIdError) {
      console.log('user_id로 프로필 조회 실패:', profileByUserIdError.message);
    } else {
      console.log('user_id로 프로필 조회 성공:', profileByUserId);
    }
    
  } catch (error) {
    console.error('전체 오류:', error);
  }
}

checkProfileTable();