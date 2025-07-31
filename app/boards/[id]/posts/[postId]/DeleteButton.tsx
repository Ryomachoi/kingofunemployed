'use client'

import { deletePost } from '@/app/boards/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteButtonProps {
  postId: string
  boardId: string
}

export default function DeleteButton({ postId, boardId }: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deletePost(postId)
      if (result.success) {
        router.push(`/boards/${boardId}`)
      } else {
        alert(result.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('삭제 중 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  )
}