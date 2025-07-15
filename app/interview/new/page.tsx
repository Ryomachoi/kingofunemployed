"use client";
import React, { useState } from "react";
import { createInterview } from "../actions";

export default function NewInterviewPage() {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [company_name, setCompanyName] = useState("");
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
      formData.append("company", company);
      formData.append("position", position);
      formData.append("interview_date", interviewDate);
      formData.append("interview_type", interviewType);
      formData.append("difficulty", difficulty);
      formData.append("company_name", company_name);
      qaList.forEach((qa, idx) => {
        formData.append(`question_${idx + 1}`, qa.question);
        formData.append(`answer_${idx + 1}`, qa.answer);
      });
      formData.append("qa_count", qaList.length.toString());
      await createInterview(formData);
      window.location.href = "/interview";
    } catch (err) {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">면접 후기 작성</h1>
        <form onSubmit={handleSubmit}>
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">회사명</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">직무</label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">면접 날짜</label>
              <input
                type="date"
                value={interviewDate}
                onChange={e => setInterviewDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">면접 유형</label>
              <select
                value={interviewType}
                onChange={e => setInterviewType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">선택</option>
                <option value="technical">실무면접</option>
                <option value="behavioral">인성면접</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">난이도</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">선택</option>
                <option value="easy">쉬움</option>
                <option value="medium">보통</option>
                <option value="hard">어려움</option>
              </select>
            </div>
          </div>
          {/* 면접 내용 (질문/답변) 세로 배치 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <span className="text-lg font-bold text-blue-600 mr-2">면접 질문/답변</span>
              <button type="button" onClick={addQA} className="ml-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition">+ 질문/답변 추가</button>
            </div>
            {qaList.map((qa, idx) => (
              <div key={idx} className="mb-6">
                <label className="block text-gray-700 font-semibold mb-1">질문 {idx + 1}</label>
                <input
                  type="text"
                  name={`question_${idx}`}
                  placeholder="질문을 입력하세요"
                  value={qa.question}
                  onChange={e => handleChange(idx, 'question', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 mb-2"
                  required
                />
                <label className="block text-gray-700 font-semibold mb-1">답변</label>
                <textarea
                  name={`answer_${idx}`}
                  placeholder={`📌 복기를 잘할수록 합격률이 올라갑니다!
면접 질문과 나의 답변뿐 아니라,
👉 면접관의 반응, 표정, 분위기, 뉘앙스까지
자세히 써주시면 AI가 더 정확하게 분석해드려요.

ex) “자기소개해보세요” 질문에 “저는 마케팅을 사랑합니다...”로 답했더니 면접관이 고개를 끄덕였어요.`}
                  value={qa.answer}
                  onChange={e => handleChange(idx, 'answer', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 min-h-[200px]"
                  required
                />
                {qaList.length > 2 && idx >= 2 && (
                  <button type="button" onClick={() => removeQA(idx)} className="mt-2 text-red-500 hover:text-red-700 font-bold px-2">질문/답변 삭제</button>
                )}
              </div>
            ))}
          </div>
          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-bold text-lg shadow hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}