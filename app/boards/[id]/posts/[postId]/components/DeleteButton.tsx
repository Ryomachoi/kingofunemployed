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
      if (result.error) {
        alert(result.error)
      } else {
        alert('게시글이 삭제되었습니다.')
        router.push(`/boards/${boardId}`)
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  )
}