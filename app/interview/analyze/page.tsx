"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios"; // axios import 추가

export default function InterviewAnalyzePage() {
  const [interviewContent, setInterviewContent] = useState("");
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStructuredMode, setIsStructuredMode] = useState(false);
  const [qnaPairs, setQnaPairs] = useState([{ question: "", answer: "" }]);
  
  // 새로 추가된 면접 정보 상태
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewResult, setInterviewResult] = useState("");
  const [overallRating, setOverallRating] = useState("");
  
  // 공유 옵션 상태 - 기본값은 '개인 분석'
  const [shareOption, setShareOption] = useState("personal"); // "personal" 또는 "community"

  const [submitting, setSubmitting] = useState(false);

  const toggleStructuredMode = () => {
    setIsStructuredMode(!isStructuredMode);
    // 모드 전환 시 내용 초기화
    setInterviewContent("");
    setQnaPairs([{ question: "", answer: "" }]);
  };

  const addQnAPair = () => {
    setQnaPairs([...qnaPairs, { question: "", answer: "" }]);
  };

  const removeQnAPair = (index: number) => {
    if (qnaPairs.length > 1) {
      setQnaPairs(qnaPairs.filter((_, i) => i !== index));
    }
  };

  const updateQnAPair = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = qnaPairs.map((pair, i) => 
      i === index ? { ...pair, [field]: value } : pair
    );
    setQnaPairs(updated);
  };

  // 질문 텍스트에서 불필요한 특수문자 제거하는 함수
  const cleanQuestionText = (text: string): string => {
    return text
      .replace(/^[.\-•*]+\s*/, '') // 앞의 점, 대시, 불릿 포인트 제거
      .replace(/^\d+[.)\s]+/, '') // 앞의 숫자와 점/괄호 제거 (예: "1. ", "2) ")
      .replace(/^[가-힣]\)\s*/, '') // 한글 번호 제거 (예: "가) ", "나) ")
      .replace(/^Q\d*[.)\s]*:?\s*/i, '') // Q1, Q2 등 제거
      .trim();
  };

  // 자유 작성 모드의 textarea 내용을 질문-답변으로 파싱하는 함수
  const parseInterviewContent = (content: string): { question: string; answer: string }[] => {
    if (!content.trim()) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const parsedQA: { question: string; answer: string }[] = [];
    let currentQuestion = '';
    let currentAnswer = '';
    let isAnswer = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 면접관 질문 패턴 감지
      if (trimmedLine.match(/^(면접관|질문|Q|interviewer)\s*[:：]?\s*/i)) {
        // 이전 질문-답변 쌍이 있으면 저장
        if (currentQuestion && currentAnswer) {
          parsedQA.push({ 
            question: cleanQuestionText(currentQuestion.trim()), 
            answer: currentAnswer.trim() 
          });
        }
        currentQuestion = trimmedLine.replace(/^(면접관|질문|Q|interviewer)\s*[:：]?\s*/i, '').trim();
        currentAnswer = '';
        isAnswer = false;
      }
      // 답변 패턴 감지
      else if (trimmedLine.match(/^(나|답변|A|answer|저는|제가)\s*[:：]?\s*/i)) {
        currentAnswer = trimmedLine.replace(/^(나|답변|A|answer|저는|제가)\s*[:：]?\s*/i, '').trim();
        isAnswer = true;
      }
      // 연속된 답변 내용
      else if (isAnswer && currentAnswer) {
        currentAnswer += ' ' + trimmedLine;
      }
      // 연속된 질문 내용 또는 일반 텍스트를 질문으로 처리
      else if (!isAnswer) {
        if (currentQuestion) {
          currentQuestion += ' ' + trimmedLine;
        } else {
          // 질문 패턴이 없는 경우 첫 번째 라인을 질문으로 간주
          currentQuestion = trimmedLine;
        }
      }
    }
    
    // 마지막 질문-답변 쌍 저장
    if (currentQuestion && currentAnswer) {
      parsedQA.push({ 
        question: cleanQuestionText(currentQuestion.trim()), 
        answer: currentAnswer.trim() 
      });
    }
    
    console.log('🔍 파싱된 질문-답변:', parsedQA);
    return parsedQA;
  };

  const handleAnalyze = async () => {
    // 기본 정보 검증
    if (!company.trim() || !position.trim()) {
      setError("회사명과 지원 직무를 입력해주세요.");
      return;
    }
    
    setIsAnalyzing(true);
    setSubmitting(true);
    setAnalysisResult(null);
    setError(null);
    
    try {
      // 구조화된 모드일 때 qnaPairs를 문자열로 변환
      let contentToSend = interviewContent;
      let questionsAndAnswers: { question: string; answer: string }[];
      
      if (isStructuredMode) {
        const validPairs = qnaPairs.filter(pair => pair.question.trim() || pair.answer.trim());
        contentToSend = validPairs
          .map((pair, index) => {
            return `질문 ${index + 1}: ${pair.question}\n답변 ${index + 1}: ${pair.answer}`;
          })
          .join('\n\n');
        questionsAndAnswers = validPairs;
      } else {
        // 자유 작성 모드에서 textarea 내용을 질문-답변으로 파싱
        questionsAndAnswers = parseInterviewContent(interviewContent);
      }

      // 공백/줄바꿈 정규화 및 길이 검증 추가
      const normalized = (contentToSend || '').replace(/\r\n/g, '\n').trim();
      console.log('🔍 전송할 내용 길이:', normalized.length);
      if (!normalized) {
        setIsAnalyzing(false);
        setSubmitting(false);
        setError('면접 내용이 비어있습니다. 내용을 입력해 주세요.');
        return;
      }
      
      console.log('🔍 전송할 내용:', normalized);
      console.log('🔍 구조화된 모드:', isStructuredMode);
      console.log('🔍 qnaPairs:', qnaPairs);
      
      const response = await axios.post('/api/interview/analyze', {
        content: normalized,
        analysisType,
        shareOption, // 공유 옵션 추가
        // 새로 추가된 면접 정보
        interviewData: {
          company_name: company,
          position: position,
          interview_date: interviewDate || null,
          interview_type: interviewType ? (
            interviewType === '화상면접' ? 'video' :
            interviewType === '대면면접' ? 'in_person' :
            interviewType === '전화면접' ? 'phone' :
            interviewType === '기타' ? 'other' :
            interviewType
          ) : null,
          difficulty_level: difficulty || null,
          result: interviewResult || null,
          overall_rating: overallRating ? parseInt(overallRating) : null,

          questions_and_answers: questionsAndAnswers
        }
      });
      
      console.log('🔍 API 응답 전체:', response.data);
      console.log('🔍 API 응답 데이터:', response.data.data);
      console.log('🔍 메타데이터:', response.data.metadata);
      
      if (response.data.success) {
        const data = response.data.data;
        
        // 새로운 스키마에 맞춘 디버깅 로그
        console.log('📊 받은 데이터 구조 (새 스키마):', {
          total_score: data.total_score,
          areas: data.areas,
          general_advice: data.general_advice,
          rawAnalysis: data.rawAnalysis,
          parseError: data.parseError
        });
        
        // 파싱 에러 체크 로직 수정
        if (data.parseError || !data.total_score || !data.areas || !data.general_advice) {
          // JSON 파싱 실패 시 - 원본 텍스트 표시
          const completeAnalysisResult = {
            rawAnalysis: data.rawAnalysis || data.message || '분석 결과를 받지 못했습니다.',
            parseError: true,
            message: data.message || '구조화된 분석 실패 - 원본 텍스트로 제공',
            interviewId: response.data.interviewId
          };
          setAnalysisResult(completeAnalysisResult);
          setInterviewId(response.data.interviewId || null);
          console.log('⚠️ JSON 파싱 실패, 원본 텍스트 표시');
        } else {
          // 새로운 스키마에 맞춘 정상 파싱 처리
          const completeAnalysisResult = {
            total_score: data.total_score || 0,
            areas: data.areas || {},
            general_advice: data.general_advice || '',
            conversationalAnalysis: generateConversationalSummary(data),
            dynamicSummary: generateDynamicSummary(data),
            interviewId: response.data.interviewId
          };
          setAnalysisResult(completeAnalysisResult);
          setInterviewId(response.data.interviewId || null);
          console.log('✅ 새 스키마 구조화된 데이터 설정 완료');
        }
        
        // 경고 메시지가 있는 경우 표시
        if (response.data.warning) {
          console.warn(response.data.warning);
          alert(`⚠️ ${response.data.warning}`);
        }
      } else {
        setError(response.data.error || '분석 결과를 받아오지 못했습니다.');
        console.error('❌ API 호출 실패:', response.data.error);
      }
    } catch (err: any) {
      console.error('❌ 분석 오류:', err);
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);
      }
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
      setSubmitting(false);
    }
  };

  // 새로운 스키마에 맞춘 구어체 요약 생성 함수
  const generateConversationalSummary = (data: any) => {
    const score = data.total_score || 0;
    const areas = data.areas || {};
    
    let summary = `안녕하세요! 면접 분석이 완료되었습니다. 😊\n\n`;
    
    if (score >= 80) {
      summary += `와! 정말 훌륭한 면접이었네요! ${score}점이라는 높은 점수를 받으셨어요. 👏\n\n`;
    } else if (score >= 60) {
      summary += `좋은 면접이었습니다! ${score}점으로 양호한 수준이에요. 조금만 더 보완하면 완벽할 것 같아요. 💪\n\n`;
    } else {
      summary += `${score}점으로 아직 개선할 부분이 있어 보여요. 하지만 걱정하지 마세요! 함께 발전해 나가면 됩니다. 🌱\n\n`;
    }
    
    // 영역별 분석 요약
    const areaNames = {
      '논리적 구조': '논리적 구조',
      '커뮤니케이션': '커뮤니케이션',
      '전문성': '전문성',
      '자신감': '자신감'
    };
    
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];
    
    Object.entries(areas).forEach(([key, value]: [string, any]) => {
      if (value?.score >= 70) {
        strongAreas.push(areaNames[key as keyof typeof areaNames] || key);
      } else if (value?.score < 50) {
        weakAreas.push(areaNames[key as keyof typeof areaNames] || key);
      }
    });
    
    if (strongAreas.length > 0) {
      summary += `특히 ${strongAreas.join(', ')} 부분에서 정말 좋았어요!\n\n`;
    }
    
    if (weakAreas.length > 0) {
      summary += `${weakAreas.join(', ')} 부분을 조금 더 신경 쓰시면 좋을 것 같아요.\n\n`;
    }
    
    summary += `전체적으로 보면, 면접에서 보여주신 모습이 인상적이었어요. 계속해서 발전하는 모습 기대하겠습니다! 🚀`;
    
    return summary;
  };
  
  // 새로운 스키마에 맞춘 동적 요약 생성 함수
  const generateDynamicSummary = (data: any) => {
    const score = data.total_score || 0;
    const areas = data.areas || {};
    
    return {
      scoreLevel: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement',
      scoreMessage: score >= 80 ? '탁월한 성과입니다!' : score >= 60 ? '좋은 결과예요!' : '더 발전할 수 있어요!',
      areaCount: Object.keys(areas).length,
      averageAreaScore: Object.values(areas).length > 0 ? 
        Math.round(Object.values(areas).reduce((sum: number, area: any) => sum + (area?.score || 0), 0) / Object.values(areas).length) : 0,
      hasGeneralAdvice: !!(data.general_advice && data.general_advice.trim())
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/interview" 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                AI 피드백 받기
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                면접 내용을 입력하고 AI 분석을 받아보세요
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!analysisResult ? (
          <div className="space-y-6">
            {/* 기본 면접 정보 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  기본 면접 정보
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">회사명 *</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="회사명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">지원 직무 *</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      required
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="지원 직무를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">면접 날짜</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">면접 유형</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">선택하세요</option>
                      <option value="화상면접">화상면접</option>
                      <option value="대면면접">대면면접</option>
                      <option value="전화면접">전화면접</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 면접 설정 및 결과 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  면접 설정 및 결과
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">난이도</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">선택하세요</option>
                      <option value="easy">쉬움</option>
                      <option value="medium">보통</option>
                      <option value="hard">어려움</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">면접 결과</label>
                    <select
                      value={interviewResult}
                      onChange={(e) => setInterviewResult(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">선택하세요</option>
                      <option value="pass">합격</option>
                      <option value="fail">불합격</option>
                      <option value="pending">대기중</option>
                      <option value="in_progress">진행중</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">전체 평점</label>
                    <select
                      value={overallRating}
                      onChange={(e) => setOverallRating(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">선택하세요</option>
                      <option value="1">⭐ 1점 - 매우 나쁨</option>
                      <option value="2">⭐⭐ 2점 - 나쁨</option>
                      <option value="3">⭐⭐⭐ 3점 - 보통</option>
                      <option value="4">⭐⭐⭐⭐ 4점 - 좋음</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5점 - 매우 좋음</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
            
            {/* 면접 후기 공개 설정 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  면접 후기 공개 설정
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      id="personal"
                      name="shareOption"
                      type="radio"
                      value="personal"
                      checked={shareOption === "personal"}
                      onChange={(e) => setShareOption(e.target.value)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="personal" className="block text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                        개인 분석만
                      </label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        나의 공개되지 않으며, 개인 피드백 제공됩니다
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      id="community"
                      name="shareOption"
                      type="radio"
                      value="community"
                      checked={shareOption === "community"}
                      onChange={(e) => setShareOption(e.target.value)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="community" className="block text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                        익명 후기 공유
                      </label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        개인정보를 제외하고 익명으로 커뮤니티에 공유됩니다
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 면접 내용 작성 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  면접 내용 작성
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    질문-답변 구조로 정리할까요?
                  </span>
                  <button
                    onClick={toggleStructuredMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isStructuredMode 
                        ? 'bg-purple-600' 
                        : 'bg-slate-200 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isStructuredMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {!isStructuredMode ? (
                  // 자유 작성 모드
                  <>
                    <textarea
                      value={interviewContent}
                      onChange={(e) => setInterviewContent(e.target.value)}
                      placeholder="면접 내용을 자유롭게 입력해주세요. 질문과 답변을 모두 포함해서 작성하시면 더 정확한 분석이 가능합니다.\n\nex) \n면접관: 자기소개해보세요\n나: 저는 마켜팅을 사랑합니다...\n면접관의 반응: 고개를 끄덕였어요"
                      className="w-full h-80 p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <div className="mt-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {interviewContent.length} 글자
                      </span>
                    </div>
                  </>
                ) : (
                  // 구조화된 입력 모드
                  <div className="space-y-6">
                    {qnaPairs.map((pair, index) => (
                      <div key={index} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            질문 {index + 1}
                          </h3>
                          {qnaPairs.length > 1 && (
                            <button
                              onClick={() => removeQnAPair(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={pair.question}
                          onChange={(e) => updateQnAPair(index, 'question', e.target.value)}
                          placeholder="예: 자기소개해주세요"
                          className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            답변 {index + 1}
                          </h3>
                          <textarea
                            value={pair.answer}
                            onChange={(e) => updateQnAPair(index, 'answer', e.target.value)}
                            placeholder="답변을 입력해주세요..."
                            className="w-full h-32 p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={addQnAPair}
                      className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      + 질문-답변 추가
                    </button>
                  </div>
                )}
              </div>
            </div>



            {/* AI 분석 시작 버튼 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  AI가 답변 품질, 논리성, 표현력을 종합적으로 분석합니다
                </div>
              </div>
              
              {/* 에러 메시지 표시 */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !company.trim() || !position.trim() || (!isStructuredMode && !interviewContent.trim()) || (isStructuredMode && !qnaPairs.some(pair => pair.question.trim() || pair.answer.trim()))}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI가 면접을 분석하고 저장하고 있습니다...</span>
                  </div>
                ) : (
                  "AI 분석 및 저장하기"
                )}
              </button>
              
              {/* 분석 중일 때 추가 안내 메시지 */}
              {isAnalyzing && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      ⏳ 분석이 완료될 때까지 잠시만 기다려주세요
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      일반적으로 30초-1분 정도 소요됩니다
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // 분석 결과 표시 - 완전히 준비된 후에만 표시
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  AI 면접 분석 완료
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  답변을 종합적으로 분석했습니다
                </p>
              </div>
            </div>

            {/* 종합 점수 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  종합 점수
                </h3>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeDasharray={`${((analysisResult?.total_score || 0) / 100) * 314} 314`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {analysisResult?.total_score || 0}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        / 100점
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {(analysisResult?.total_score || 0) >= 80 ? '우수한 답변' : 
                   (analysisResult?.total_score || 0) >= 60 ? '양호한 답변' : '개선 필요'}
                </div>
              </div>
            </div>

            {/* 영역별 상세 분석 */}
            {analysisResult?.areas && Object.keys(analysisResult.areas).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 text-center">
                  영역별 상세 분석
                </h3>
                <div className="grid gap-6">
                  {Object.entries(analysisResult.areas).map(([areaName, areaData]: [string, any]) => (
                    <div key={areaName} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {areaName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {areaData?.score || 0}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">점</div>
                        </div>
                      </div>
                      
                      {/* 개선점 */}
                      {areaData?.negative_points && areaData.negative_points.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            개선이 필요한 점
                          </h5>
                          <div className="space-y-2">
                            {areaData.negative_points.map((point: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{point}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 실용적 조언 */}
                      {areaData?.practical_advice && (
                        <div className="mb-4">
                          <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            실용적 조언
                          </h5>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">{areaData.practical_advice}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* 면접관 인상 */}
                      {areaData?.interviewer_impression && (
                        <div>
                          <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            면접관이 받을 인상
                          </h5>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">{areaData.interviewer_impression}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 종합 조언 */}
            {analysisResult?.general_advice && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    💡 종합 조언
                  </h4>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-slate-600 dark:text-slate-400">{analysisResult.general_advice}</p>
                </div>
              </div>
            )}

            {/* 원본 AI 분석 (fallback) */}
            {analysisResult?.rawAnalysis && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    AI 상세 분석
                  </h4>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-slate-600 dark:text-slate-400 text-sm font-mono leading-relaxed">
                    {analysisResult.rawAnalysis}
                  </pre>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setInterviewId(null);
                  setInterviewContent("");
                  setQnaPairs([{ question: "", answer: "" }]);
                  setCompany("");
                  setPosition("");
                  setInterviewDate("");
                  setInterviewType("");
                  setDifficulty("");
                  setInterviewResult("");
                  setOverallRating("");

                }}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                새로운 분석 시작
              </button>
              {interviewId && (
                <Link
                  href={`/interview/${interviewId}`}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-center"
                >
                  상세 면접 후기 보기
                </Link>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}