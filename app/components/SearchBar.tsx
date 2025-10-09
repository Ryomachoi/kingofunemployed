'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Post, UserProfile, Board } from '@/types/database'

interface PostWithDetails extends Post {
  user_profiles: UserProfile | null
  boards: Board | null
}

interface SearchResult {
  success: boolean
  posts: PostWithDetails[]
  total: number
  query: string
}

interface SearchBarProps {
  onSearch?: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PostWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [total, setTotal] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 검색 실행
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotal(0)
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data: SearchResult = await response.json()
      
      if (data.success) {
        setResults(data.posts)
        setTotal(data.total)
        setIsOpen(true)
      } else {
        setResults([])
        setTotal(0)
        setIsOpen(false)
      }
    } catch (error) {
      console.error('검색 오류:', error)
      setResults([])
      setTotal(0)
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  // 디바운스된 검색
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
      // 부모 컴포넌트에 검색 쿼리 전달
      if (onSearch) {
        onSearch(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  // 외부 클릭 시 검색 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 검색 결과 클릭 시 검색창 닫기
  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* 검색 입력창 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-slate-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="게시물 제목, 내용, 태그 검색..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <>
              {/* 검색 결과 헤더 */}
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  총 {total}개의 검색 결과
                </p>
              </div>
              
              {/* 검색 결과 목록 */}
              <div className="py-2">
                {results.map((post) => (
                  <Link
                    key={post.id}
                    href={`/boards/${post.board_id}/posts/${post.id}`}
                    onClick={handleResultClick}
                    className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      {/* 게시판 로고 */}
                      <div className="flex-shrink-0">
                        {post.boards?.logo_image_url ? (
                          <img
                            src={post.boards.logo_image_url}
                            alt={post.boards.name}
                            className="w-8 h-8 object-contain rounded"
                          />
                        ) : post.boards?.logo_icon ? (
                          <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded text-sm">
                            {post.boards.logo_icon}
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 게시물 정보 */}
                      <div className="flex-1 min-w-0">
                        {/* 게시판 이름 */}
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          {post.boards?.name || '알 수 없는 게시판'}
                        </p>
                        
                        {/* 제목 */}
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                          {post.title}
                        </h4>
                        
                        {/* 내용 미리보기 */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                          {post.content.replace(/[#*`]/g, '').trim().substring(0, 100)}...
                        </p>
                        
                        {/* 태그 */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 조회수 */}
                      <div className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        조회 {post.view_count || 0}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* 더 많은 결과 보기 */}
              {total > results.length && (
                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    {total - results.length}개의 추가 결과가 있습니다
                  </p>
                </div>
              )}
            </>
          ) : query.trim() && !isLoading ? (
            <div className="px-4 py-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  일치하는 결과가 없습니다
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  다른 검색어를 시도해보세요
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}