"use client";
import React, { useState } from "react";
import Link from "next/link";
import { createInterview } from "../actions";

export default function NewInterviewPage() {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [difficulty, setDifficulty] = useState("");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">면접 후기 작성</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* 기본 정보 */}
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">기본 정보</h2>
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

            {/* 면접 내용 (질문/답변) */}
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">면접 질문/답변</h2>
                <button 
                  type="button" 
                  onClick={addQA} 
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                >
                  + 질문/답변 추가
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
                      className="mt-2 text-red-500 hover:text-red-700 font-bold px-2"
                    >
                      질문/답변 삭제
                    </button>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="text-red-500 mb-4 text-center">{error}</div>
            )}
            
            <div className="flex gap-4 justify-center">
              <Link href="/interview">
                <button
                  type="button"
                  className="bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  취소
                </button>
              </Link>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "저장 중..." : "면접 후기 작성 완료"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}