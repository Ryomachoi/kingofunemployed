import { createClient } from '@/lib/supabase/server'
import { createPost } from '@/app/boards/actions'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface NewPostPageProps {
  params: {
    id: string
  }
}

export default async function NewPostPage({ params }: NewPostPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
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

  async function handleCreatePost(formData: FormData) {
    'use server'
    
    formData.append('boardId', resolvedParams.id)
    const result = await createPost(formData)
    
    if (result.error) {
      redirect(`/boards/${resolvedParams.id}/posts/new?error=${encodeURIComponent(result.error)}`)
    }
    
    if (result.success && result.post) {
      redirect(`/boards/${resolvedParams.id}/posts/${result.post.id}`)
    }
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
        <span>글쓰기</span>
      </div>

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          새 게시글 작성
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {board.name} 게시판에 새로운 글을 작성합니다.
        </p>
      </div>

      {/* 게시글 작성 폼 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <form action={handleCreatePost} className="space-y-6">
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={200}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
              placeholder="게시글 제목을 입력하세요"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              최대 200자까지 입력 가능합니다.
            </p>
          </div>

          {/* 내용 입력 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              내용 *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={15}
              maxLength={10000}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors resize-vertical"
              placeholder="게시글 내용을 입력하세요"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              최대 10,000자까지 입력 가능합니다.
            </p>
          </div>

          {/* 작성 가이드 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              📝 작성 가이드
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 다른 사용자에게 도움이 되는 정보를 공유해주세요</li>
              <li>• 개인정보나 민감한 정보는 포함하지 마세요</li>
              <li>• 욕설이나 비방은 삼가해주세요</li>
              <li>• 관련 없는 광고나 스팸은 금지됩니다</li>
            </ul>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
            <Link
              href={`/boards/${board.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              취소
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                게시글 작성
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}