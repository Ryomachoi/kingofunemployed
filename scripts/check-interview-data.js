// 특정 면접 ID에 대한 데이터 확인 스크립트
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  console.error(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || 'undefined'}`);
  console.error(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '설정됨' : '없음'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInterviewData(interviewId) {
  console.log(`면접 ID ${interviewId}에 대한 데이터 확인 중...`);
  
  try {
    // 면접 데이터 조회
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single();
    
    if (interviewError) {
      console.error('면접 데이터 조회 오류:', interviewError.message);
      return;
    }
    
    if (!interview) {
      console.error('면접 데이터가 존재하지 않습니다.');
      return;
    }
    
    console.log('면접 데이터:');
    console.log('- ID:', interview.id);
    console.log('- 사용자 ID:', interview.user_id);
    console.log('- 공유 상태 (is_shared):', interview.is_shared);
    console.log('- 분석 유형:', interview.analysis_type);
    console.log('- 생성 날짜:', interview.created_at);
    
    // 질문 및 답변 데이터 조회
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('question_order', { ascending: true });
    
    if (questionsError) {
      console.error('질문 데이터 조회 오류:', questionsError.message);
      return;
    }
    
    console.log('\n질문 및 답변 데이터:');
    if (questions && questions.length > 0) {
      console.log(`총 ${questions.length}개의 질문이 있습니다.`);
      questions.forEach((q, idx) => {
        console.log(`\n[질문 ${idx + 1}]`);
        console.log('- 질문:', q.question);
        console.log('- 답변:', q.answer);
        console.log('- 순서:', q.question_order);
      });
    } else {
      console.log('질문 데이터가 없습니다.');
    }
    
    // RLS 정책 확인을 위한 추가 정보
    console.log('\nRLS 정책 관련 정보:');
    console.log('- interview.is_shared =', interview.is_shared);
    console.log('- interview.user_id =', interview.user_id);
    
  } catch (error) {
    console.error('데이터 확인 중 오류 발생:', error.message);
  }
}

// 명령줄 인수로 면접 ID 받기
const interviewId = process.argv[2];
if (!interviewId) {
  console.error('사용법: node check-interview-data.js <면접_ID>');
  process.exit(1);
}

checkInterviewData(interviewId);