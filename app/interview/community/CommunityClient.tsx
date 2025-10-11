'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { InterviewWithProfile } from '@/types/database'

interface CommunityClientProps {
  interviews: InterviewWithProfile[]
  currentUserId?: string
}

// 검색바 컴포넌트
function InterviewSearchBar({ searchQuery, onSearch }: { searchQuery: string; onSearch: (query: string) => void }) {
  return (
    <div className="relative w-80">
      <div className="relative">
        <input
          type="text"
          placeholder="기업 이름 또는 직무로 검색..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function CommunityClient({ interviews: initialInterviews, currentUserId }: CommunityClientProps) {
  const [interviews] = useState<InterviewWithProfile[]>(initialInterviews)
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 필터링 로직
  const filteredInterviews = useMemo(() => {
    if (!searchQuery.trim()) {
      return interviews
    }

    const query = searchQuery.toLowerCase().trim()
    return interviews.filter(interview => 
      interview.company_name?.toLowerCase().includes(query) ||
      interview.position?.toLowerCase().includes(query)
    )
  }, [interviews, searchQuery])

  // 검색어 변경 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                💼 면접 후기
              </h1>
            </div>
            {/* 검색바를 h1과 같은 줄에 배치 */}
            <InterviewSearchBar searchQuery={searchQuery} onSearch={handleSearch} />
          </div>

          {/* 면접 후기 목록 */}
          <div className="space-y-6">
            {filteredInterviews.length === 0 ? (
              searchQuery ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        일치하는 면접 후기가 없습니다
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        다른 검색어를 시도해보세요
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💼</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        아직 면접 후기가 없습니다
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        첫 번째 면접 후기를 작성해보세요!
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              filteredInterviews.map((interview) => (
                <div key={interview.id} className="relative">
                  <Link 
                    href={`/interview/${interview.id}?view=community`}
                    className="block group"
                  >
                    <article className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 overflow-hidden">
                      {/* Card Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
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
                                   interview.interview_type === '화상면접' || interview.interview_type === 'video' ? 'bg-blue-500' :
                                   interview.interview_type === '대면면접' || interview.interview_type === 'in_person' ? 'bg-green-500' :
                                   interview.interview_type === '전화면접' || interview.interview_type === 'phone' ? 'bg-purple-500' :
                                   interview.interview_type === 'technical' ? 'bg-blue-500' :
                                   interview.interview_type === 'behavioral' ? 'bg-green-500' :
                                   interview.interview_type === 'case_study' ? 'bg-purple-500' :
                                   interview.interview_type === 'presentation' ? 'bg-orange-500' : 'bg-slate-400'
                                 }`}></div>
                                 {interview.interview_type === '화상면접' ? '💻 화상면접' :
                                  interview.interview_type === '대면면접' ? '🏢 대면면접' :
                                  interview.interview_type === '전화면접' ? '📞 전화면접' :
                                  interview.interview_type === '기타' ? '📝 기타' :
                                  interview.interview_type === 'technical' ? '💻 기술면접' : 
                                  interview.interview_type === 'behavioral' ? '🤝 인성면접' : 
                                  interview.interview_type === 'case_study' ? '📊 케이스 스터디' : 
                                  interview.interview_type === 'presentation' ? '🎯 발표면접' :
                                  interview.interview_type === 'video' ? '💻 화상면접' :
                                  interview.interview_type === 'in_person' ? '🏢 대면면접' :
                                  interview.interview_type === 'phone' ? '📞 전화면접' : 
                                  interview.interview_type === 'other' ? '📝 기타' : 
                                  interview.interview_type ? `📝 ${interview.interview_type}` : '📝 기타'}
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
                                {typeof interview.ai_feedback === 'string' 
                                  ? interview.ai_feedback 
                                  : interview.ai_feedback?.general_advice || 'AI 분석 결과가 있습니다.'}
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
                              💬 {interview.first_question || '질문 정보가 없습니다.'}
                            </p>
                          </div>
                        </div>
                      )}

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
                            
                            <span className="flex items-center gap-1.5 ml-auto">
                              익명
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              작성일: {new Date(interview.created_at).toLocaleDateString('ko-KR')}
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
       
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}