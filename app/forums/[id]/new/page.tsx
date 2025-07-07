'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPost } from '../../actions'

export default function NewPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.append('forum_id', params.id)

    try {
      const result = await createPost(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push(`/forums/${params.id}`)
      }
    } catch (err) {
      console.error('Post creation error:', err)
      setError('게시물 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href={`/forums/${params.id}`} className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          게시판으로 돌아가기
        </Link>
      </div>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          새 게시물 작성
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              제목
            </label>
            <input 
              id="title" 
              name="title" 
              type="text" 
              required 
              className="input w-full" 
              placeholder="제목을 입력하세요"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              내용
            </label>
            <textarea 
              id="content" 
              name="content" 
              required 
              className="input w-full min-h-[200px]"
              placeholder="내용을 입력하세요"
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '게시 중...' : '게시하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}