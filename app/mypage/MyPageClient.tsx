'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProfileEditor from './ProfileEditor'
import { updateProfile, deleteAccount } from './actions'
import type { UserProfile } from '@/types/database'
import DeleteAccountButton from './DeleteAccountButton'
import ThemeToggle from './ThemeToggle'

interface MyPageProps {
  user: any
  profile: UserProfile | null
  posts: any[]
  comments: any[]
  interviews: any[]
  likedPosts: any[]
}

export default function MyPageClient({ user, profile, posts, comments, interviews, likedPosts }: MyPageProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const stats = {
    posts: posts?.length || 0,
    comments: comments?.length || 0,
    interviews: interviews?.length || 0
  }

  // 하이드레이션 불일치 방지를 위한 안정적인 날짜 포맷 (ISO 기반)
  const createdDateText = (() => {
    try {
      const d = new Date(user?.created_at || '2024-01-15')
      // YYYY-MM-DD 형태로 고정 포맷
      return d.toISOString().slice(0, 10)
    } catch {
      return '2024-01-15'
    }
  })()

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 py-8">
          {/* 사이드바 */}
          <div className="lg:w-80 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            {/* 프로필 카드 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile?.display_name || user.user_metadata?.nickname || user.email.split('@')[0]}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {user.user_metadata?.original_naver_email || user.email}
                </p>
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
            </div>

            {/* 네비게이션 */}
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
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    프로필
                  </button>
                </li>
                {/* 면접 후기: 프로필 바로 아래로 이동 */}
                <li>
                  <button
                    onClick={() => setActiveTab('interviews')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'interviews'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6M9 11h6M9 15h6M7 11h.01M7 15h.01" />
                      </svg>
                    </div>
                    면접 후기
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
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
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
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    작성한 댓글
                  </button>
                </li>
                {/* 추가 메뉴 */}
                <li>
                  <button
                    onClick={() => setActiveTab('liked')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'liked'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                      </svg>
                    </div>
                    추천한 게시물
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
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            이름
                          </label>
                          <p className="text-lg text-gray-900 dark:text-white font-medium">
                            {profile?.display_name || user.user_metadata?.nickname || user.email.split('@')[0]}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            이메일
                          </label>
                          <p className="text-lg text-gray-900 dark:text-white font-medium">
                            {user.user_metadata?.original_naver_email || user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            가입일
                          </label>
                          <p className="text-lg text-gray-900 dark:text-white font-medium">
                            {createdDateText}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            닉네임
                          </label>
                          <div className="text-lg text-gray-900 dark:text-white font-medium">
                            <ProfileEditor 
                              userId={user.id}
                              initialNickname={profile?.nickname || ''}
                              initialDisplayName={profile?.display_name || user.id.substring(0, 8)}
                              onUpdateProfile={updateProfile}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">작성한 게시물</h1>
                
                {posts && posts.length > 0 ? (
                  <div className="grid gap-6">
                    {posts.map((post) => (
                      <Link key={post.id} href={`/boards/${post.board_id}/posts/${post.id}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {(post.boards as any)?.name ?? '게시판'}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {post.title}
                                </h3>
                              </div>
                              {/* 게시물 내용 표시 */}
                              {post.content && (
                                <div className="mt-3 mb-4">
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                                    {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                  </p>
                                </div>
                              )}
                            </div>
                            {/* 상단 오른쪽 날짜 표시 제거 (아래 메타 영역으로 이동) */}
                          </div>
                          {/* 메타 정보: 추천수, 조회수, 댓글, 작성시간 */}
                          <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-6">
                              {/* 추천수 */}
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                </svg>
                                <span>{post.like_count || 0}</span>
                              </span>
                              {/* 조회수 */}
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{post.view_count || 0}</span>
                              </span>
                              {/* 댓글 */}
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{post.comment_count || 0}</span>
                              </span>
                            </div>
                            {/* 작성 시간 */}
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">작성한 게시물이 없습니다</h3>
                    <p className="text-gray-500 dark:text-gray-400">아직 작성한 게시물이 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">작성한 댓글</h1>
                
                {comments && comments.length > 0 ? (
                  <div className="grid gap-6">
                    {comments.map((comment: any) => (
                      <Link key={comment.id} href={`/boards/${comment.posts?.board_id}/posts/${comment.post_id}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {comment.posts?.boards?.name ?? '게시판'}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {comment.posts?.title || '게시물 보기'}
                                </h3>
                              </div>
                              {comment.content && (
                                <div className="mt-3 mb-4">
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                                    {comment.content}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* 메타 정보: 댓글 표시, 작성시간 */}
                          <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>내 댓글</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{new Date(comment.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">작성한 댓글이 없습니다</h3>
                    <p className="text-gray-500 dark:text-gray-400">아직 작성한 댓글이 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">내 면접 후기</h1>
                
                {interviews && interviews.length > 0 ? (
                  <div className="grid gap-6">
                    {interviews.map((interview: any) => (
                      <Link key={interview.id} href={`/interview/${interview.id}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer relative">
                          {/* 작성 시간 - 오른쪽 상단 */}
                          <div className="absolute top-4 right-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(interview.created_at).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>

                          {/* 전체 평점 - 오른쪽 중단 */}
                          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">평점 :</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= interview.overall_rating
                                      ? 'text-blue-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>

                          {/* 질문 개수 - 오른쪽 하단 */}
                          <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
                            질문 {interview.question_count}개
                          </div>

                          <div className="pr-20">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {interview.company_name}
                              </h3>
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                                {interview.position}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>면접일: {new Date(interview.interview_date).toLocaleDateString('ko-KR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>
                                  {interview.interview_type === 'phone' ? '전화면접' :
                                   interview.interview_type === 'video' ? '화상면접' :
                                   interview.interview_type === 'in_person' ? '대면면접' :
                                   interview.interview_type === 'coding' ? '코딩테스트' :
                                   interview.interview_type === 'technical' ? '기술면접' :
                                   interview.interview_type === 'behavioral' ? '인성면접' :
                                   interview.interview_type === 'group' ? '그룹면접' :
                                   interview.interview_type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">난이도:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  interview.difficulty_level === 'easy'
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : interview.difficulty_level === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                }`}>
                                  {interview.difficulty_level === 'easy' ? '쉬움' :
                                   interview.difficulty_level === 'medium' ? '보통' : '어려움'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  interview.result === 'pass' 
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : interview.result === 'fail'
                                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    : interview.result === 'pending'
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                }`}>
                                  {interview.result === 'pass' ? '합격' : 
                                   interview.result === 'fail' ? '불합격' : 
                                   interview.result === 'pending' ? '대기중' : 
                                   interview.result === 'in_progress' ? '진행중' : interview.result}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">작성한 면접 후기가 없습니다</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">면접 경험을 공유하고 다른 구직자들에게 도움을 주세요.</p>
                    <Link 
                      href="/interview/analyze"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      면접 후기 작성하기
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'liked' && (
              <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">추천한 게시물</h1>
                {likedPosts && likedPosts.length > 0 ? (
                  <div className="grid gap-6">
                    {likedPosts.map((post: any) => (
                      <Link key={post.id} href={`/boards/${post.board_id}/posts/${post.id}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {(post.boards as any)?.name ?? '게시판'}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {post.title}
                                </h3>
                              </div>
                              {post.content && (
                                <div className="mt-3 mb-4">
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                                    {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-6">
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                </svg>
                                <span>{post.like_count || 0}</span>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{post.view_count || 0}</span>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v9m-7-6h14" />
                                </svg>
                                <span>{post.comment_count || 0}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 19h14M5 7h14" />
                              </svg>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4">💗</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">아직 추천한 게시물이 없습니다</h3>
                    <p className="text-gray-500 dark:text-gray-400">관심있는 게시물에 추천을 눌러보세요.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">설정</h1>
                
                <div className="space-y-6">
                  {/* 다크모드 설정 */}
                  <ThemeToggle />

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