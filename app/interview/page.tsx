import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function InterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: interviews } = await supabase.from('interviews').select('*').order('created_at', { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            면접 복기
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            면접 경험을 공유하고 AI 피드백을 받아보세요
          </p>
        </div>
        {user ? (
          <Link 
            href="/interview/new"
            className="btn btn-primary"
          >
            면접 복기 작성
          </Link>
        ) : (
          <Link 
            href="/login"
            className="btn btn-outline"
          >
            로그인 후 작성
          </Link>
        )}
      </div>
      
      <div className="space-y-4">
        {interviews && interviews.length > 0 ? (
          interviews.map((interview) => (
            <Link key={interview.id} href={`/interview/${interview.id}`} className="block">
              <div className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {interview.company_name} - {interview.position}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interview.interview_type === 'technical' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : interview.interview_type === 'behavioral'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                      }`}>
                        {interview.interview_type === 'technical' ? '기술면접' : 
                         interview.interview_type === 'behavioral' ? '인성면접' : '기타'}
                      </span>
                      <span>{interview.interview_date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interview.result === 'pass' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : interview.result === 'fail'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {interview.result === 'pass' ? '합격' : 
                         interview.result === 'fail' ? '불합격' : '대기중'}
                      </span>
                    </div>
                  </div>
                  {interview.ai_feedback && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        AI 분석 완료
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">
                  {interview.questions_and_answers}
                </p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>작성자: {interview.user_id}</span>
                  <span>{interview.created_at ? new Date(interview.created_at).toLocaleDateString('ko-KR') : '-'}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="card p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              아직 면접 복기가 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              첫 번째 면접 경험을 공유해보세요!
            </p>
            {user ? (
              <Link 
                href="/interview/new"
                className="btn btn-primary"
              >
                면접 복기 작성
              </Link>
            ) : (
              <Link 
                href="/login"
                className="btn btn-outline"
              >
                로그인 후 작성
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}