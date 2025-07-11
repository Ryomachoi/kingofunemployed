import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostActions from './PostActions'
import CommentSection from './CommentSection'

interface PostDetailPageProps {
  params: {
    id: string
    postId: string
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // 게시글 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      like_count,
      comment_count,
      created_at,
      updated_at,
      author_id,
      board_id,
      is_deleted,
      profiles!posts_author_id_fkey(email),
      boards!posts_board_id_fkey(name)
    `)
    .eq('id', resolvedParams.postId)
    .eq('board_id', resolvedParams.id)
    .single()

  if (postError || !post || post.is_deleted) {
    notFound()
  }

  // 댓글 목록 조회
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      like_count,
      created_at,
      updated_at,
      author_id,
      is_deleted,
      profiles!comments_author_id_fkey(email)
    `)
    .eq('post_id', resolvedParams.postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (commentsError) {
    console.error('댓글 조회 오류:', commentsError)
  }

  // 사용자 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 사용자의 좋아요 상태 확인
  let userPostLike = null
  let userCommentLikes: string[] = []
  
  if (user) {
    // 게시글 좋아요 상태
    const { data: postLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', resolvedParams.postId)
      .eq('user_id', user.id)
      .single()
    
    userPostLike = postLike

    // 댓글 좋아요 상태
    if (comments && comments.length > 0) {
      const { data: commentLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', comments.map(c => c.id))
      
      userCommentLikes = commentLikes?.map(cl => cl.comment_id) || []
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/boards/${resolvedParams.id}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {post.boards?.name} 게시판으로 돌아가기
          </Link>
        </div>

        {/* 게시글 */}
        <article className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          {/* 게시글 헤더 */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.profiles?.email?.split('@')[0] || '알 수 없음'}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(post.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {post.updated_at !== post.created_at && (
                  <span className="text-orange-500 dark:text-orange-400">
                    (수정됨: {new Date(post.updated_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })})
                  </span>
                )}
              </div>
              
              {user && user.id === post.author_id && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/boards/${resolvedParams.id}/posts/${resolvedParams.postId}/edit`}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    수정
                  </Link>
                  <PostActions 
                    postId={post.id} 
                    boardId={post.board_id}
                    isAuthor={true}
                  />
                </div>
              )}
            </div>
          </header>

          {/* 게시글 내용 */}
          <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* 게시글 액션 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <PostActions 
                postId={post.id} 
                boardId={post.board_id}
                likeCount={post.like_count}
                isLiked={!!userPostLike}
                isAuthor={user?.id === post.author_id}
              />
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                댓글 {post.comment_count}개
              </div>
            </div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <CommentSection 
          postId={post.id}
          boardId={post.board_id}
          comments={comments || []}
          userCommentLikes={userCommentLikes}
          currentUser={user}
        />
      </div>
    </div>
  )
}