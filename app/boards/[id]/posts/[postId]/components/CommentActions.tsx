'use client'

import { updateComment, deleteComment } from '@/app/boards/actions'
import { useState } from 'react'

interface CommentActionsProps {
  commentId: string
  postId: string
  boardId: string
  initialContent: string
  isAuthor: boolean
}

export default function CommentActions({ 
  commentId, 
  postId, 
  boardId, 
  initialContent, 
  isAuthor 
}: CommentActionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [content, setContent] = useState(initialContent)

  const handleEdit = async (formData: FormData) => {
    try {
      const result = await updateComment(formData)
      if (result.error) {
        alert(result.error)
      } else {
        setIsEditing(false)
        alert('댓글이 수정되었습니다.')
      }
    } catch (error) {
      console.error('수정 오류:', error)
      alert('수정 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteComment(commentId, postId, boardId)
      if (result.error) {
        alert(result.error)
      } else {
        alert('댓글이 삭제되었습니다.')
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthor) {
    return (
      <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
        {initialContent}
      </div>
    )
  }

  return (
    <div>
      {isEditing ? (
        <form action={handleEdit} className="space-y-3">
          <input type="hidden" name="commentId" value={commentId} />
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="boardId" value={boardId} />
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 resize-vertical"
            rows={3}
            required
          />
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setContent(initialContent)
              }}
              className="px-3 py-1 bg-slate-500 text-white text-sm rounded hover:bg-slate-600 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-2">
            {initialContent}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              수정
            </button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}