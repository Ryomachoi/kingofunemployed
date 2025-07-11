'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePost } from '@/app/boards/actions'

interface Post {
  id: string
  title: string
  content: string
  author_id: string
  board_id: string
}

interface EditPostFormProps {
  post: Post
  boardId: string
  boardName: string
}

export default function EditPostForm({ post, boardId, boardName }: EditPostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    // 변경사항이 없는 경우
    if (title.trim() === post.title && content.trim() === post.content) {
      router.push(`/boards/${boardId}/posts/${post.id}`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await updatePost(post.id, {
        title: title.trim(),
        content: content.trim()
      })

      if (result.success) {
        router.push(`/boards/${boardId}/posts/${post.id}`)
      } else {
        setError(result.error || '게시글 수정에 실패했습니다.')
      }
    } catch (err) {
      console.error('게시글 수정 오류:', err)
      setError('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href={`/boards/${boardId}/posts/${post.id}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          게시글로 돌아가기
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          게시글 수정
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {boardName} 게시판의 게시글을 수정합니다.
        </p>
      </div>

      {/* 수정 폼 */}
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

          {/* 수정 안내 */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
              ✏️ 게시글 수정 안내
            </h3>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <li>• 수정된 게시글에는 '수정됨' 표시가 나타납니다</li>
              <li>• 제목과 내용만 수정할 수 있습니다</li>
              <li>• 수정 후에는 되돌릴 수 없으니 신중하게 작성해주세요</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              href={`/boards/${boardId}/posts/${post.id}`}
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
                  수정 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  수정 완료
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}