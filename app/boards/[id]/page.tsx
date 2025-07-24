'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getBoardById, getPostsByBoardId } from '../actions'

interface Post {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  view_count: number
  like_count: number
  comment_count: number
  tags?: string[]
  user_profiles?: {
    nickname?: string
    display_name?: string
  }
}

interface Board {
  id: string
  name: string
  description: string
  category: string
  headquarters_location?: string
  website?: string
  community_rules?: string
  created_at: string
}

export default function BoardPage() {
  const params = useParams()
  const { user } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'title' | 'content' | 'tags'>('title')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved as { id: string })
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams?.id) {
      loadBoard()
      loadPosts()
    }
  }, [resolvedParams, currentPage, searchQuery, searchType])

  const loadBoard = async () => {
    if (!resolvedParams?.id) return
    
    try {
      const boardData = await getBoardById(resolvedParams.id)
      setBoard(boardData)
    } catch (error) {
      console.error('게시판 로딩 실패:', error)
    }
  }

  const loadPosts = async () => {
    if (!resolvedParams?.id) return
    
    try {
      setLoading(true)
      const { posts: postsData, totalPages: total } = await getPostsByBoardId(
        resolvedParams.id,
        currentPage,
        searchQuery,
        searchType
      )
      setPosts(postsData)
      setTotalPages(total)
    } catch (error) {
      console.error('게시글 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadPosts()
  }

  const filterPosts = (posts: Post[]) => {
    if (!searchQuery.trim()) return posts
    
    return posts.filter(post => {
      switch (searchType) {
        case 'title':
          return post.title.toLowerCase().includes(searchQuery.toLowerCase())
        case 'content':
          return post.content.toLowerCase().includes(searchQuery.toLowerCase())
        case 'tags':
          return post.tags?.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
        default:
          return true
      }
    })
  }

  const filteredPosts = filterPosts(posts)

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">게시판을 찾을 수 없습니다</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{board.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{board.description}</p>
            </div>
            {user && (
              <Link
                href={`/boards/${resolvedParams.id}/posts/new`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                글쓰기
              </Link>
            )}
          </div>

          {/* 검색 */}
          <form onSubmit={handleSearch} className="flex gap-4 items-center">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'title' | 'content' | 'tags')}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="tags">태그</option>
            </select>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${searchType === 'title' ? '제목' : searchType === 'content' ? '내용' : '태그'}으로 검색...`}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="flex gap-8">
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {/* 게시글 목록 */}
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">게시글을 불러오는 중...</p>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/boards/${resolvedParams.id}/posts/${post.id}`}
                      className="block hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {/* 추천수 - 게시글 제목 앞에 큰 숫자로 표시 */}
                            <div className="flex flex-col items-center justify-center min-w-[60px]">
                              <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                                {post.like_count || 0}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                추천
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
                                {post.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                                {post.content.replace(/\n/g, ' ').substring(0, 150)}
                                {post.content.length > 150 && '...'}
                              </p>
                              
                              {/* 태그 표시 */}
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {post.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {post.tags.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs text-slate-500 dark:text-slate-400">
                                      +{post.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* 오른쪽 정보 영역 */}
                          <div className="flex flex-col items-end justify-between h-full ml-4 min-h-[120px]">
                            {/* 작성자와 시간 - 오른쪽 상단 */}
                            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
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
                                {(() => {
                                  const now = new Date()
                                  const postDate = new Date(post.created_at)
                                  const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))
                                  
                                  if (diffInMinutes < 1) return '방금 전'
                                  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
                                  
                                  const diffInHours = Math.floor(diffInMinutes / 60)
                                  if (diffInHours < 24) return `${diffInHours}시간 전`
                                  
                                  const diffInDays = Math.floor(diffInHours / 24)
                                  if (diffInDays < 7) return `${diffInDays}일 전`
                                  
                                  return postDate.toLocaleDateString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                })()
                              }
                              </div>
                            </div>
                            
                            {/* 조회수와 댓글 개수 - 오른쪽 하단 */}
                            <div className="flex items-center space-x-3 text-xs">
                              <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="font-medium text-blue-600 dark:text-blue-400">{post.view_count || 0}</span>
                              </div>
                              
                              <div className="flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="font-medium text-green-600 dark:text-green-400">{post.comment_count || 0}</span>
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
                    {searchQuery ? (
                      <>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">다른 키워드로 검색해보세요.</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">아직 게시글이 없습니다</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">첫 번째 게시글을 작성해보세요!</p>
                      </>
                    )}
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