const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Supabase 설정
const supabaseUrl = 'https://ixqjqfkqvqxqjqfkqvqx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxZmtxdnF4cWpxZmtxdnF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU0NjU0MSwiZXhwIjoyMDUxMTIyNTQxfQ.example';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewInterview() {
  console.log('🧪 새로운 면접 분석 테스트 시작...');
  
  try {
    // 1. 테스트용 면접 내용 생성
    const testInterviewContent = `면접관: 자기소개를 해보세요.
나: 안녕하세요. 저는 컴퓨터공학을 전공한 신입 개발자입니다. 대학교에서 웹 개발 프로젝트를 여러 개 진행했고, React와 Node.js를 주로 사용했습니다.

면접관: 왜 우리 회사에 지원하셨나요?
나: 귀사의 혁신적인 기술과 성장 가능성에 매력을 느꼈습니다. 특히 AI 기술을 활용한 서비스 개발에 참여하고 싶습니다.

면접관: 팀워크 경험이 있나요?
나: 네, 대학교 졸업 프로젝트에서 4명의 팀원과 함께 웹 애플리케이션을 개발했습니다. 저는 백엔드 개발을 담당했고, 팀원들과의 소통을 통해 성공적으로 프로젝트를 완료했습니다.`;
    
    const testData = {
      content: testInterviewContent,
      analysisType: 'comprehensive',
      interviewData: {
        company_name: '테스트 회사',
        position: '프론트엔드 개발자',
        interview_date: '2024-01-15',
        interview_type: 'in_person',
        difficulty_level: 'medium',
        result: 'pending',
        overall_rating: 4,
        questions_and_answers: [
          {
            question: '자기소개를 해보세요.',
            answer: '안녕하세요. 저는 컴퓨터공학을 전공한 신입 개발자입니다. 대학교에서 웹 개발 프로젝트를 여러 개 진행했고, React와 Node.js를 주로 사용했습니다.'
          },
          {
            question: '왜 우리 회사에 지원하셨나요?',
            answer: '귀사의 혁신적인 기술과 성장 가능성에 매력을 느꼈습니다. 특히 AI 기술을 활용한 서비스 개발에 참여하고 싶습니다.'
          },
          {
            question: '팀워크 경험이 있나요?',
            answer: '네, 대학교 졸업 프로젝트에서 4명의 팀원과 함께 웹 애플리케이션을 개발했습니다. 저는 백엔드 개발을 담당했고, 팀원들과의 소통을 통해 성공적으로 프로젝트를 완료했습니다.'
          }
        ]
      }
    };
    
    console.log('📤 API 호출 데이터:', JSON.stringify(testData, null, 2));
    
    // 2. API 호출 (실제 서버가 실행 중이어야 함)
    try {
      const response = await axios.post('http://localhost:3000/api/interview/analyze', testData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('✅ API 응답 성공:', response.status);
      console.log('📊 응답 데이터:', JSON.stringify(response.data, null, 2));
      
      if (response.data.interviewId) {
        console.log('🆔 생성된 면접 ID:', response.data.interviewId);
        
        // 3. 데이터베이스에서 저장된 데이터 확인
        await checkSavedData(response.data.interviewId);
      } else {
        console.log('⚠️ 면접 ID가 응답에 없습니다.');
      }
      
    } catch (apiError) {
      if (apiError.code === 'ECONNREFUSED') {
        console.log('🔌 서버가 실행되지 않았습니다. 서버를 먼저 시작해주세요.');
        console.log('💡 대신 데이터베이스 직접 저장 테스트를 진행합니다...');
        await testDirectDatabaseSave(testData);
      } else {
        console.error('❌ API 호출 실패:', apiError.message);
        if (apiError.response) {
          console.error('응답 상태:', apiError.response.status);
          console.error('응답 데이터:', apiError.response.data);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  }
}

async function testDirectDatabaseSave(testData) {
  console.log('\n🗄️ 데이터베이스 직접 저장 테스트...');
  
  try {
    // 1. interviews 테이블에 기본 정보 저장
    const { data: savedInterview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        company_name: testData.interviewData.company_name,
        position: testData.interviewData.position,
        interview_date: testData.interviewData.interview_date,
        interview_type: testData.interviewData.interview_type,
        difficulty_level: testData.interviewData.difficulty_level,
        result: testData.interviewData.result,
        overall_rating: testData.interviewData.overall_rating,
        ai_feedback: '테스트 AI 피드백',
        tips: '테스트 팁',
        is_shared: false
      })
      .select()
      .single();
    
    if (interviewError) {
      console.error('❌ interviews 테이블 저장 실패:', interviewError);
      return;
    }
    
    console.log('✅ interviews 테이블 저장 성공:', savedInterview.id);
    
    // 2. interview_questions 테이블에 질문과 답변 저장
    if (testData.interviewData.questions_and_answers && testData.interviewData.questions_and_answers.length > 0) {
      const questionsToInsert = testData.interviewData.questions_and_answers.map((qa, index) => ({
        interview_id: savedInterview.id,
        question: qa.question,
        answer: qa.answer,
        question_order: index + 1
      }));
      
      const { data: savedQuestions, error: questionsError } = await supabase
        .from('interview_questions')
        .insert(questionsToInsert)
        .select();
      
      if (questionsError) {
        console.error('❌ interview_questions 테이블 저장 실패:', questionsError);
      } else {
        console.log('✅ interview_questions 테이블 저장 성공:', savedQuestions.length, '개 질문');
        console.log('📋 저장된 질문들:', savedQuestions.map(q => ({ question: q.question, answer: q.answer })));
      }
    }
    
    // 3. 저장된 데이터 확인
    await checkSavedData(savedInterview.id);
    
  } catch (error) {
    console.error('❌ 직접 데이터베이스 저장 실패:', error);
  }
}

async function checkSavedData(interviewId) {
  console.log('\n🔍 저장된 데이터 확인...');
  
  try {
    // 1. interviews 테이블 확인
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single();
    
    if (interviewError) {
      console.error('❌ interviews 조회 실패:', interviewError);
    } else {
      console.log('📊 저장된 면접 정보:', {
        id: interview.id,
        company_name: interview.company_name,
        position: interview.position,
        interview_date: interview.interview_date,
        questions_and_answers: interview.questions_and_answers
      });
    }
    
    // 2. interview_questions 테이블 확인
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('question_order');
    
    if (questionsError) {
      console.error('❌ interview_questions 조회 실패:', questionsError);
    } else {
      console.log('📋 저장된 질문과 답변:', questions.length, '개');
      questions.forEach((q, index) => {
        console.log(`${index + 1}. 질문: ${q.question}`);
        console.log(`   답변: ${q.answer}`);
      });
    }
    
    // 3. 전체 interview_questions 테이블 상태 확인
    const { data: allQuestions, error: allQuestionsError } = await supabase
      .from('interview_questions')
      .select('interview_id, question, answer');
    
    if (allQuestionsError) {
      console.error('❌ 전체 interview_questions 조회 실패:', allQuestionsError);
    } else {
      console.log('\n📊 전체 interview_questions 테이블 상태:');
      console.log('총 질문 수:', allQuestions.length);
      if (allQuestions.length > 0) {
        console.log('면접별 질문 수:');
        const questionsByInterview = allQuestions.reduce((acc, q) => {
          acc[q.interview_id] = (acc[q.interview_id] || 0) + 1;
          return acc;
        }, {});
        Object.entries(questionsByInterview).forEach(([id, count]) => {
          console.log(`  면접 ${id}: ${count}개 질문`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 데이터 확인 중 오류:', error);
  }
}

// 스크립트 실행
testNewInterview().catch(console.error);