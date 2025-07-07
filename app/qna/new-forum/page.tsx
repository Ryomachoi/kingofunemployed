import { createForum } from '../actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewForumPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const message = searchParams.message || ''

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createForum(formData)
    
    if (!result.success) {
      return redirect(`/qna/new-forum?message=${encodeURIComponent(result.error || '오류가 발생했습니다.')}`)
    }
    
    redirect(`/qna/${result.forumId}`)
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href="/qna" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          게시판 목록으로 돌아가기
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        새 게시판 만들기
      </h1>

      {message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            게시판 이름
          </label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            className="input w-full" 
            placeholder="예: 신한은행 취업 정보"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            게시판 설명
          </label>
          <textarea 
            id="description" 
            name="description" 
            required 
            rows={4} 
            className="input w-full" 
            placeholder="이 게시판의 주제와 목적을 설명해주세요."
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn btn-primary">
            게시판 만들기
          </button>
          <Link href="/qna" className="btn btn-secondary">
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}