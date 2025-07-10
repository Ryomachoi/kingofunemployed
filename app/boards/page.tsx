import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function BoardsPage() {
  const supabase = await createClient()
  
  // 게시판 목록 조회
  const { data: boards, error } = await supabase
    .from('boards')
    .select('*')
    .eq('is_active', true)
    .order('post_count', { ascending: false })

  if (error) {
    console.error('게시판 조회 오류:', error)
  }

  // 사용자 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            기업 게시판
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            기업별로 정보를 공유하고 소통하는 공간입니다
          </p>
        </div>
        {user && (
          <Link 
            href="/boards/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 게시판 만들기
          </Link>
        )}
      </div>

      {/* 게시판 목록 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boards && boards.length > 0 ? (
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="block p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {board.name}
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {board.post_count}개
                </span>
              </div>
              
              {board.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {board.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  생성일: {new Date(board.created_at).toLocaleDateString('ko-KR')}
                </span>
                <span className="text-blue-600 dark:text-blue-400 group-hover:underline">
                  게시판 입장 →
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              아직 생성된 게시판이 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              첫 번째 기업 게시판을 만들어보세요!
            </p>
            {user ? (
              <Link 
                href="/boards/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                게시판 만들기
              </Link>
            ) : (
              <Link 
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                로그인하여 게시판 만들기
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 인기 게시판 섹션 */}
      {boards && boards.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            인기 게시판 TOP 5
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {boards.slice(0, 5).map((board, index) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium rounded">
                    {index + 1}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {board.name}
                  </span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {board.post_count}개 게시글
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}