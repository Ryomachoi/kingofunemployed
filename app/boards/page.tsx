import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Board } from '@/types/database'

export default async function BoardsPage() {
  const supabase = await createClient()
  
  // 게시판 목록 조회 (실제 게시글 수 집계)
  const { data: boardsData, error } = await supabase
    .from('boards')
    .select(`
      id,
      name,
      description,
      category,
      industry,
      job_category,
      headquarters_location,
      website,
      tags,
      logo_image_url,
      banner_image_url,
      community_rules,
      created_at,
      creator_id
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // 각 게시판의 실제 게시글 수 집계
  let boards: Board[] = []
  if (boardsData) {
    boards = await Promise.all(
      boardsData.map(async (board) => {
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('board_id', board.id)
          .eq('is_deleted', false)
        
        return {
          ...board,
          post_count: count || 0
        } as Board
      })
    )
    
    // 게시글 수로 정렬
    boards.sort((a, b) => (b.post_count ?? 0) - (a.post_count ?? 0))
  }

  if (error) {
    console.error('게시판 조회 오류:', error)
  }
  
  // 디버깅: 데이터 확인
  console.log('게시판 데이터:', boards)

  // 사용자 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            기업별 게시판
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            관심 있는 기업의 게시판에서 취업 정보와 경험을 공유해보세요
          </p>
        </div>
        
        {user ? (
          <Link
            href="/boards/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 게시판 만들기
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            로그인하여 게시판 만들기
          </Link>
        )}
      </div>

      {/* 게시판 목록 */}
      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div key={board.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[280px]">
              <div className="p-5 flex-1 flex flex-col">
                {/* 로고와 게시판 이름 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {board.logo_image_url ? (
                      <img 
                        src={board.logo_image_url} 
                        alt={`${board.name} 로고`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span>🏢</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base truncate">
                      {board.name}
                    </h3>
                  </div>
                </div>
                
                {/* 카테고리, 업종, 직무 정보 */}
                {(board.category || board.industry || board.job_category) && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {board.category && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {board.category}
                        </span>
                      )}
                      {board.industry && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                          {board.industry}
                        </span>
                      )}
                      {board.job_category && (
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                          {board.job_category}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 설명 */}
                <div className="mb-2">
                  {board.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                      {board.description}
                    </p>
                  )}
                </div>
                
                {/* 태그 */}
                <div className="mb-4 min-h-[28px]">
                  {board.tags && board.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {board.tags.slice(0, 3).map((tag, index) => {
                        // 태그에서 '#' 제거하고 표시
                        const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
                        return (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                          >
                            {cleanTag}
                          </span>
                        );
                      })}
                      {board.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
                          +{board.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* 게시물 수 정보 */}
                <div className="mt-auto">
                  <div className="flex items-center pt-2 border-t border-slate-100 dark:border-slate-700 mb-4">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {board.post_count || 0}개 게시물
                    </div>
                  </div>
                  
                  {/* 게시판 보기 버튼 */}
                  <div className="flex">
                    <Link
                      href={`/boards/${board.id}`}
                      className="w-full py-2 px-4 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      게시판 보기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
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