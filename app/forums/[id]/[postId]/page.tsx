import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostDetails } from '../../actions'
import VoteButtons from './VoteButtons'

export default async function PostDetailPage({ params }: { params: { id: string, postId: string } }) {
  const { post, forum, error } = await getPostDetails(params.postId)
  
  if (error || !post || !forum) {
    return notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', params.postId)
    .order('created_at', { ascending: true })

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href={`/forums/${params.id}`} className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {forum.name} 게시판으로 돌아가기
        </Link>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start">
          <div className="mr-4">
            {/* 클라이언트 컴포넌트로 투표 기능 구현 */}
            <VoteButtons 
              postId={post.id} 
              initialVoteCount={post.vote_count || 0} 
              userVote={user ? undefined : 0} 
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {post.title}
            </h1>
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
              <span>작성자: {post.user_id}</span>
              <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              {post.content}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          댓글 {comments?.length || 0}개
        </h2>

        {user ? (
          <form action={`/api/comments?postId=${post.id}`} method="post" className="mb-6">
            <div className="mb-4">
              <textarea 
                name="content" 
                placeholder="댓글을 작성하세요" 
                className="input w-full min-h-[100px]"
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                댓글 작성
              </button>
            </div>
          </form>
        ) : (
          <div className="card p-4 mb-6 bg-slate-50 dark:bg-slate-800/50 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
            <Link href="/login" className="btn btn-secondary">
              로그인하기
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="card p-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                      <span>작성자: {comment.user_id}</span>
                      <span>{new Date(comment.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="text-slate-900 dark:text-slate-100">
                      {comment.content}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}