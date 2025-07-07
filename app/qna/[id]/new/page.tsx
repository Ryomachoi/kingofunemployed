import { createPost } from '../../actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function NewPostPage({
  params,
  searchParams,
}: {
  params: { id: string },
  searchParams: { message?: string }
}) {
  const message = searchParams.message || ''
  const forumId = params.id

  async function handleSubmit(formData: FormData) {
    'use server'
    // forum_id를 폼 데이터에 추가
    formData.append('forum_id', forumId)
    
    const result = await createPost(formData)
    
    if (!result.success) {
      return redirect(`/qna/${forumId}/new?message=${encodeURIComponent(result.error || '오류가 발생했습니다.')}`)
    }
    
    redirect(`/qna/${forumId}`)
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href={`/qna/${forumId}`} className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          게시판으로 돌아가기
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        새 게시물 작성
      </h1>

      {message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            제목
          </label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required 
            className="input w-full" 
            placeholder="게시물 제목을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            내용
          </label>
          <textarea 
            id="content" 
            name="content" 
            required 
            rows={8} 
            className="input w-full" 
            placeholder="게시물 내용을 입력하세요"
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn btn-primary">
            게시물 작성
          </button>
          <Link href={`/qna/${forumId}`} className="btn btn-secondary">
            취소
          </Link>
        </div>
      </form>
    </div>
  )