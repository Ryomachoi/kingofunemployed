import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function InterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <div className="min-h-screen bg-transparent">
       <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        {/* <div className="text-center mb-16">
          {/* Camera Icon 
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full mb-8">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            AI 면접복기
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            AI 기반 면접 분석으로 개선점을 찾고, 면접 스킬을 향상시켜보세요.
          </p>
        </div> */}

        {/* AI 피드백 받기 Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-400 rounded-xl mb-6 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
              AI 피드백 받기
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-center">
              면접 내용을 입력하면 AI가 답변의 품질, 논리성, 표현력을 분석하고<br />입력된 사용자의 내용에 맞춰 개선점을 제안해드립니다.
            </p>
            
            {/* Features List */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                실시간 답변 분석
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                개인화된 개선 제안
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                구조화된 피드백
              </div>
            </div>
            
            <Link href="/interview/analyze">
              <button className="w-full bg-gradient-to-r from-blue-500 to-sky-400 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-sky-500 transition-all duration-200 transform hover:scale-105 shadow-lg">
                AI 피드백 받기
              </button>
            </Link>
          </div>
        </div>

        {/* AI 면접복기 특징 Section */}
        <div className="max-w-4xl mx-auto">
         {/* <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
            AI 면접복기 특징
          </h2> */}
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* 실시간 분석 */}
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                실시간 분석
              </h3>
              <p className="text-xs-plus text-slate-600 dark:text-slate-400" style={{lineHeight: '1.625'}}>
                실시간으로 답변을 분석하여<br />
                즉시 피드백 제공
              </p>
            </div>

            {/* 개인 제안 */}
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 dark:bg-sky-800/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                개인 제안
              </h3>
              <p className="text-xs-plus text-slate-600 dark:text-slate-400" style={{lineHeight: '1.625'}}>
                개인화된 가치관과 구체적인<br />
                실행 방안을 통한 맞춤형 개선 제안
              </p>
            </div>

            {/* 합격 예측 */}
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-200 dark:bg-blue-800/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                합격 예측
              </h3>
              <p className="text-xs-plus text-slate-600 dark:text-slate-400" style={{lineHeight: '1.625'}}>
                AI 분석을 통한 합격 확률 예측과<br />
                개선 방향 제시
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}