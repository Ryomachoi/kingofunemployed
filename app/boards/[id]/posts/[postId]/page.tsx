import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostActions from './PostActions'
import CommentSection from './CommentSection'
import { incrementPostViewCount } from '@/app/boards/actions'
import type { PostWithProfile, CommentWithProfile } from '@/types/database'

interface PostDetailPageProps {
  params: {
    id: string
    postId: string
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // 게시글 상세 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      like_count,
      comment_count,
      view_count,
      created_at,
      updated_at,
      author_id,
      board_id,
      is_deleted,
      boards(name)
    `)
    .eq('id', resolvedParams.postId)
    .eq('board_id', resolvedParams.id)
    .single()

  if (postError || !post || post.is_deleted) {
    notFound()
  }

  // 게시글 작성자 프로필 정보 조회
  let postWithProfile: PostWithProfile
  if (post.author_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('nickname, display_name')
      .eq('id', post.author_id)
      .single()
    
    postWithProfile = {
      ...post,
      boards: (post.boards as any),
      user_profiles: profile ?? null
    } as PostWithProfile
  } else {
    postWithProfile = {
      ...post,
      boards: (post.boards as any),
      user_profiles: null
    } as PostWithProfile
  }

  // 조회수 증가 (비동기로 처리하여 페이지 로딩에 영향 없도록)
  incrementPostViewCount(post.id).catch(console.error)

  // 댓글 목록 조회 (대댓글 포함)
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      like_count,
      created_at,
      updated_at,
      author_id,
      parent_comment_id,
      is_deleted
    `)
    .eq('post_id', resolvedParams.postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  // 댓글 작성자들의 프로필 정보 조회
  let commentsWithProfiles: CommentWithProfile[] = []
  if (comments && comments.length > 0) {
    const commentAuthorIds = [...new Set(comments.map(comment => comment.author_id).filter(Boolean))]
    
    if (commentAuthorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, nickname, display_name')
        .in('id', commentAuthorIds)
      
      // 댓글에 프로필 정보 매핑
      const commentsWithProfilesFlat = comments.map(comment => ({
        ...comment,
        user_profiles: profiles?.find(profile => profile.id === comment.author_id) ?? null,
        replies: []
      })) as CommentWithProfile[]
      
      // 댓글을 계층적으로 구성 (부모 댓글과 대댓글 분리)
      const parentComments = commentsWithProfilesFlat.filter(comment => !comment.parent_comment_id)
      const replyComments = commentsWithProfilesFlat.filter(comment => comment.parent_comment_id)
      
      // 각 부모 댓글에 대댓글 연결
      parentComments.forEach(parentComment => {
        parentComment.replies = replyComments.filter(reply => reply.parent_comment_id === parentComment.id)
      })
      
      commentsWithProfiles = parentComments
    } else {
      // 프로필 정보가 없는 경우에도 CommentWithProfile 타입으로 변환
      const commentsWithProfilesFlat = comments.map(comment => ({
        ...comment,
        user_profiles: null,
        replies: []
      })) as CommentWithProfile[]
      
      // 댓글을 계층적으로 구성
      const parentComments = commentsWithProfilesFlat.filter(comment => !comment.parent_comment_id)
      const replyComments = commentsWithProfilesFlat.filter(comment => comment.parent_comment_id)
      
      parentComments.forEach(parentComment => {
        parentComment.replies = replyComments.filter(reply => reply.parent_comment_id === parentComment.id)
      })
      
      commentsWithProfiles = parentComments
    }
  }

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
    if (commentsWithProfiles && commentsWithProfiles.length > 0) {
      const { data: commentLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentsWithProfiles.map(c => c.id))
      
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
            게시판으로 돌아가기
          </Link>
        </div>

        {/* 게시글 */}
        <article className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          {/* 게시글 헤더 */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {postWithProfile.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {postWithProfile.author_id ? (
                    postWithProfile.user_profiles?.nickname || 
                    postWithProfile.user_profiles?.display_name || 
                    postWithProfile.author_id.substring(0, 8)
                  ) : '익명'}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  조회수 {postWithProfile.view_count || 0}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(postWithProfile.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {postWithProfile.updated_at !== postWithProfile.created_at && (
                  <span className="text-orange-500 dark:text-orange-400">
                    (수정됨: {new Date(postWithProfile.updated_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })})
                  </span>
                )}
              </div>
              
              {user && user.id === postWithProfile.author_id && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/boards/${resolvedParams.id}/posts/${resolvedParams.postId}/edit`}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    수정
                  </Link>
                  <PostActions 
                    postId={postWithProfile.id} 
                    boardId={postWithProfile.board_id}
                    isAuthor={true}
                    showOnlyDelete={true}
                  />
                </div>
              )}
            </div>
          </header>

          {/* 게시글 내용 */}
          <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
              {postWithProfile.content}
            </div>
          </div>

          {/* 게시글 추천 버튼 (중앙) */}
          <div className="flex justify-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <PostActions 
              postId={postWithProfile.id} 
              boardId={postWithProfile.board_id}
              likeCount={postWithProfile.like_count}
              isLiked={!!userPostLike}
              isAuthor={user?.id === postWithProfile.author_id}
              showOnlyLike={true}
            />
          </div>
        </article>

        {/* 댓글 섹션 */}
        <CommentSection 
          postId={postWithProfile.id}
          boardId={postWithProfile.board_id}
          comments={commentsWithProfiles || []}
          userCommentLikes={userCommentLikes}
          currentUser={user}
        />
      </div>
    </div>
  )
}