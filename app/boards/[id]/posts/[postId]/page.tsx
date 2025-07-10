import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PostDetailPageProps {
  params: {
    postId: string
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // 게시글 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', resolvedParams.postId)
    .eq('board_id', resolvedParams.id)
    .eq('is_deleted', false)
    .single()

  if (postError || !post) {
    notFound()
  }

  // 게시판 정보 조회
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('id, name, is_active')
    .eq('id', resolvedParams.id)
    .eq('is_active', true)
    .single()

  if (boardError || !board) {
    notFound()
  }

  // 작성자 정보 조회
  const { data: author } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', post.author_id)
    .single()

  // 조회수 증가
  await supabase
    .from('posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', resolvedParams.postId)

  // 사용자 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthor = user?.id === post.author_id

  // 사용자 인증 상태 확인
  const { data: comments, error: commentsError } = await supabase
  const isAuthor = user?.id === post.author_id

  // 댓글 작성자 정보 조회
  let commentsWithAuthors = []
  if (comments && comments.length > 0) {
    const commentAuthorIds = [...new Set(comments.map(comment => comment.author_id).filter(Boolean))]
    const { data: commentProfiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', commentAuthorIds)
    
    const commentProfileMap = new Map(commentProfiles?.map(profile => [profile.id, profile]) || [])
    commentsWithAuthors = comments.map(comment => ({
      ...comment,
      profiles: comment.author_id ? commentProfileMap.get(comment.author_id) : null
    }))
  }

  if (commentsError) {
    console.error('댓글 조회 오류:', commentsError)
  }

  return (
    <div className="container py-8">
      {/* 브레드크럼 */}
      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <Link href="/boards" className="hover:text-slate-900 dark:hover:text-slate-100">
          게시판
        </Link>
        <span>›</span>
        <Link href={`/boards/${board.id}`} className="hover:text-slate-900 dark:hover:text-slate-100">
          {board.name}
        </Link>
        <span>›</span>
        <span className="truncate max-w-xs">{post.title}</span>
      </div>

      {/* 게시글 내용 */}
      <article className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        {/* 게시글 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-600">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">{author?.username || '익명'}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
              <span>•</span>
              <span>조회 {post.view_count + 1}</span>
              <span>•</span>
              <span>추천 {post.like_count}</span>
            </div>
            
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/boards/${board.id}/posts/${post.id}/edit`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  수정
                </Link>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 게시글 본문 */}
        <div className="px-6 py-6">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>

        {/* 게시글 액션 */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>추천 {post.like_count}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>공유</span>
              </button>
            </div>
            
            <Link
              href={`/boards/${board.id}`}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              목록으로
            </Link>
          </div>
        </div>
      </article>

      {/* 댓글 섹션 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* 댓글 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            댓글 {comments?.length || 0}개
          </h2>
        </div>

        {/* 댓글 작성 폼 */}
        {user ? (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <form className="space-y-4">
              <textarea
                name="content"
                rows={3}
                placeholder="댓글을 작성해주세요..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  댓글 작성
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-600 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              댓글을 작성하려면 로그인이 필요합니다.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
          </div>
        )}

        {/* 댓글 목록 */}
        {commentsWithAuthors && commentsWithAuthors.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-600">
            {commentsWithAuthors.map((comment) => (
              <div key={comment.id} className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {comment.profiles?.username?.charAt(0) || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {comment.profiles?.username || '익명'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(comment.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      isAuthor={user?.id === comment.author_id}
                      </button>
                      <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        추천 {comment.like_count}
                      </button>
                      {user?.id === comment.author_id && (
                        <>
                          <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                            수정
                          </button>
                          <button className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}