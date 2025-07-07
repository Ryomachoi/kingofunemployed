import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PostDetailPage({ params }: { params: { id: string, postId: string } }) {
  const supabase = await createClient()
  
  // 게시판 정보 조회
  const { data: forum, error: forumError } = await supabase
    .from('forums')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (forumError) {
    return notFound()
  }
  
  // 게시물 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.postId)
    .eq('forum_id', params.id)
    .single()
  
  if (postError || !post) {
    return notFound()
  }
  
  // 게시물의 댓글 조회
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', params.postId)
    .order('created_at', { ascending: true })
  
  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href={`/qna/${params.id}`} className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {forum.name} 게시판으로 돌아가기
        </Link>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            <button className="text-slate-400 hover:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className="text-lg font-medium my-1">{post.vote_count || 0}</span>
            <button className="text-slate-400 hover:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {post.title}
            </h1>
            <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}
            </div>
            <div className="prose dark:prose-invert mb-6">
              {post.content}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">댓글 {comments?.length || 0}개</h2>
        <form className="mb-6" action={`/api/comments?postId=${params.postId}`} method="post">
          <textarea 
            name="content"
            className="input w-full mb-2" 
            rows={3} 
            placeholder="댓글을 작성하세요..."
            required
          />
          <button type="submit" className="btn btn-primary">
            댓글 작성
          </button>
        </form>

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="card p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">사용자: {comment.user_id}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p>{comment.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}