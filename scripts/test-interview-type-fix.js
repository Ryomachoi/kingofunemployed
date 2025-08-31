const axios = require('axios');

// 면접 분석 API 테스트
async function testInterviewAnalysis() {
  try {
    console.log('면접 분석 API 테스트 시작...');
    
    const testData = {
      content: '안녕하세요. 저는 프론트엔드 개발자로 지원하게 되었습니다.',
      analysisType: '일반 분석',
      interviewData: {
        company_name: '테스트 회사',
        position: '프론트엔드 개발자',
        interview_date: '2024-01-15',
        interview_type: '화상면접', // 한국어 값으로 테스트
        difficulty_level: '보통',
        result: '합격',
        overall_rating: 4,
        questions_and_answers: [
          {
            question: '자기소개를 해주세요.',
            answer: '안녕하세요. 저는 프론트엔드 개발자입니다.'
          }
        ]
      }
    };
    
    console.log('전송할 데이터:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/interview/analyze', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
    
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('테스트 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

testInterviewAnalysis();