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
  category: string
  industry: string
  job_category: string
  headquarters_location: string
  website: string
  tags: string[]
  logo_image_url: string
  banner_image_url: string
  community_rules: string
  created_at: string
  creator_id: string
  post_count: number
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
    nickname?: string
    display_name?: string
  }
}

export default function BoardPage() {
  const params = useParams()
  const resolvedParams = params as { id: string }
  const { user } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [actualPostCount, setActualPostCount] = useState(0)


  const fetchBoardData = async () => {
    try {
      console.log('게시판 데이터 가져오기 시작:', resolvedParams.id)
      
      // 게시판 정보 가져오기
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (boardError) {
        console.error('게시판 데이터 가져오기 오류:', boardError)
        return
      }

      console.log('게시판 데이터:', boardData)
      console.log('배너 이미지 URL:', boardData.banner_image_url)
      setBoard(boardData)

      // 게시글 가져오기 - 먼저 게시글만 가져오기
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('board_id', resolvedParams.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (postsError) {
        console.error('게시글 데이터 가져오기 오류:', postsError)
        setPosts([])
        setActualPostCount(0)
      } else if (postsData) {
        // 각 게시글에 대해 사용자 프로필 정보 추가
        const postsWithProfiles = await Promise.all(
          postsData.map(async (post) => {
            if (post.author_id) {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('nickname, display_name')
                .eq('id', post.author_id)
                .single()
              
              return {
                ...post,
                user_profiles: profile
              }
            }
            return post
          })
        )
        
        console.log('게시글 데이터:', postsWithProfiles)
        setPosts(postsWithProfiles || [])
        setActualPostCount(postsWithProfiles?.length || 0)
      }
    } catch (error) {
      console.error('게시글 데이터 가져오기 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resolvedParams.id) {
      fetchBoardData()
    }
  }, [resolvedParams.id])

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">게시판을 찾을 수 없습니다</h1>
          <Link
            href="/boards"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            게시판 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
       {/* 게시판 헤더 - 전체 폭 배너 스타일 */}
       <div className="relative bg-white dark:bg-slate-800 h-48 mb-6 overflow-hidden">
         {/* 배너 이미지 배경 */}
         {board.banner_image_url && (
           <div className="absolute inset-0 overflow-hidden">
             <img 
               src={board.banner_image_url}
               alt={`${board.name} 배너`}
               className="w-full h-full object-cover opacity-20"
               onLoad={(e) => {
                 console.log('✅ 배너 이미지 로딩 성공:', board.banner_image_url)
                 console.log('이미지 크기:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight)
               }}
               onError={(e) => {
                 console.log('❌ 배너 이미지 로딩 실패:', board.banner_image_url)
                 console.log('오류 상세:', e.type, e.target)
               }}
             />
           </div>
         )}
         
         {/* 콘텐츠 영역 */}
         <div className="relative z-10 h-full flex items-start justify-start">
          <div className="max-w-7xl mx-auto px-8 py-8 w-full">
           <div className="flex items-center gap-6">
             {/* 게시판 로고 */}
             <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
               {board.logo_image_url ? (
                 <img 
                   src={board.logo_image_url}
                   alt={`${board.name} 로고`}
                   className="w-full h-full object-cover rounded-xl"
                 />
               ) : (
                 <span className="text-white font-bold text-xl">
                   {board.name.charAt(0)}
                 </span>
               )}
             </div>
             
             {/* 게시판 정보 */}
             <div className="text-white">
               <h1 className="text-4xl font-bold drop-shadow-lg">{board.name}</h1>
             </div>
           </div>
          </div>
         </div>
       </div>
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 소개 섹션 */}
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
          {/* 메인 콘텐츠 - 게시글 영역 */}
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
                                {new Date(post.created_at).toLocaleDateString('ko-KR')}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {post.view_count || 0}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {post.comment_count || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">아직 게시글이 없습니다</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">첫 번째 게시글을 작성해보세요!</p>
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
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">게시판 정보</h3>
              
              <div className="space-y-4">
                {board.headquarters_location && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">본사 위치</dt>
                    <dd className="text-sm text-slate-900 dark:text-slate-100">{board.headquarters_location}</dd>
                  </div>
                )}
                
                {board.website && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">웹사이트</dt>
                    <dd className="text-sm">
                      <a 
                        href={board.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {board.website}
                      </a>
                    </dd>
                  </div>
                )}
                
                {board.community_rules && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">커뮤니티 규칙</dt>
                    <dd className="text-sm text-slate-900 dark:text-slate-100">{board.community_rules}</dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">생성일</dt>
                  <dd className="text-sm text-slate-900 dark:text-slate-100">
                    {new Date(board.created_at).toLocaleDateString('ko-KR')}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}