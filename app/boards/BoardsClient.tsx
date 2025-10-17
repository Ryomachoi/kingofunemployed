'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Board } from '@/types/database'
import SearchBar from '@/app/components/SearchBar'

interface BoardsClientProps {
  initialBoards: Board[]
  user: any
}

export default function BoardsClient({ initialBoards, user }: BoardsClientProps) {
  const [boards, setBoards] = useState<Board[]>(initialBoards)
  const [allBoards, setAllBoards] = useState<Board[]>(initialBoards)
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setBoards(allBoards)
    } else {
      const filtered = allBoards.filter(board => {
        const searchTerm = searchQuery.toLowerCase()
        return (
          board.name.toLowerCase().includes(searchTerm) ||
          (board.tags && board.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        )
      })
      setBoards(filtered)
    }
  }, [searchQuery, allBoards])

  return (
    <div className="mx-auto max-w-screen-xl px-3 sm:px-4 lg:px-6 py-6 min-h-screen">{/* 최소 높이 설정 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            기업별 게시판
          </h1>
        </div>

        <div className="order-3 w-full md:order-none md:w-auto md:flex-1 md:max-w-sm md:mx-4">
          <BoardSearchBar onSearch={setSearchQuery} />
        </div>

        {user ? (
          <Link
            href="/boards/new"
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 게시판 만들기
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            로그인하여 게시판 만들기
          </Link>
        )}
      </div>

      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col relative cursor-pointer"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                    {board.logo_image_url ? (
                      <img 
                        src={board.logo_image_url} 
                        alt={`${board.name} 로고`}
                        className="w-full h-full object-cover"
                      />
                    ) : board.logo_icon ? (
                      <span className="text-lg">{board.logo_icon}</span>
                    ) : (
                      <span className="text-lg">🏢</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
                      {board.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {board.industry || '대기업'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-2">
                  {board.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {board.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-end mb-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {board.post_count || 0}
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-1">
                    {board.tags && board.tags.length > 0 ? (
                      board.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          반도체
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          IT
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          전자제품
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : searchQuery && searchQuery.trim() !== '' ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">일치하는 게시판이 없습니다</p>
              <p className="text-slate-600 dark:text-slate-400">다른 검색어를 시도해보세요</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            아직 생성된 게시판이 없습니다
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            첫 번째 기업 게시판을 만들어보세요!
          </p>
          {user ? (
            <Link
              href="/boards/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              게시판 만들기
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              로그인하여 시작하기
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

interface BoardSearchBarProps {
  onSearch?: (query: string) => void
}

function BoardSearchBar({ onSearch }: BoardSearchBarProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-slate-400 dark:text-slate-500" 
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
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
          placeholder="게시판 검색..."
        />
      </div>
    </div>
  )
}