'use client'

import Link from 'next/link'
import { getAllPosts } from '@/app/boards/actions'
import { useState, useEffect } from 'react'
import { Post, UserProfile, Board } from '@/types/database'
import SearchBar from '@/app/components/SearchBar'

interface PostWithDetails extends Post {
  user_profiles: UserProfile | null
  boards: Board | null
}

interface PostListProps {
  sortBy: 'latest' | 'views'
  searchQuery?: string
}

function PostList({ sortBy, searchQuery }: PostListProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [allPosts, setAllPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      setError(null)
      try {
        const result = await getAllPosts(sortBy, 20)
        if (result.success && result.posts) {
          const fetchedPosts = result.posts as PostWithDetails[]
          setAllPosts(fetchedPosts)
          setPosts(fetchedPosts)
        } else {
          setError('게시물을 불러올 수 없습니다.')
        }
      } catch (err) {
        setError('게시물을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [sortBy])

  // 검색 필터링 효과
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setPosts(allPosts)
    } else {
      const filtered = allPosts.filter(post => {
        const searchTerm = searchQuery.toLowerCase()
        return (
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        )
      })
      setPosts(filtered)
    }
  }, [searchQuery, allPosts])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-[60px] h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
      </div>
    )
  }

  if (posts.length === 0 && !loading && !error) {
    if (searchQuery && searchQuery.trim() !== '') {
      return (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">일치하는 게시물이 없습니다</p>
              <p className="text-slate-600 dark:text-slate-400">다른 검색어를 시도해보세요</p>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">게시물이 없습니다.</p>
        </div>
      )
    }
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/boards/${post.board_id}/posts/${post.id}`}
          className="block bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-start space-x-3">
            {/* 게시판 로고 */}
            <div className="flex-shrink-0">
              {post.boards?.logo_image_url ? (
                <img
                  src={post.boards.logo_image_url}
                  alt={post.boards.name}
                  className="w-[48px] h-12 object-contain rounded"
                />
              ) : post.boards?.logo_icon ? (
                <div className="w-[48px] h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded text-lg">
                  {post.boards.logo_icon}
                </div>
              ) : (
                <div className="w-[48px] h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>

            {/* 게시물 내용 */}
            <div className="flex-1 min-w-0 relative">
              {/* 작성시간 - 오른쪽 상단 */}
              <div className="absolute top-0 right-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(post.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>

              {/* 게시판 이름 */}
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 pr-20">
                {post.boards?.name || '알 수 없는 게시판'}
              </div>

              {/* 제목 */}
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 line-clamp-2 pr-20">
                {post.title}
              </h3>

              {/* 내용 미리보기 */}
              <div className="text-slate-600 dark:text-slate-400 text-sm mb-2 line-clamp-2 leading-relaxed">
                {(() => {
                  const cleanContent = post.content.replace(/[#*`]/g, '').trim();
                  const lines = cleanContent.split('\n').filter(line => line.trim());
                  const displayLines = lines.slice(0, 2);
                  const hasMore = lines.length > 2 || cleanContent.length > 150;
                  return displayLines.join(' ') + (hasMore ? '...' : '');
                })()}
              </div>

              {/* 태그 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.slice(0, 8).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 8 && (
                    <span className="inline-block px-2 py-0.5 text-xs text-slate-500 dark:text-slate-500">
                      +{post.tags.length - 8}
                    </span>
                  )}
                </div>
              )}

              {/* 메타 정보 */}
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-4">
                  <span>{post.user_profiles?.nickname || post.user_profiles?.display_name || '익명'}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{post.view_count || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comment_count || 0}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function ClientHomePage() {
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest')
  const [popularBoards, setPopularBoards] = useState<Board[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  // 인기 게시판 데이터 가져오기
  useEffect(() => {
    async function fetchPopularBoards() {
      try {
        const response = await fetch('/api/boards/popular')
        if (response.ok) {
          const data = await response.json()
          setPopularBoards(data.boards || [])
        }
      } catch (error) {
        console.error('인기 게시판 조회 오류:', error)
      }
    }
    
    fetchPopularBoards()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">인기 게시물</h1>
                </div>
                
                {/* 검색창 */}
                <div className="flex-1 max-w-md mx-8">
                  <SearchBar onSearch={setSearchQuery} />
                </div>
                
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                  <button
                    onClick={() => setSortBy('views')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-l border-slate-200 dark:border-slate-600 ${
                      sortBy === 'views'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    조회
                  </button>
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-l border-slate-200 dark:border-slate-600 ${
                      sortBy === 'latest'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    최신
                  </button>
                </div>
              </div>
            </div>
            
            <PostList sortBy={sortBy} searchQuery={searchQuery} />
          </div>

          {/* 사이드바 */}
          <div className="w-80 space-y-6">
            {/* 인기 게시판 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">인기 게시판</h2>
              <div className="space-y-3">
                {popularBoards.slice(0, 10).map((board, index) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-6">
                      {index + 1}
                    </span>
                    <div className="flex-shrink-0">
                      {board.logo_image_url ? (
                        <img
                          src={board.logo_image_url}
                          alt={board.name}
                          className="w-8 h-8 object-contain rounded"
                        />
                      ) : board.logo_icon ? (
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded text-sm">
                          {board.logo_icon}
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {board.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {board.post_count || 0}개 게시물
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* AI 면접 복기 섹션 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI 면접 복기</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                AI 기반 면접 코치로 개인화된 피드백을 받고 면접 연습을 해보세요.
              </p>
              <Link
                href="/interview"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>AI 코치 체험</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Link href="/boards" className="group">
          <div className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            게시판
          </div>
        </Link>
        
        <Link href="/interview" className="group">
          <div className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            면접 복기
          </div>
        </Link>
      </div>
    </div>
  )
}