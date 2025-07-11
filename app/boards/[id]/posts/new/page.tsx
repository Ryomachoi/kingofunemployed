'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPost } from '@/app/boards/actions'

interface NewPostPageProps {
  params: {
    id: string
  }
}

export default function NewPostPage({ params }: NewPostPageProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const resolvedParams = await params
      const formData = new FormData()
      formData.append('boardId', resolvedParams.id)
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      
      const result = await createPost(formData)

      if ('success' in result && result.success && 'data' in result && result.data && (result.data as any).id) {
        router.push(`/boards/${resolvedParams.id}/posts/${(result.data as any).id}`)
      } else {
        setError(result.error || '게시글 작성에 실패했습니다.')
      }
    } catch (err) {
      console.error('게시글 작성 오류:', err)
      setError('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/boards/${params.id}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            게시판으로 돌아가기
          </Link>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            새 게시글 작성
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            다른 사용자들과 정보를 공유해보세요.
          </p>
        </div>

        {/* 작성 폼 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 입력 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력하세요"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 transition-colors"
                maxLength={100}
                disabled={isLoading}
              />
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-right">
                {title.length}/100
              </div>
            </div>

            {/* 내용 입력 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                내용 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="게시글 내용을 입력하세요"
                rows={12}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 resize-vertical transition-colors"
                maxLength={5000}
                disabled={isLoading}
              />
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-right">
                {content.length}/5000
              </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* 작성 가이드 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                📝 게시글 작성 가이드
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• 제목은 명확하고 구체적으로 작성해주세요</li>
                <li>• 다른 사용자에게 도움이 되는 정보를 공유해주세요</li>
                <li>• 욕설, 비방, 스팸성 내용은 삭제될 수 있습니다</li>
                <li>• 개인정보나 민감한 정보는 포함하지 마세요</li>
              </ul>
            </div>

            {/* 버튼 */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Link
                href={`/boards/${params.id}`}
                className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    작성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    게시글 작성
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}