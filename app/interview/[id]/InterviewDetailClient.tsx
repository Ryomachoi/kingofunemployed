'use client'

import { useState } from 'react'
import Link from 'next/link'

interface InterviewDetailClientProps {
  interview: any
  userProfile: any
  currentUserId?: string
  parsedQAList: { question: string; answer: string }[]
}

export default function InterviewDetailClient({ interview, userProfile, currentUserId, parsedQAList }: InterviewDetailClientProps) {
  console.log('InterviewDetailClient props:', { interview, currentUserId, userProfile })
  
  const [isShared, setIsShared] = useState(interview.is_shared)
  const [isLoading, setIsLoading] = useState(false)
  const isAuthor = currentUserId === interview.user_id

  const handleTogglePrivacy = async () => {
    setIsLoading(true)
    
    console.log('Toggling privacy for interview ID:', interview.id)
    
    try {
      const response = await fetch('/api/interview/toggle-privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interviewId: interview.id }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsShared(data.isShared)
        console.log('공개/비공개 상태가 성공적으로 변경되었습니다.')
      } else {
        console.error('공개/비공개 상태 변경 실패:', data.error || '알 수 없는 오류')
        alert(data.error || '공개/비공개 상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('네트워크 오류:', error)
      alert('서버와의 연결에 문제가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header with Navigation */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/interview/community"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              면접 후기 목록으로 돌아가기
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Privacy Toggle Button - Only visible to author */}
              {isAuthor && (
                <button
                  onClick={handleTogglePrivacy}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isShared
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isShared ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      )}
                    </svg>
                  )}
                  {isShared ? '공개' : '비공개'}
                </button>
              )}
              
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(interview.created_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Company Header Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {interview.company_name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    {interview.company_name}
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mt-1">
                    {interview.position}
                  </p>
                </div>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  interview.result === 'pass' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                  interview.result === 'fail' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                  interview.result === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {interview.result === 'pass' ? '✅ 합격' :
                   interview.result === 'fail' ? '❌ 불합격' :
                   interview.result === 'pending' ? '⏳ 대기중' : '📝 진행중'}
                </span>
                
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  interview.interview_type === '화상면접' || interview.interview_type === 'video' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                  interview.interview_type === '대면면접' || interview.interview_type === 'in_person' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                  interview.interview_type === '전화면접' || interview.interview_type === 'phone' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                  interview.interview_type === 'technical' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' :
                  interview.interview_type === 'behavioral' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {interview.interview_type === '화상면접' ? '💻 화상면접' :
                   interview.interview_type === '대면면접' ? '🏢 대면면접' :
                   interview.interview_type === '전화면접' ? '📞 전화면접' :
                   interview.interview_type === '기타' ? '📝 기타' :
                   interview.interview_type === 'video' ? '💻 화상면접' :
                   interview.interview_type === 'in_person' ? '🏢 대면면접' :
                   interview.interview_type === 'phone' ? '📞 전화면접' :
                   interview.interview_type === 'technical' ? '🔧 기술면접' :
                   interview.interview_type === 'behavioral' ? '👥 인성면접' :
                   interview.interview_type ? interview.interview_type : '📝 기타'}
                </span>
                
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  interview.difficulty_level === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                  interview.difficulty_level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                  interview.difficulty_level === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {interview.difficulty_level === 'easy' ? '🟢 쉬움' :
                   interview.difficulty_level === 'medium' ? '🟡 보통' :
                   interview.difficulty_level === 'hard' ? '🔴 어려움' : '⚪ 미설정'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Interview Date & Author */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              {interview.interview_date && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  면접일: {new Date(interview.interview_date).toLocaleDateString('ko-KR')}
                </span>
              )}
              
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  익
                </div>
                작성자: 익명
              </span>
            </div>
            
            {/* Overall Rating */}
            {interview.overall_rating && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">전체 평점:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < interview.overall_rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {interview.overall_rating}/5
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions & Answers */}
        {parsedQAList && parsedQAList.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              면접 질문 및 답변
            </h2>
            
            <div className="space-y-6">
              {parsedQAList.map((qa, idx) => (
                <div key={idx} className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      Q{idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-lg">
                        {qa.question}
                      </h3>
                      <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            A
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">답변</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {qa.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback & Tips */}
        {interview.feedback_and_tips && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              피드백 및 팁
            </h2>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200/50 dark:border-amber-800/50">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {interview.feedback_and_tips}
              </p>
            </div>
          </div>
        )}

        {/* AI Feedback */}
        {interview.ai_feedback && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              🤖 AI 면접 분석
            </h2>
            
            {(() => {
              // AI 피드백이 구조화된 데이터인지 확인
              let structuredData = null;
              try {
                if (typeof interview.ai_feedback === 'object') {
                  structuredData = interview.ai_feedback;
                } else if (typeof interview.ai_feedback === 'string') {
                  structuredData = JSON.parse(interview.ai_feedback);
                }
              } catch (e) {
                // JSON 파싱 실패 시 원본 텍스트로 표시
              }

              // 구조화된 데이터가 있고 새로운 스키마 형태인 경우
              if (structuredData && structuredData.total_score !== undefined && structuredData.areas) {
                return (
                  <div className="space-y-6">
                    {/* 총점 표시 */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-violet-200/50 dark:border-violet-800/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">전체 점수</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                            {structuredData.total_score}
                          </span>
                          <span className="text-lg text-slate-600 dark:text-slate-400">/ 100</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(structuredData.total_score, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 영역별 분석 */}
                    <div className="grid gap-4">
                      {Object.entries(structuredData.areas).map(([areaName, areaData]: [string, any]) => (
                        <div key={areaName} className="bg-white dark:bg-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{areaName}</h4>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {areaData.score}/100
                            </span>
                          </div>
                          
                          {areaData.negative_points && areaData.negative_points.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">개선점</h5>
                              <ul className="space-y-1">
                                {areaData.negative_points.map((point: string, idx: number) => (
                                  <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {areaData.practical_advice && Array.isArray(areaData.practical_advice) && areaData.practical_advice.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">실용적 조언</h5>
                              <ul className="space-y-1">
                                {areaData.practical_advice.map((advice: string, idx: number) => (
                                  <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    <span>{advice}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {areaData.interviewer_impression && (
                            <div>
                              <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">면접관 관점</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{areaData.interviewer_impression}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 전반적인 조언 */}
                    {structuredData.general_advice && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">전반적인 조언</h4>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {structuredData.general_advice}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
              
              // 기존 텍스트 형태의 AI 피드백 표시
              return (
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-violet-200/50 dark:border-violet-800/50">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {typeof interview.ai_feedback === 'string' ? interview.ai_feedback : JSON.stringify(interview.ai_feedback, null, 2)}
                  </p>
                </div>
              );
            })()} 
          </div>
        )}

        {/* Back to List Button */}
        <div className="text-center">
          <Link 
            href="/interview/community"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            면접 후기 목록으로 돌아가기
          </Link>
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