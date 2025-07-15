import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function BoardsPage() {
  const supabase = await createClient()
  
  // 게시판 목록 조회 (실제 게시글 수 집계)
  const { data: boardsData, error } = await supabase
    .from('boards')
    .select(`
      id,
      name,
      description,
      created_at,
      creator_id
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // 각 게시판의 실제 게시글 수 집계
  let boards = []
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
        }
      })
    )
    
    // 게시글 수로 정렬
    boards.sort((a, b) => b.post_count - a.post_count)
  }

  if (error) {
    console.error('게시판 조회 오류:', error)
  }

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
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="group block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {board.name}
                  </h3>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {board.post_count}
                  </div>
                </div>
                
                {board.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {board.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    생성일: {new Date(board.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <span>
                    게시글 {board.post_count}개
                  </span>
                </div>
              </div>
            </Link>
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

      {/* 인기 게시판 섹션 */}
      {boards && boards.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            인기 게시판 TOP 5
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {boards.slice(0, 5).map((board, index) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700 last:border-b-0"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {board.name}
                    </h3>
                    {board.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-md">
                        {board.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {board.post_count}개 게시글
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}