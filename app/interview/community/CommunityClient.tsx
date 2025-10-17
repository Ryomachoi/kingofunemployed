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
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="기업 이름 또는 직무로 검색..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800/60 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm shadow-lg shadow-pink-500/5"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                면접 후기
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Instagram Style Card Layout</p>
            </div>
            
            {/* 검색창 */}
            <div className="w-full max-w-md">
              <InterviewSearchBar searchQuery={searchQuery} onSearch={handleSearch} />
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-full border border-pink-200/50 dark:border-pink-800/50 shadow-lg shadow-pink-500/10">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-pink-700 dark:text-pink-300 font-semibold">
              {filteredInterviews.length}개의 면접 스토리
            </span>
          </div>
        </div>

        <main>
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-pink-400 dark:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={searchQuery ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {searchQuery ? '일치하는 스토리가 없어요' : '아직 스토리가 없어요'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    {searchQuery ? '다른 검색어를 시도해보세요 ✨' : '첫 번째 면접 스토리를 공유해보세요! 📸'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterviews.map((interview, index) => (
                <Link 
                  key={interview.id}
                  href={`/interview/${interview.id}?view=community`}
                  className="block group"
                >
                  <article className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-pink-500/20 dark:hover:shadow-pink-500/10 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                    
                    {/* 카드 헤더 (프로필 스타일) */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* 프로필 아바타 */}
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {interview.company_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                              {interview.company_name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {interview.position}
                            </p>
                          </div>
                        </div>
                        
                        {/* 더보기 버튼 */}
                        <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* 메인 이미지 영역 (정사각형) */}
                    <div className="aspect-square bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 relative overflow-hidden">
                      {/* 배경 패턴 */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-4 w-8 h-8 bg-pink-300 rounded-full"></div>
                        <div className="absolute top-12 right-8 w-6 h-6 bg-purple-300 rounded-full"></div>
                        <div className="absolute bottom-8 left-8 w-4 h-4 bg-indigo-300 rounded-full"></div>
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-pink-200 rounded-full"></div>
                      </div>
                      
                      {/* 중앙 콘텐츠 */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        {/* 면접 결과 대형 아이콘 */}
                        <div className="mb-4">
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl ${
                            interview.result === 'pass' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                            interview.result === 'fail' ? 'bg-gradient-to-br from-red-400 to-pink-500' :
                            'bg-gradient-to-br from-slate-400 to-slate-500'
                          }`}>
                            {interview.result === 'pass' ? '🎉' :
                             interview.result === 'fail' ? '💪' : '⏳'}
                          </div>
                        </div>
                        
                        {/* 면접 정보 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            {interview.interview_type === '화상면접' || interview.interview_type === 'video' ? (
                              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">화상면접</span>
                              </div>
                            ) : interview.interview_type === '대면면접' || interview.interview_type === 'in_person' ? (
                              <div className="flex items-center gap-2 px-3 py-1 bg-sky-100 dark:bg-sky-900/30 rounded-full">
                                <svg className="w-3 h-3 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="text-xs font-medium text-sky-700 dark:text-sky-300">대면면접</span>
                              </div>
                            ) : interview.interview_type === '전화면접' || interview.interview_type === 'phone' ? (
                              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">전화면접</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <svg className="w-3 h-3 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">기타</span>
                              </div>
                            )}
                          </div>
                          
                          {/* 난이도 */}
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-lg">
                              {interview.difficulty_level === 'easy' ? '🟢' :
                               interview.difficulty_level === 'medium' ? '🟡' :
                               interview.difficulty_level === 'hard' ? '🔴' : '⚪'}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {interview.difficulty_level === 'easy' ? '쉬움' :
                               interview.difficulty_level === 'medium' ? '보통' :
                               interview.difficulty_level === 'hard' ? '어려움' : '미설정'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 카드 하단 (인터랙션 영역) */}
                    <div className="p-4">
                      {/* 액션 버튼들 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                        </div>
                        <button className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>

                      {/* 콘텐츠 미리보기 */}
                      <div className="space-y-2">
                        {/* AI 분석 배지 */}
                        {interview.ai_feedback && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                              AI 분석 완료
                            </span>
                          </div>
                        )}
                        
                        {/* 후기 요약 */}
                        {interview.review_summary && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {interview.company_name}
                            </span>{' '}
                            {interview.review_summary.substring(0, 80)}
                            {interview.review_summary.length > 80 ? '...' : ''}
                          </p>
                        )}
                        
                        {/* 첫 번째 질문 미리보기 */}
                        {interview.first_question && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            💬 {interview.first_question.substring(0, 50)}
                            {interview.first_question.length > 50 ? '...' : ''}
                          </p>
                        )}
                      </div>

                      {/* 시간 정보 */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(interview.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      
      {/* 배경 효과 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-purple-400/8 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/8 to-indigo-400/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}