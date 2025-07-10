import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updatePost } from '@/app/boards/actions'
import Link from 'next/link'

interface EditPostPageProps {
  params: Promise<{
    id: string
    postId: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  // 게시글 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', resolvedParams.postId)
    .eq('board_id', resolvedParams.id)
    .eq('author_id', user.id)
    .eq('is_deleted', false)
    .single()

  if (postError || !post) {
    notFound()
  }

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
        <Link href={`/boards/${board.id}/posts/${post.id}`} className="hover:text-slate-900 dark:hover:text-slate-100">
          {post.title}
        </Link>
        <span>›</span>
        <span className="text-slate-900 dark:text-slate-100">수정</span>
      </div>

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          게시글 수정
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {board.name} 게시판의 게시글을 수정합니다.
        </p>
      </div>

      {/* 게시글 수정 폼 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <form action={updatePost} className="space-y-6">
          <input type="hidden" name="postId" value={post.id} />
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={post.title}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              placeholder="게시글 제목을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              defaultValue={post.content}
              required
              rows={15}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 resize-vertical"
              placeholder="게시글 내용을 입력하세요"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link
              href={`/boards/${board.id}/posts/${post.id}`}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}