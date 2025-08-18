import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function InterviewCommunityPage() {
  const supabase = await createClient()
  
  // 면접 후기 목록 조회
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select('*')
    .order('created_at', { ascending: false })

  // 각 면접 후기에 대해 사용자 프로필 정보를 별도로 조회
  let interviewsWithProfiles = []
  if (interviews) {
    interviewsWithProfiles = await Promise.all(
      interviews.map(async (interview) => {
        if (interview.user_id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('nickname, display_name')
            .eq('id', interview.user_id)
            .single()
          return { ...interview, user_profiles: profile }
        }
        return { ...interview, user_profiles: null }
      })
    )
  }

  if (error) {
    console.error('면접 후기 조회 오류:', error)
  }

  // 사용자 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link 
                href="/interview"
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                메인으로
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  💼 면접 후기
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  실제 면접 경험을 공유하고 배워보세요
                </p>
              </div>
            </div>
            
            {user && (
              <Link 
                href="/interview/new"
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  후기 작성
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats Bar */}
        <div className="mb-8">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {interviewsWithProfiles?.length || 0}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">총 후기</div>
                </div>
                <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {interviewsWithProfiles?.filter(i => i.result === 'pass').length || 0}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">합격</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {interviewsWithProfiles?.filter(i => i.result === 'fail').length || 0}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">불합격</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                최신순 정렬
              </div>
            </div>
          </div>
        </div>

        {/* Interview Cards */}
        <div className="space-y-4">
          {interviewsWithProfiles && interviewsWithProfiles.length > 0 ? (
            interviewsWithProfiles.map((interview, index) => (
              <Link 
                key={interview.id} 
                href={`/interview/${interview.id}`}
                className="block group"
              >
                <article className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 overflow-hidden">
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {interview.company_name.charAt(0)}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {interview.company_name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-full font-medium">
                              {interview.position}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              interview.result === 'pass' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                              interview.result === 'fail' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {interview.result === 'pass' ? '✅ 합격' :
                               interview.result === 'fail' ? '❌ 불합격' : '⏳ 대기중'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className={`w-2 h-2 rounded-full ${
                              interview.interview_type === 'technical' ? 'bg-blue-500' :
                              interview.interview_type === 'behavioral' ? 'bg-green-500' :
                              interview.interview_type === 'case_study' ? 'bg-purple-500' :
                              interview.interview_type === 'presentation' ? 'bg-orange-500' : 'bg-slate-400'
                            }`}></div>
                            {interview.interview_type === 'technical' ? '💻 기술면접' : 
                             interview.interview_type === 'behavioral' ? '🤝 인성면접' : 
                             interview.interview_type === 'case_study' ? '📊 케이스 스터디' : 
                             interview.interview_type === 'presentation' ? '🎯 발표면접' : '📝 기타'}
                          </span>
                          
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                            interview.difficulty_level === 'easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            interview.difficulty_level === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                            interview.difficulty_level === 'hard' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {interview.difficulty_level === 'easy' ? '🟢 쉬움' :
                             interview.difficulty_level === 'medium' ? '🟡 보통' :
                             interview.difficulty_level === 'hard' ? '🔴 어려움' : '⚪ 미설정'}
                          </span>
                        </div>
                      </div>
                    </div>
                  
                  {/* AI Feedback Preview */}
                  {interview.ai_feedback && (
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-4 border border-violet-200/50 dark:border-violet-800/50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-100 mb-1">
                            🤖 AI 면접 분석
                          </h4>
                          <p className="text-sm text-violet-700 dark:text-violet-300 line-clamp-2">
                            {interview.ai_feedback}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview of Q&A */}
                  {interview.questions_and_answers && (
                    <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">Q</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">면접 질문 미리보기</span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-700/50 rounded-lg p-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                          💬 {(() => {
                            try {
                              const qaList = JSON.parse(interview.questions_and_answers)
                              if (Array.isArray(qaList) && qaList.length > 0) {
                                return qaList[0].question
                              }
                            } catch (e) {
                              // JSON 파싱 실패시 원본 텍스트 표시
                            }
                            return interview.questions_and_answers.substring(0, 100) + '...'
                          })()} 
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                      {interview.interview_date && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(interview.interview_date).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                      
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(interview.user_profiles?.nickname || interview.user_profiles?.display_name || interview.user_id.substring(0, 8)).charAt(0)}
                        </div>
                        {interview.user_profiles?.nickname || interview.user_profiles?.display_name || interview.user_id.substring(0, 8)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(interview.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      
                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                첫 번째 면접 후기를 작성해보세요! 🚀
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                여러분의 소중한 면접 경험을 공유하고<br/>
                다른 구직자들에게 도움을 주세요.
              </p>
              {user ? (
                <Link 
                  href="/interview/new"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    면접 후기 작성하기
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/login"
                  className="inline-flex items-center px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  로그인하고 시작하기
                </Link>
              )}
            </div>
          </div>
        )}
        </div>
       </div>
       
       {/* Floating Action Button for Mobile */}
       {user && (
         <div className="fixed bottom-6 right-6 z-40 md:hidden">
           <Link 
             href="/interview/new"
             className="group w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
           </Link>
         </div>
       )}
       
       {/* Background Decoration */}
       <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
       </div>
     </div>
   )
 }