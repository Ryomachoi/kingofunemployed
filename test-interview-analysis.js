const axios = require('axios');

async function testInterviewAnalysis() {
  try {
    console.log('🧪 면접 분석 API 테스트 시작...');
    
    const testData = {
      content: '안녕하세요. 저는 프론트엔드 개발자로 지원했습니다. React와 JavaScript에 대한 경험이 있습니다.',
      analysisType: '개인 분석',
      interviewData: {
        company_name: '테스트 회사',
        position: '프론트엔드 개발자',
        interview_date: new Date().toISOString().split('T')[0],
        interview_type: 'technical',
        difficulty_level: 'medium',
        result: 'pending',
        overall_rating: 3,
        questions_and_answers: [
          {
            question: 'React에 대해 설명해주세요.',
            answer: 'React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.',
            order: 1
          }
        ]
      }
    };

    console.log('📤 요청 데이터:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/interview/analyze', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60초 타임아웃
    });
    
    console.log('✅ 응답 상태:', response.status);
    console.log('📥 응답 데이터:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

testInterviewAnalysis();