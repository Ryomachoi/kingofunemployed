import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BoardDetailPageProps {
  params: {
    id: string
  }
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // 게시판 정보 조회
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('is_active', true)
    .single()

  if (boardError || !board) {
    notFound()
  }

  // 게시글 목록 조회 (댓글 개수 포함)
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      *,
      comments!left(count)
    `)
    .eq('board_id', resolvedParams.id)
    .eq('is_deleted', false)
    .eq('comments.is_deleted', false)
    .order('created_at', { ascending: false })

  // 게시글 작성자 정보 조회 및 댓글 개수 계산
  let postsWithAuthors = []
  if (posts && posts.length > 0) {
    const authorIds = [...new Set(posts.map(post => post.author_id).filter(Boolean))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', authorIds)
    
    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || [])
    postsWithAuthors = posts.map(post => ({
      ...post,
      profiles: post.author_id ? profileMap.get(post.author_id) : null,
      comment_count: post.comments?.length || 0
    }))
  }

  if (postsError) {
    console.error('게시글 조회 오류:', postsError)
  }

  // 사용자 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container py-8">
      {/* 브레드크럼 */}
      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <Link href="/boards" className="hover:text-slate-900 dark:hover:text-slate-100">
          게시판
        </Link>
        <span>›</span>
        <span>{board.name}</span>
      </div>

      {/* 게시판 헤더 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {board.name}
            </h1>
            {board.description && (
              <p className="text-slate-600 dark:text-slate-400">
                {board.description}
              </p>
            )}
          </div>
          {user && (
            <Link 
              href={`/boards/${board.id}/posts/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              글쓰기
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
          <span>게시글 {postsWithAuthors.length}개</span>
          <span>•</span>
          <span>생성일 {new Date(board.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {postsWithAuthors && postsWithAuthors.length > 0 ? (
          <>
            {/* 테이블 헤더 */}
            <div className="bg-slate-50 dark:bg-slate-700 px-6 py-3 border-b border-slate-200 dark:border-slate-600">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="col-span-5">제목</div>
                <div className="col-span-2 text-center">작성자</div>
                <div className="col-span-2 text-center">작성일</div>
                <div className="col-span-1 text-center">조회</div>
                <div className="col-span-1 text-center">댓글</div>
                <div className="col-span-1 text-center">추천</div>
              </div>
            </div>
            
            {/* 게시글 목록 */}
            <div className="divide-y divide-slate-200 dark:divide-slate-600">
              {postsWithAuthors.map((post) => (
                <Link
                  key={post.id}
                  href={`/boards/${board.id}/posts/${post.id}`}
                  className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                    </div>
                    <div className="col-span-2 text-center text-sm text-slate-600 dark:text-slate-400">
                      {post.profiles?.username || '익명'}
                    </div>
                    <div className="col-span-2 text-center text-sm text-slate-600 dark:text-slate-400">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="col-span-1 text-center text-sm text-slate-600 dark:text-slate-400">
                      {post.view_count || 0}
                    </div>
                    <div className="col-span-1 text-center text-sm text-slate-600 dark:text-slate-400">
                      {post.comment_count || 0}
                    </div>
                    <div className="col-span-1 text-center text-sm text-slate-600 dark:text-slate-400">
                      {post.like_count || 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              아직 작성된 게시글이 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              첫 번째 게시글을 작성해보세요!
            </p>
            {user ? (
              <Link 
                href={`/boards/${board.id}/posts/new`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                글쓰기
              </Link>
            ) : (
              <Link 
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                로그인하여 글쓰기
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 게시판 정보 */}
      <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          이 게시판은 {new Date(board.created_at).toLocaleDateString('ko-KR')}에 생성되었습니다.
        </p>
      </div>
    </div>
  )
}