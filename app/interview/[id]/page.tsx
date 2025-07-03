import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function InterviewDetailPage({ params }) {
  const supabase = await createClient()
  const { data: interview } = await supabase.from('interviews').select('*').eq('id', params.id).single()
  if (!interview) return notFound()
  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {interview.company_name} <span className="text-base font-normal text-slate-500">({interview.position})</span>
        </h1>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            interview.interview_type === 'technical'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
              : interview.interview_type === 'behavioral'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
          }`}>
            {interview.interview_type === 'technical' ? '기술면접' : interview.interview_type === 'behavioral' ? '인성면접' : '기타'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            interview.result === 'pass'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : interview.result === 'fail'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
          }`}>
            {interview.result === 'pass' ? '합격' : interview.result === 'fail' ? '불합격' : '대기중'}
          </span>
          <span className="text-xs text-slate-500">{interview.interview_date}</span>
        </div>
        <div className="text-sm text-slate-500 mb-1">작성자: {interview.user_id}</div>
      </div>
      <div className="prose dark:prose-invert mb-8">
        {interview.content}
      </div>
      {interview.questions_and_answers && (
        <div className="prose dark:prose-invert mb-8">
          <h2 className="font-semibold mb-2">면접 질문 및 답변</h2>
          <div className="space-y-4">
            {(() => {
              let qaList = [];
              try {
                qaList = JSON.parse(interview.questions_and_answers);
              } catch (e) {
                return <div className="text-red-500">질문/답변 데이터를 불러올 수 없습니다.<br/>원본: {String(interview.questions_and_answers)}</div>;
              }
              if (!Array.isArray(qaList) || qaList.length === 0) {
                return <div className="text-slate-500">등록된 질문/답변이 없습니다.</div>;
              }
              return qaList.map((qa, idx) => (
                <div key={idx} className="p-4 border rounded bg-slate-50 dark:bg-slate-800">
                  <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Q{idx + 1}. {qa.question}</div>
                  <div className="text-slate-700 dark:text-slate-200 whitespace-pre-line">{qa.answer}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
      {interview.ai_feedback && (
        <div className="mt-8 p-4 border rounded bg-blue-50 dark:bg-blue-900/20">
          <h2 className="font-semibold mb-2">AI 피드백</h2>
          <div>{interview.ai_feedback}</div>
        </div>
      )}
    </div>
  )
}