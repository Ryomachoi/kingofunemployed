// 최종 면접 분석 테스트 스크립트
// 수정된 parseInterviewContent 함수 테스트 및 실제 저장 확인

console.log('=== 면접 분석 최종 테스트 ===\n');

// 1. 현재 데이터베이스 상태 확인
console.log('1. 현재 데이터베이스 상태:');
console.log('   - interview_questions 테이블이 비어있는 상태');
console.log('   - parseInterviewContent 함수가 추가됨 (자유 작성 모드 지원)');
console.log('');

// 2. 테스트용 면접 내용
const testContent = `면접관: 자기소개를 해주세요.
답변: 안녕하세요. 저는 3년차 프론트엔드 개발자입니다. React와 TypeScript를 주로 사용하며, 사용자 경험을 중시하는 개발을 해왔습니다.

면접관: 가장 어려웠던 프로젝트는 무엇인가요?
답변: 대용량 데이터를 처리하는 대시보드 프로젝트였습니다. 성능 최적화를 위해 가상화와 메모이제이션을 적용했고, 로딩 시간을 70% 단축시켰습니다.

면접관: 팀워크에서 중요하게 생각하는 것은?
답변: 소통과 투명성입니다. 정기적인 코드 리뷰와 문서화를 통해 팀원들과 지식을 공유하고, 문제가 생겼을 때 빠르게 해결할 수 있도록 노력합니다.`;

console.log('2. 테스트용 면접 내용:');
console.log(testContent);
console.log('');

// 3. parseInterviewContent 함수 시뮬레이션
function parseInterviewContent(content) {
  const pairs = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentQuestion = '';
  let currentAnswer = '';
  let isAnswer = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 질문 패턴 감지
    if (trimmedLine.includes('면접관:') || 
        trimmedLine.includes('Q:') || 
        trimmedLine.includes('질문:') ||
        /^\d+\./g.test(trimmedLine)) {
      
      // 이전 Q&A 저장
      if (currentQuestion && currentAnswer) {
        pairs.push({
          question: currentQuestion.trim(),
          answer: currentAnswer.trim()
        });
      }
      
      currentQuestion = trimmedLine.replace(/^(면접관:|Q:|질문:|\d+\.)\s*/, '');
      currentAnswer = '';
      isAnswer = false;
    }
    // 답변 패턴 감지
    else if (trimmedLine.includes('답변:') || 
             trimmedLine.includes('A:') ||
             trimmedLine.includes('응답:')) {
      currentAnswer = trimmedLine.replace(/^(답변:|A:|응답:)\s*/, '');
      isAnswer = true;
    }
    // 연속된 답변 내용
    else if (isAnswer && currentQuestion) {
      currentAnswer += ' ' + trimmedLine;
    }
    // 연속된 질문 내용
    else if (!isAnswer && currentQuestion) {
      currentQuestion += ' ' + trimmedLine;
    }
  }
  
  // 마지막 Q&A 저장
  if (currentQuestion && currentAnswer) {
    pairs.push({
      question: currentQuestion.trim(),
      answer: currentAnswer.trim()
    });
  }
  
  return pairs;
}

const parsedPairs = parseInterviewContent(testContent);
console.log('3. 파싱 결과:');
parsedPairs.forEach((pair, index) => {
  console.log(`   Q${index + 1}: ${pair.question}`);
  console.log(`   A${index + 1}: ${pair.answer}`);
  console.log('');
});

console.log(`총 ${parsedPairs.length}개의 질문-답변 쌍이 파싱되었습니다.\n`);

// 4. 브라우저 테스트 가이드
console.log('=== 브라우저에서 실제 테스트 방법 ===\n');
console.log('1. 개발 서버 실행:');
console.log('   npm run dev');
console.log('');
console.log('2. 면접 분석 페이지 접속:');
console.log('   http://localhost:3000/interview/analyze');
console.log('');
console.log('3. 테스트 절차:');
console.log('   a) 로그인 확인');
console.log('   b) 면접 정보 입력 (회사명, 직무, 날짜 등)');
console.log('   c) "자유 작성" 모드 선택 (구조화 모드 OFF)');
console.log('   d) 위의 테스트 내용을 textarea에 붙여넣기');
console.log('   e) "분석 시작" 버튼 클릭');
console.log('');
console.log('4. 확인 사항:');
console.log('   a) 브라우저 개발자 도구 > Network 탭에서 API 요청 확인');
console.log('   b) /api/interview/analyze 요청의 payload에 questions_and_answers 배열 확인');
console.log('   c) 응답에서 interviewId 확인');
console.log('   d) 데이터베이스에서 interview_questions 테이블 조회');
console.log('');
console.log('5. 데이터베이스 확인 쿼리:');
console.log('   SELECT * FROM interview_questions ORDER BY created_at DESC LIMIT 10;');
console.log('   SELECT * FROM interviews ORDER BY created_at DESC LIMIT 5;');
console.log('');
console.log('6. 커뮤니티 페이지에서 확인:');
console.log('   a) 면접 후기를 커뮤니티에 공유');
console.log('   b) http://localhost:3000/interview/community 접속');
console.log('   c) 해당 면접 상세 페이지에서 질문-답변 표시 확인');
console.log('');
console.log('=== 예상 결과 ===');
console.log('- parseInterviewContent 함수가 자유 작성 모드에서도 작동');
console.log('- interview_questions 테이블에 3개의 질문-답변이 저장됨');
console.log('- 커뮤니티 상세 페이지에서 질문-답변이 정상 표시됨');
console.log('');
console.log('만약 여전히 문제가 있다면:');
console.log('1. 브라우저 콘솔에서 에러 메시지 확인');
console.log('2. Network 탭에서 API 요청/응답 데이터 확인');
console.log('3. 서버 터미널에서 에러 로그 확인');