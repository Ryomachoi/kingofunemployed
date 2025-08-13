import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function InterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            AI 면접복기
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AI 기반 면접 분석으로 개선점을 찾고, 다른 사람들의 경험을 통해 면접 스킬을 향상시켜보세요.
          </p>
        </div>

        {/* Main Content Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AI 피드백 받기 Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              AI 피드백 받기
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              면접 내용을 입력하면 AI가 답변의 품질, 논리성, 표현력을 분석하여 개선점을 제안해드려요.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                실시간 답변 분석
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                개인화된 개선 제안
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                구조화된 피드백
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
              AI 피드백 받기
            </button>
          </div>

          {/* 커뮤니티 보기 Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              면접 후기
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              다른 사람들의 면접 경험과 AI 피드백을 살펴보고, 유용한 팁과 노하우를 얻어보세요.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                실제 면접 후기
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                기업별 필터링
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                좋아요 & 북마크
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={user ? "/interview/new" : "/login"} className="flex-1">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
                    면접 후기 작성
                  </button>
              </Link>
              <Link href="/interview/community" className="flex-1">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                  면접 후기 보기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}