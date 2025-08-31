const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Supabase 설정
const supabaseUrl = 'https://ybvqgqvqjqvqgqvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidnFncXZxanF2cWdxdnEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTU0NzI2NCwiZXhwIjoyMDUxMTIzMjY0fQ.example';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTextareaSaving() {
  console.log('=== Textarea 입력 처리 및 저장 디버깅 ===\n');
  
  try {
    // 1. 현재 interview_questions 테이블 상태 확인
    console.log('1. 현재 interview_questions 테이블 상태:');
    const { data: currentQuestions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (questionsError) {
      console.error('Error fetching interview_questions:', questionsError);
    } else {
      console.log(`총 ${currentQuestions.length}개의 질문 레코드`);
      if (currentQuestions.length > 0) {
        console.log('최근 질문들:');
        currentQuestions.forEach((q, index) => {
          console.log(`  ${index + 1}. Interview ID: ${q.interview_id}`);
          console.log(`     Question: ${q.question?.substring(0, 50)}...`);
          console.log(`     Answer: ${q.answer?.substring(0, 50)}...`);
          console.log(`     Created: ${q.created_at}\n`);
        });
      }
    }
    
    // 2. 최근 interviews 테이블 데이터 확인
    console.log('\n2. 최근 interviews 테이블 데이터:');
    const { data: recentInterviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('id, company, position, questions_and_answers, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (interviewsError) {
      console.error('Error fetching interviews:', interviewsError);
    } else {
      console.log(`총 ${recentInterviews.length}개의 면접 레코드`);
      recentInterviews.forEach((interview, index) => {
        console.log(`  ${index + 1}. ID: ${interview.id}`);
        console.log(`     Company: ${interview.company}`);
        console.log(`     Position: ${interview.position}`);
        console.log(`     Questions_and_answers: ${interview.questions_and_answers ? 'EXISTS' : 'NULL'}`);
        if (interview.questions_and_answers) {
          console.log(`     QA Length: ${JSON.stringify(interview.questions_and_answers).length} characters`);
        }
        console.log(`     Created: ${interview.created_at}\n`);
      });
    }
    
    // 3. API 엔드포인트 테스트용 샘플 데이터 준비
    console.log('\n3. API 테스트용 샘플 데이터:');
    const sampleTextareaContent = `면접관: 자기소개해보세요.
나: 안녕하세요. 저는 3년간 프론트엔드 개발 경험이 있는 개발자입니다. React와 TypeScript를 주로 사용하며, 사용자 경험을 중시하는 개발을 해왔습니다.

면접관: 가장 어려웠던 프로젝트는 무엇인가요?
나: 실시간 채팅 기능을 구현할 때가 가장 어려웠습니다. WebSocket을 처리하면서 메시지 순서와 연결 상태 관리가 복잡했지만, 결국 안정적인 시스템을 구축했습니다.

면접관: 앞으로의 계획은?
나: 백엔드 지식도 확장하여 풀스택 개발자로 성장하고 싶습니다.`;
    
    console.log('샘플 textarea 내용:');
    console.log(sampleTextareaContent);
    console.log(`\n내용 길이: ${sampleTextareaContent.length} characters`);
    
    // 4. 질문-답변 파싱 로직 테스트
    console.log('\n4. 질문-답변 파싱 테스트:');
    const lines = sampleTextareaContent.split('\n').filter(line => line.trim());
    const parsedQA = [];
    let currentQuestion = '';
    let currentAnswer = '';
    let isAnswer = false;
    
    for (const line of lines) {
      if (line.startsWith('면접관:')) {
        if (currentQuestion && currentAnswer) {
          parsedQA.push({ question: currentQuestion, answer: currentAnswer });
        }
        currentQuestion = line.replace('면접관:', '').trim();
        currentAnswer = '';
        isAnswer = false;
      } else if (line.startsWith('나:')) {
        currentAnswer = line.replace('나:', '').trim();
        isAnswer = true;
      } else if (isAnswer) {
        currentAnswer += ' ' + line.trim();
      }
    }
    
    if (currentQuestion && currentAnswer) {
      parsedQA.push({ question: currentQuestion, answer: currentAnswer });
    }
    
    console.log(`파싱된 질문-답변 쌍: ${parsedQA.length}개`);
    parsedQA.forEach((qa, index) => {
      console.log(`  ${index + 1}. Q: ${qa.question}`);
      console.log(`     A: ${qa.answer}\n`);
    });
    
    // 5. 실제 저장 로직 시뮬레이션
    console.log('\n5. 저장 로직 시뮬레이션:');
    console.log('다음 단계에서는 실제 브라우저에서 면접 분석을 수행하여');
    console.log('textarea 입력이 올바르게 처리되는지 확인해야 합니다.');
    console.log('\n브라우저에서 다음을 테스트해보세요:');
    console.log('1. /interview/analyze 페이지로 이동');
    console.log('2. 위의 샘플 내용을 textarea에 입력');
    console.log('3. 회사명, 직무 등 기본 정보 입력');
    console.log('4. "분석하기" 버튼 클릭');
    console.log('5. 개발자 도구에서 네트워크 탭 확인');
    console.log('6. API 요청/응답 데이터 확인');
    
  } catch (error) {
    console.error('디버깅 중 오류 발생:', error);
  }
}

debugTextareaSaving();