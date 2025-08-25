'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProfileEditor from './ProfileEditor'
import { updateProfile, deleteAccount } from './actions'
import type { UserProfile } from '@/types/database'
import DeleteAccountButton from './DeleteAccountButton'

interface MyPageProps {
  user: any
  profile: UserProfile | null
  posts: any[]
  comments: any[]
  interviews: any[]
}

export default function MyPageClient({ user, profile, posts, comments, interviews }: MyPageProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const stats = {
    posts: posts?.length || 0,
    comments: comments?.length || 0,
    interviews: interviews?.length || 0
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 py-8">
          {/* 사이드바 */}
          <div className="lg:w-80 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
          {/* 프로필 카드 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">
                  {(profile?.display_name || user.email.charAt(0)).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {profile?.display_name || user.email.split('@')[0]}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {user.email}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                VIP 멤버
              </span>
            </div>
            
            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.posts}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">게시물</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.comments}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">댓글</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.interviews}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">면접후기</div>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              프로필 수정
            </button>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">👤</span>
                  프로필
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'posts'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">🏢</span>
                  작성한 게시물
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'comments'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">📝</span>
                  작성한 댓글
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('interviews')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'interviews'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">💼</span>
                  면접 후기
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'activity'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">📊</span>
                  활동 내역
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">⚙️</span>
                  설정
                </button>
              </li>
            </ul>
          </nav>
        </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">프로필 정보</h1>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      이름
                    </label>
                    <p className="text-xl text-gray-900 dark:text-white font-semibold">
                      {profile?.display_name || user.email.split('@')[0]}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      이메일
                    </label>
                    <p className="text-xl text-gray-900 dark:text-white font-semibold">
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      가입일
                    </label>
                    <p className="text-xl text-gray-900 dark:text-white font-semibold">
                      {new Date(user.created_at || '2024-01-15').toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <ProfileEditor 
                    userId={user.id}
                    initialNickname={profile?.nickname || ''}
                    initialDisplayName={profile?.display_name || user.id.substring(0, 8)}
                    onUpdateProfile={updateProfile}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="max-w-4xl">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">작성한 게시물</h1>
              </div>
              
              <div className="space-y-4">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <Link key={post.id} href={`/board/${post.board_id}/post/${post.id}`} className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {(post.boards as any)?.name ?? '게시판'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {post.title}
                          </h3>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          ✏️
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            ❤️ 124
                          </span>
                          <span className="flex items-center gap-1">
                            💬 {post.comment_count}
                          </span>
                          <span className="flex items-center gap-1">
                            👁️ 1250
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">작성한 게시물이 없습니다</h3>
                    <p className="text-gray-500 dark:text-gray-400">아직 작성한 게시물이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">작성한 댓글</h1>
              
              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {(comment.posts as any)?.boards?.name ?? '게시판'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white mb-2">
                            {comment.content.length > 200 
                              ? comment.content.substring(0, 200) + '...' 
                              : comment.content
                            }
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            게시글: {(comment.posts as any)?.title ?? '제목 없음'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">작성한 댓글이 없습니다</h3>
                    <p className="text-gray-500 dark:text-gray-400">다른 사용자의 게시물에 댓글을 남겨보세요!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">면접 후기</h1>
              
              {interviews && interviews.length > 0 ? (
                <div className="space-y-6">
                  {interviews.map((interview: any) => (
                    <Link key={interview.id} href={`/interview/${interview.id}`}>
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {interview.company_name} - {interview.position}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              {interview.interview_date && (
                                <span>면접일: {new Date(interview.interview_date).toLocaleDateString('ko-KR')}</span>
                              )}
                              {interview.interview_type && (
                                <span>유형: {interview.interview_type}</span>
                              )}
                              {interview.difficulty_level && (
                                <span>난이도: {interview.difficulty_level}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {interview.overall_rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">⭐</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {interview.overall_rating}/5
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {interview.result && (
                          <div className="mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              interview.result === '합격' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : interview.result === '불합격'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {interview.result}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          작성일: {new Date(interview.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      아직 작성한 면접 후기가 없습니다
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                      첫 번째 면접 후기를 작성하고 AI 분석을 받아보세요!
                    </p>
                    <Link
                      href="/interview/analyze"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      면접 후기 작성하기
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">설정</h1>
              
              <div className="space-y-6">
                {/* 알림 설정 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">알림 설정</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">댓글 알림</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">내 게시물에 댓글이 달릴 때</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">좋아요 알림</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">내 게시물이나 댓글에 좋아요를 받을 때</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>



                {/* 계정 관리 */}
                <div className="bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800 p-6">
                  <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">계정 관리</h2>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">회원탈퇴 시 주의사항</h3>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• 작성한 모든 게시글과 댓글이 삭제됩니다.</li>
                      <li>• 프로필 정보가 완전히 삭제됩니다.</li>
                      <li>• 탈퇴 후에는 동일한 계정으로 재가입이 어려울 수 있습니다.</li>
                      <li>• 이 작업은 되돌릴 수 없습니다.</li>
                    </ul>
                  </div>
                  <DeleteAccountButton onDeleteAccount={deleteAccount} />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}