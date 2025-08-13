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
            .eq('user_id', interview.user_id)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              면접 후기 커뮤니티
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              다른 사람들의 면접 경험을 통해 면접 스킬을 향상시켜보세요.
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/interview"
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              ← 메인으로
            </Link>
            {user && (
              <Link 
                href="/interview/new"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                면접 후기 작성하기
              </Link>
            )}
          </div>
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {interviewsWithProfiles && interviewsWithProfiles.length > 0 ? (
            interviewsWithProfiles.map((interview) => (
              <Link key={interview.id} href={`/interview/${interview.id}`}>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {interview.company_name}
                        <span className="text-base font-normal text-slate-500 ml-2">({interview.position})</span>
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.interview_type === 'technical'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : interview.interview_type === 'behavioral'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                        }`}>
                          {interview.interview_type === 'technical' ? '기술면접' : interview.interview_type === 'behavioral' ? '인성면접' : '기타'}
                        </span>
                        
                        {interview.difficulty_level && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            interview.difficulty_level === 'easy'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : interview.difficulty_level === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {interview.difficulty_level === 'easy' ? '쉬움' : interview.difficulty_level === 'medium' ? '보통' : '어려움'}
                          </span>
                        )}
                        
                        {interview.result && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            interview.result === 'pass'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : interview.result === 'fail'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          }`}>
                            {interview.result === 'pass' ? '합격' : interview.result === 'fail' ? '불합격' : '대기중'}
                          </span>
                        )}
                        
                        {interview.ai_feedback && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                            <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            AI 분석 완료
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview of Q&A */}
                  {interview.questions_and_answers && (
                    <div className="mb-4">
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        {(() => {
                          try {
                            const qaList = JSON.parse(interview.questions_and_answers)
                            if (Array.isArray(qaList) && qaList.length > 0) {
                              return `Q: ${qaList[0].question}`
                            }
                          } catch (e) {
                            // JSON 파싱 실패시 원본 텍스트 표시
                          }
                          return interview.questions_and_answers.substring(0, 100) + '...'
                        })()} 
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                      <span>면접일: {interview.interview_date || '-'}</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {interview.user_id ? (
                          interview.user_profiles?.nickname || 
                          interview.user_profiles?.display_name || 
                          interview.user_id.substring(0, 8)
                        ) : '익명'}
                      </div>
                    </div>
                    <span>{interview.created_at ? new Date(interview.created_at).toLocaleDateString('ko-KR') : '-'}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center border border-slate-200 dark:border-slate-700">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                아직 면접 후기가 없습니다
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                첫 번째 면접 경험을 공유해보세요!
              </p>
              {user ? (
                <Link 
                  href="/interview/new"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  면접 후기 작성하기
                </Link>
              ) : (
                <Link 
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  로그인 후 작성하기
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}