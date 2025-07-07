'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createForum } from '../actions'
import { createClient } from '@/lib/supabase/client'

export default function NewForumPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createForum(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push(`/forums/${result.forumId}`)
      }
    } catch (err) {
      console.error('Forum creation error:', err)
      setError('게시판 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="container py-8">
        <div className="card p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            로그인이 필요합니다
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            게시판을 생성하려면 먼저 로그인해주세요.
          </p>
          <Link href="/login" className="btn btn-primary">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/forums" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          게시판 목록으로 돌아가기
        </Link>
      </div>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          새 게시판 만들기
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              게시판 이름
            </label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              required 
              className="input w-full" 
              placeholder="게시판 이름을 입력하세요"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              게시판 설명
            </label>
            <textarea 
              id="description" 
              name="description" 
              required 
              className="input w-full min-h-[100px]"
              placeholder="게시판에 대한 설명을 입력하세요"
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '생성 중...' : '게시판 생성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}