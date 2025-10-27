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
      return interviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return interviews
      .filter(interview => 
        interview.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.position?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [interviews, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // 날짜별 그룹핑
  const groupedInterviews = useMemo(() => {
    const groups: { [key: string]: InterviewWithProfile[] } = {}
    
    filteredInterviews.forEach(interview => {
      const date = new Date(interview.created_at)
      const dateKey = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(interview)
    })
    
    return groups
  }, [filteredInterviews])

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">면접 후기</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">시간순으로 정리된 면접 경험들</p>
            </div>
            
            {/* 검색창 - 오른쪽 정렬 */}
            <div className="flex justify-end">
              <InterviewSearchBar searchQuery={searchQuery} onSearch={handleSearch} />
            </div>
          </div>
        </div>

        <main>
          <div className="space-y-8">
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={searchQuery ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
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
              <div className="relative">
                {/* 타임라인 메인 라인 */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800"></div>
                
                {/* 타임라인 아이템들 */}
                <div className="space-y-12">
                  {Object.entries(groupedInterviews).map(([dateKey, dayInterviews], groupIndex) => (
                    <div key={dateKey} className="relative">
                      {/* 날짜 헤더 */}
                      <div className="relative flex items-center mb-8">
                        <div className="absolute left-6 w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow-lg z-10"></div>
                        <div className="ml-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                          <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-300">{dateKey}</h2>
                        </div>
                      </div>

                      {/* 해당 날짜의 면접 후기들 */}
                      <div className="space-y-6">
                        {dayInterviews.map((interview, index) => (
                          <div key={interview.id} className="relative">
                            {/* 타임라인 포인트 */}
                            <div className="absolute left-7 w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full z-10"></div>
                            
                            {/* 면접 후기 카드 */}
                            <Link 
                              href={`/interview/${interview.id}?view=community`}
                              className="block ml-16 group"
                            >
                              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm hover:shadow-lg hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-all duration-300 group-hover:scale-[1.02]">
                                {/* 카드 헤더 */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                                      {interview.company_name}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                                      {interview.position}
                                    </p>
                                  </div>
                                  
                                  {/* 결과 배지 */}
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      interview.result === 'pass' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                                      interview.result === 'fail' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}>
                                      {interview.result === 'pass' ? '✅ 합격' :
                                       interview.result === 'fail' ? '❌ 불합격' : '⏳ 대기중'}
                                    </span>
                                  </div>
                                </div>

                                {/* 카드 메타 정보 - 면접 유형, 난이도, 면접 날짜 */}
                                <div className="flex items-center justify-between mb-4 text-sm">
                                  <div className="flex items-center gap-4">
                                    {/* 면접 유형 */}
                                    <div className="flex items-center gap-2">
                                    {interview.interview_type === '화상면접' || interview.interview_type === 'video' ? (
                                      <>
                                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                          <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">화상면접</span>
                                      </>
                                    ) : interview.interview_type === '대면면접' || interview.interview_type === 'in_person' ? (
                                      <>
                                        <div className="w-5 h-5 bg-sky-100 dark:bg-sky-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                                          <svg className="w-3 h-3 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                          </svg>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">대면면접</span>
                                      </>
                                    ) : interview.interview_type === '전화면접' || interview.interview_type === 'phone' ? (
                                      <>
                                        <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                                          <svg className="w-3 h-3 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">전화면접</span>
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                                          <svg className="w-3 h-3 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">기타</span>
                                      </>
                                    )}
                                  </div>

                                    {/* 난이도 */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500 dark:text-slate-400">난이도:</span>
                                      <span>
                                        {interview.difficulty_level === 'easy' ? '🟢 쉬움' :
                                         interview.difficulty_level === 'medium' ? '🟡 보통' :
                                         interview.difficulty_level === 'hard' ? '🔴 어려움' : '⚪ 미정'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* 면접 날짜 - 오른쪽 끝에 위치 */}
                                  {interview.interview_date && (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span>
                                        {new Date(interview.interview_date).toLocaleDateString('ko-KR', {
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 카드 콘텐츠 */}
                                <div className="space-y-3">
                                  {/* AI 분석 */}
                                  {interview.ai_feedback && (
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                      <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">AI 분석 완료</span>
                                    </div>
                                  )}
                                  
                                  {/* 후기 요약 */}
                                  {interview.review_summary && (
                                    <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg">
                                      <div className="flex items-start gap-2">
                                        <span className="text-slate-600 dark:text-slate-400 mt-0.5">📝</span>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                          {interview.review_summary.length > 120 
                                            ? `${interview.review_summary.substring(0, 120)}...` 
                                            : interview.review_summary}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 첫 번째 질문 */}
                                  {interview.first_question && (
                                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                                      <div className="flex items-start gap-2">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-0.5">Q.</span>
                                        <p className="text-indigo-700 dark:text-indigo-300 text-sm leading-relaxed">
                                          {interview.first_question.length > 100 
                                            ? `${interview.first_question.substring(0, 100)}...` 
                                            : interview.first_question}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* 카드 푸터 */}
                                <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>자세히 보기 →</span>
                                    <div className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>
                                        {new Date(interview.created_at).toLocaleTimeString('ko-KR', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 타임라인 끝 표시 */}
                <div className="relative mt-12">
                  <div className="absolute left-6 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-white dark:border-slate-900 shadow-lg"></div>
                  <div className="ml-16 text-center py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full border border-purple-200/50 dark:border-purple-800/50">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        총 {filteredInterviews.length}개의 면접 후기
                      </span>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-sky-400/5 to-cyan-400/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}