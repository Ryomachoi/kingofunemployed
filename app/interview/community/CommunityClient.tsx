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
    <div className="relative w-full sm:w-80">
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

  const filteredInterviews = useMemo(() => {
    if (!searchQuery.trim()) {
      return interviews
    }
    return interviews.filter(interview => 
      interview.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.position?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [interviews, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">면접 후기</h1>
            </div>
            
            {/* 검색창 */}
            <div className="flex-1 max-w-md mx-8">
              <InterviewSearchBar searchQuery={searchQuery} onSearch={handleSearch} />
            </div>
          </div>
        </div>

        <main>
          <div className="space-y-6">
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={searchQuery ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {searchQuery ? '일치하는 면접 후기가 없습니다' : '아직 면접 후기가 없습니다'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      {searchQuery ? '다른 검색어를 시도해보세요' : '첫 번째 면접 후기를 작성해보세요!'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                {/* 테이블 헤더 */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <div className="col-span-3">회사명 / 직무</div>
                    <div className="col-span-2">면접 유형</div>
                    <div className="col-span-1">난이도</div>
                    <div className="col-span-1">결과</div>
                    <div className="col-span-3">주요 정보</div>
                    <div className="col-span-2">작성일</div>
                  </div>
                </div>

                {/* 테이블 바디 */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInterviews.map((interview, index) => (
                    <Link 
                      key={interview.id}
                      href={`/interview/${interview.id}?view=community`}
                      className="block group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-200"
                    >
                      <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center">
                        {/* 회사명 / 직무 */}
                        <div className="col-span-3">
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {interview.company_name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                              {interview.position}
                            </p>
                          </div>
                        </div>

                        {/* 면접 유형 */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            {interview.interview_type === '화상면접' || interview.interview_type === 'video' ? (
                              <>
                                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">화상면접</span>
                              </>
                            ) : interview.interview_type === '대면면접' || interview.interview_type === 'in_person' ? (
                              <>
                                <div className="w-5 h-5 bg-sky-100 dark:bg-sky-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">대면면접</span>
                              </>
                            ) : interview.interview_type === '전화면접' || interview.interview_type === 'phone' ? (
                              <>
                                <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">전화면접</span>
                              </>
                            ) : (
                              <>
                                <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">기타</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 난이도 */}
                        <div className="col-span-1">
                          <span className="text-sm">
                            {interview.difficulty_level === 'easy' ? '🟢' :
                             interview.difficulty_level === 'medium' ? '🟡' :
                             interview.difficulty_level === 'hard' ? '🔴' : '⚪'}
                          </span>
                        </div>

                        {/* 결과 */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            interview.result === 'pass' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                            interview.result === 'fail' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {interview.result === 'pass' ? '✅' :
                             interview.result === 'fail' ? '❌' : '⏳'}
                          </span>
                        </div>

                        {/* 주요 정보 */}
                        <div className="col-span-3">
                          <div className="space-y-1">
                            {/* AI 분석 */}
                            {interview.ai_feedback && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-sky-400 rounded-sm flex items-center justify-center flex-shrink-0">
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-blue-700 dark:text-blue-300 font-medium">AI 분석</span>
                              </div>
                            )}
                            
                            {/* 후기 요약 */}
                            {interview.review_summary && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-gray-600 dark:text-gray-400">📝</span>
                                <span className="text-slate-600 dark:text-slate-400 line-clamp-1">
                                  {interview.review_summary.length > 30 
                                    ? `${interview.review_summary.substring(0, 30)}...` 
                                    : interview.review_summary}
                                </span>
                              </div>
                            )}
                            
                            {/* 첫 번째 질문 */}
                            {interview.first_question && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-blue-600 dark:text-blue-400 font-bold">Q</span>
                                <span className="text-slate-600 dark:text-slate-400 line-clamp-1">
                                  {interview.first_question.length > 25 
                                    ? `${interview.first_question.substring(0, 25)}...` 
                                    : interview.first_question}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 작성일 */}
                        <div className="col-span-2">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(interview.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* 테이블 푸터 (총 개수 표시) */}
                <div className="bg-slate-50/50 dark:bg-slate-800/30 px-6 py-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>총 {filteredInterviews.length}개의 면접 후기</span>
                    <div className="flex items-center gap-2">
                      <span>정렬:</span>
                      <select className="bg-transparent border-none text-sm focus:outline-none">
                        <option>최신순</option>
                        <option>회사명순</option>
                        <option>결과순</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* 배경 그라데이션 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}