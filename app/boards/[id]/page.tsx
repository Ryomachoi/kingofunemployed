'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface Board {
  id: string
  name: string
  description: string
  logo_icon: string
  category: string
  industry: string
  job_category: string
  tags: string[]
  headquarters_location: string
  created_at: string
  community_rules: string
}

interface Post {
  id: string
  title: string
  content: string
  author_id: string
  board_id: string
  created_at: string
  updated_at: string
  view_count: number
  like_count: number
  comment_count: number
  user_profiles?: {
    nickname: string
    display_name: string
  }
}

export default function BoardDetailPage() {
  const params = useParams()
  const resolvedParams = params as { id: string }
  const { user } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [actualPostCount, setActualPostCount] = useState(0)

  useEffect(() => {
    if (resolvedParams.id) {
      fetchBoardData()
      fetchPosts()
    }
  }, [resolvedParams.id])

  const fetchBoardData = async () => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) {
        console.error('게시판 데이터 가져오기 오류:', error)
        return
      }

      setBoard(data)
    } catch (error) {
      console.error('게시판 데이터 가져오기 오류:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      console.log('게시글 조회 시작:', resolvedParams.id)
      
      // posts 테이블이 존재하지 않을 경우를 대비해 간단한 처리
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          like_count,
          comment_count,
          author_id
        `)
        .eq('board_id', resolvedParams.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.warn('posts 테이블에 접근할 수 없습니다. 아직 게시글이 없거나 테이블이 생성되지 않았을 수 있습니다.')
        console.log('오류 상세:', error)
        setPosts([])
        setActualPostCount(0)
        return
      }

      setPosts(data || [])
      setActualPostCount(data?.length || 0)
    } catch (error) {
      console.warn('게시글을 불러올 수 없습니다:', error)
      setPosts([])
      setActualPostCount(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">게시판을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">게시판을 찾을 수 없습니다</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">요청하신 게시판이 존재하지 않거나 삭제되었습니다.</p>
          <Link
            href="/boards"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            게시판 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 게시판 헤더 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center space-x-4">
            {/* 게시판 로고 */}
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-2xl">
              {board.logo_icon || '📋'}
            </div>
            
            {/* 게시판 정보 */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {board.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                {board.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-xs font-medium">
                    {board.category}
                  </span>
                )}
                {board.industry && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md text-xs font-medium">
                    {board.industry}
                  </span>
                )}
                {board.job_category && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-md text-xs font-medium">
                    {board.job_category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 소개 섹션 - 게시판 이름 아래로 이동 */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-slate-600 dark:text-slate-400 mb-4">
              {board.description || '게시판 설명이 없습니다.'}
            </div>
            {board.tags && board.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {board.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 메인 콘텐츠 - 게시글 영역 (기존 게시판 정보 자리) */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">게시글</h2>
                  {user ? (
                    <Link
                      href={`/boards/${resolvedParams.id}/posts/new`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      글쓰기
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      로그인하여 글쓰기
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/boards/${resolvedParams.id}/posts/${post.id}`}
                      className="block hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
                              {post.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                              {post.content.replace(/\n/g, ' ').substring(0, 150)}
                              {post.content.length > 150 && '...'}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {post.author_id ? (
                                  post.user_profiles?.nickname || 
                                  post.user_profiles?.display_name || 
                                  post.author_id.substring(0, 8)
                                ) : '익명'}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(post.created_at).toLocaleDateString('ko-KR', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {post.updated_at !== post.created_at && (
                                <span className="text-orange-500 dark:text-orange-400">
                                  (수정됨)
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 ml-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {post.view_count || 0}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {post.like_count}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {post.comment_count}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      아직 작성된 게시글이 없습니다
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      이 게시판의 첫 번째 게시글을 작성해보세요!
                    </p>
                    {user ? (
                      <Link
                        href={`/boards/${resolvedParams.id}/posts/new`}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        첫 게시글 작성하기
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        로그인하여 글쓰기
                      </Link>
                    )}
                  </div>
                )}
              </div>
              
              {/* 페이지네이션 (추후 구현) */}
              {posts && posts.length >= 20 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    더 많은 게시글을 보려면 페이지네이션 기능을 구현해야 합니다.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* 우측 사이드바 - 규칙(위)과 통계(아래) 고정 */}
          <div className="lg:w-1/4 space-y-6">
            {/* 규칙 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">규칙</h2>
              {board.community_rules ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-600 dark:text-slate-400 text-sm">
                    {board.community_rules}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium mr-2 mt-0.5">1</span>
                    <span>서로를 존중하고 예의를 지켜주세요.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium mr-2 mt-0.5">2</span>
                    <span>스팸이나 광고성 게시물은 금지됩니다.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium mr-2 mt-0.5">3</span>
                    <span>주제와 관련된 내용을 게시해주세요.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium mr-2 mt-0.5">4</span>
                    <span>건설적인 토론과 피드백을 환영합니다.</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* 통계 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">통계</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">주 방문자</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">45.2k</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">게시글</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{actualPostCount || 0}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">활동성</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">76.5%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '76.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}