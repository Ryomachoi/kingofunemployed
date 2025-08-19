"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios"; // axios import 추가

export default function InterviewAnalyzePage() {
  const [interviewContent, setInterviewContent] = useState("");
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null); // 이 줄 추가
  const [isStructuredMode, setIsStructuredMode] = useState(false);
  const [qnaPairs, setQnaPairs] = useState([{ question: "", answer: "" }]);

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);
    try {
      const result = await axios.post('/api/interview/analyze', {
        content: interviewContent,
        analysisType,
      });
      
      console.log('🔍 API 응답 전체:', result.data);
      console.log('🔍 API 응답 데이터:', result.data.data);
      console.log('🔍 메타데이터:', result.data.metadata);
      
      if (result.data.success) {
        const data = result.data.data;
        
        // 새로운 스키마에 맞춘 디버깅 로그
        console.log('📊 받은 데이터 구조 (새 스키마):', {
          total_score: data.total_score,
          areas: data.areas,
          general_advice: data.general_advice,
          rawAnalysis: data.rawAnalysis,
          parseError: data.parseError
        });
        
        if (result.data.metadata?.hasParseError || data.parseError) {
          // JSON 파싱 실패 시 - 원본 텍스트 표시
          const completeAnalysisResult = {
            rawAnalysis: data.rawAnalysis || data.message || '분석 결과를 받지 못했습니다.',
            parseError: true,
            message: data.message || '구조화된 분석 실패 - 원본 텍스트로 제공',
          };
          setAnalysisResult(completeAnalysisResult);
          console.log('⚠️ JSON 파싱 실패, 원본 텍스트 표시');
        } else {
          // 새로운 스키마에 맞춘 정상 파싱 처리
          const completeAnalysisResult = {
            total_score: data.total_score || 0,
            areas: data.areas || {},
            general_advice: data.general_advice || '',
            conversationalAnalysis: generateConversationalSummary(data),
            dynamicSummary: generateDynamicSummary(data),
          };
          setAnalysisResult(completeAnalysisResult);
          console.log('✅ 새 스키마 구조화된 데이터 설정 완료');
        }
      } else {
        setError(result.data.error || '분석 결과를 받아오지 못했습니다.');
        console.error('❌ API 호출 실패:', result.data.error);
      }
    } catch (err) {
      console.error('❌ 분석 오류:', err);
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);
      }
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 새로운 스키마에 맞춘 구어체 요약 생성 함수
  const generateConversationalSummary = (data) => {
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
    
    const strongAreas = [];
    const weakAreas = [];
    
    Object.entries(areas).forEach(([key, value]) => {
      if (value?.score >= 70) {
        strongAreas.push(areaNames[key] || key);
      } else if (value?.score < 50) {
        weakAreas.push(areaNames[key] || key);
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
  const generateDynamicSummary = (data) => {
    const score = data.total_score || 0;
    const areas = data.areas || {};
    
    return {
      scoreLevel: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement',
      scoreMessage: score >= 80 ? '탁월한 성과입니다!' : score >= 60 ? '좋은 결과예요!' : '더 발전할 수 있어요!',
      areaCount: Object.keys(areas).length,
      averageAreaScore: Object.values(areas).length > 0 ? 
        Math.round(Object.values(areas).reduce((sum, area) => sum + (area?.score || 0), 0) / Object.values(areas).length) : 0,
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

            {/* 면접 후기 공개 설정 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">
                  면접 후기 공개 설정
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="analysisType"
                    value="개인 분석만"
                    checked={analysisType === "개인 분석만"}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="mt-1 w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      개인 분석만
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      나의 공개되지 않으며, 개인 피드백만 제공됩니다
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="analysisType"
                    value="익명 후기 공유"
                    checked={analysisType === "익명 후기 공유"}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="mt-1 w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      익명 후기 공유
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      개인정보를 제외하고 익명으로 커뮤니티에 공유됩니다
                    </div>
                  </div>
                </label>
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
                disabled={isAnalyzing || (!isStructuredMode && !interviewContent.trim()) || (isStructuredMode && !qnaPairs.some(pair => pair.question.trim() || pair.answer.trim()))}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI가 면접 내용을 분석하고 있습니다...</span>
                  </div>
                ) : (
                  "AI 분석 시작"
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
                  {Object.entries(analysisResult.areas).map(([areaName, areaData]) => (
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
                            {areaData.negative_points.map((point, index) => (
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
                  setInterviewContent("");
                  setQnaPairs([{ question: "", answer: "" }]);
                }}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                새로운 분석 시작
              </button>
              <button
                onClick={() => {
                  // 결과 공유 기능 (추후 구현)
                  alert("결과 공유 기능은 준비 중입니다.");
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                결과 공유하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 아래 모든 코드를 완전히 삭제하세요
// 결과 렌더링 개선 (컴포넌트 함수 내부에서만 사용)
// (컴포넌트 바깥의 아래 코드 삭제)
// {analysisResult && (
//   <div>
//     {analysisResult.parseError ? (
//       <div className="bg-red-50 p-4 rounded">
//         <div>구조화된 분석 실패 - 원본 텍스트로 제공</div>
//         <pre>{analysisResult.rawAnalysis}</pre>
//       </div>
//     ) : (
//       <>
//         <section>
//           <h3>AI 면접관의 한마디</h3>
//           <p>{analysisResult.conversationalAnalysis}</p>
//         </section>
//         <section>
//           <h4>동적 요약</h4>
//           <ul>
//             <li>종합 점수: {analysisResult.dynamicSummary.score}</li>
//             <li>강점 개수: {analysisResult.dynamicSummary.strengthCount}</li>
//             <li>약점 개수: {analysisResult.dynamicSummary.weaknessCount}</li>
//             <li>추천 개수: {analysisResult.dynamicSummary.recommendCount}</li>
//           </ul>
//         </section>
//         <section>
//           <h4>상세 리포트</h4>
//           <ul>
//             <li>강점: {analysisResult.strengths.join(', ')}</li>
//             <li>약점: {analysisResult.weaknesses.join(', ')}</li>
//             <li>추천: {analysisResult.recommendations.join(', ')}</li>
//             <li>세부 분석: {JSON.stringify(analysisResult.detailed_analysis)}</li>
//           </ul>
//         </section>
//       </>
//     )}
//   </div>
// )}