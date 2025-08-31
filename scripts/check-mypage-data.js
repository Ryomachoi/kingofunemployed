const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMyPageData() {
  try {
    console.log('마이페이지 데이터 확인 중...');
    
    // 1. 모든 면접 데이터 확인 (최근 생성된 것부터)
    const { data: allInterviews, error: allInterviewsError } = await supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allInterviewsError) {
      console.error('전체 면접 데이터 조회 오류:', allInterviewsError);
    } else {
      console.log('\n=== 전체 면접 데이터 (최근 10개) ===');
      console.log(`총 ${allInterviews.length}개의 면접 데이터`);
      
      if (allInterviews.length > 0) {
        allInterviews.forEach((interview, index) => {
          console.log(`\n${index + 1}. 면접 ID: ${interview.id}`);
          console.log(`   사용자 ID: ${interview.user_id}`);
          console.log(`   회사: ${interview.company_name}`);
          console.log(`   직무: ${interview.position}`);
          console.log(`   면접 유형: ${interview.interview_type}`);
          console.log(`   면접 날짜: ${interview.interview_date}`);
          console.log(`   결과: ${interview.result}`);
          console.log(`   생성일: ${interview.created_at}`);
          console.log(`   공유 여부: ${interview.is_shared}`);
        });
      } else {
        console.log('면접 데이터가 없습니다.');
      }
    }
    
    // 2. 사용자 목록 확인
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError || !users || users.length === 0) {
      console.error('사용자를 찾을 수 없습니다:', usersError);
      return;
    }
    
    const userId = users[0].id;
    console.log('\n테스트 사용자 ID:', userId);
    
    // 3. 해당 사용자의 면접 데이터 확인
    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (interviewsError) {
      console.error('사용자 면접 데이터 조회 오류:', interviewsError);
    } else {
      console.log('\n=== 사용자 면접 데이터 ===');
      console.log(`총 ${interviews.length}개의 면접 데이터`);
      
      if (interviews.length > 0) {
        interviews.forEach((interview, index) => {
          console.log(`\n${index + 1}. 면접 ID: ${interview.id}`);
          console.log(`   회사: ${interview.company_name}`);
          console.log(`   직무: ${interview.position}`);
          console.log(`   면접 유형: ${interview.interview_type}`);
          console.log(`   면접 날짜: ${interview.interview_date}`);
          console.log(`   결과: ${interview.result}`);
          console.log(`   생성일: ${interview.created_at}`);
          console.log(`   공유 여부: ${interview.is_shared}`);
        });
      } else {
        console.log('해당 사용자의 면접 데이터가 없습니다.');
      }
    }
    
    // 4. 프로필 데이터 확인 (올바른 컬럼명 사용)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.log('\n=== 프로필 데이터 ===');
      console.log('프로필 조회 오류:', profileError.message);
    } else {
      console.log('\n=== 프로필 데이터 ===');
      console.log('프로필 존재:', !!profile);
      if (profile) {
        console.log('닉네임:', profile.nickname);
        console.log('표시명:', profile.display_name);
      }
    }
    
  } catch (error) {
    console.error('전체 오류:', error);
  }
}

checkMyPageData();