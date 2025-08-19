"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createInterview } from "../actions";

export default function NewInterviewPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [result, setResult] = useState("");
  const [overallRating, setOverallRating] = useState("");
  const [feedbackAndTips, setFeedbackAndTips] = useState("");
  const [qaList, setQaList] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addQA = () => {
    setQaList([...qaList, { question: "", answer: "" }]);
  };

  const removeQA = (idx: number) => {
    if (qaList.length <= 2) return;
    setQaList(qaList.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, field: string, value: string) => {
    setQaList(
      qaList.map((qa, i) =>
        i === idx ? { ...qa, [field]: value } : qa
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    // 질문/답변 모두 작성되었는지 확인
    const emptyQA = qaList.some(qa => !qa.question.trim() || !qa.answer.trim());
    if (emptyQA) {
      setError("모든 질문과 답변을 작성해주세요.");
      setSubmitting(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("company_name", company);
      formData.append("position", position);
      formData.append("interview_date", interviewDate);
      formData.append("interview_type", interviewType);
      formData.append("difficulty", difficulty);
      formData.append("result", result);
      formData.append("overall_rating", overallRating);
      formData.append("feedback_and_tips", feedbackAndTips);
      
      qaList.forEach((qa, idx) => {
        formData.append(`question_${idx + 1}`, qa.question);
        formData.append(`answer_${idx + 1}`, qa.answer);
      });
      formData.append("qa_count", qaList.length.toString());
      
      await createInterview(formData);
      // 서버 액션에서 redirect를 처리하므로 클라이언트에서 별도 처리 불필요
    } catch (err) {
      // 서버 액션의 redirect는 정상적인 동작이므로 오류로 처리하지 않음
      console.log('Server action completed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                면접 후기 작성
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                다른 구직자들에게 도움이 되는 소중한 경험을 공유해주세요
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8">
          
          <form onSubmit={handleSubmit}>
            {/* 기본 정보 */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl mb-6 border border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                기본 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">회사명</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="회사명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">지원 직무</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="지원 직무를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">면접 날짜</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">면접 유형</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">선택하세요</option>
                    <option value="video">화상면접</option>
                    <option value="in_person">대면면접</option>
                    <option value="phone">전화면접</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">난이도</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">선택하세요</option>
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 면접 결과 및 평가 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl mb-6 border border-green-200/50 dark:border-slate-600/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                면접 결과 및 평가
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">면접 결과</label>
                  <select
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">선택하세요</option>
                    <option value="pass">합격</option>
                    <option value="fail">불합격</option>
                    <option value="pending">대기중</option>
                    <option value="in_progress">진행중</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">전체 평점 (1-5점)</label>
                  <select
                    value={overallRating}
                    onChange={(e) => setOverallRating(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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

            {/* 피드백 및 팁 (선택사항) */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl mb-6 border border-amber-200/50 dark:border-slate-600/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                피드백 및 팁 
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">(선택사항)</span>
              </h2>
              <textarea
                value={feedbackAndTips}
                onChange={(e) => setFeedbackAndTips(e.target.value)}
                placeholder="후배들을 위한 조언이나 팁을 작성해주세요. (예: 준비 방법, 주의사항, 면접 분위기 등)"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* 면접 내용 (질문/답변) */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl mb-6 border border-purple-200/50 dark:border-slate-600/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                면접 내용 (질문/답변)
              </h2>
              <div className="flex justify-end mb-4">
                <button 
                  type="button" 
                  onClick={addQA}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  질문/답변 추가
                </button>
              </div>
              
              {qaList.map((qa, idx) => (
                <div key={idx} className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    질문 {idx + 1}
                  </label>
                  <input
                    type="text"
                    placeholder="질문을 입력하세요"
                    value={qa.question}
                    onChange={(e) => handleChange(idx, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    required
                  />
                  
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    답변
                  </label>
                  <textarea
                    placeholder="답변을 입력하세요"
                    value={qa.answer}
                    onChange={(e) => handleChange(idx, 'answer', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    required
                  />
                  
                  {qaList.length > 2 && idx >= 2 && (
                    <button 
                      type="button" 
                      onClick={() => removeQA(idx)} 
                      className="mt-2 text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      질문/답변 삭제
                    </button>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="text-red-500 mb-4 text-center">{error}</div>
            )}
            
            <div className="flex gap-4 justify-end pt-6 border-t border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onClick={() => router.push('/interview/community')}
                className="px-8 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-400 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    작성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    작성 완료
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}