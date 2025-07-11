'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createComment, updateComment, deleteComment, toggleCommentLike } from '@/app/boards/actions'

interface Comment {
  id: string
  content: string
  like_count: number
  created_at: string
  updated_at: string
  author_id: string
  is_deleted: boolean
}

interface CommentSectionProps {
  postId: string
  boardId: string
  comments: Comment[]
  userCommentLikes: string[]
  currentUser: any
}

export default function CommentSection({ 
  postId, 
  boardId, 
  comments: initialComments, 
  userCommentLikes: initialUserCommentLikes, 
  currentUser 
}: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [userCommentLikes, setUserCommentLikes] = useState(initialUserCommentLikes)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !currentUser) return
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('postId', postId)
      formData.append('content', newComment.trim())
      
      const result = await createComment(formData)
      
      if ('success' in result && result.success && 'data' in result && result.data) {
        // 새 댓글을 목록에 추가
        setComments(prev => [...prev, result.data as Comment])
        setNewComment('')
        router.refresh()
      } else {
        alert(result.error || '댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return
    
    setIsEditing(true)
    
    try {
      const formData = new FormData()
      formData.append('commentId', commentId)
      formData.append('content', editContent.trim())
      
      const result = await updateComment(formData)
      
      if ('success' in result && result.success && 'data' in result && result.data) {
        // 댓글 목록 업데이트
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? result.data as Comment
            : comment
        ))
        setEditingCommentId(null)
        setEditContent('')
      } else {
        alert(result.error || '댓글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error)
      alert('댓글 수정 중 오류가 발생했습니다.')
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return
    
    setDeletingCommentId(commentId)
    
    try {
      const result = await deleteComment(commentId)
      
      if (result.success) {
        // 댓글 목록에서 제거
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        router.refresh()
      } else {
        alert(result.error || '댓글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return
    
    const isLiked = userCommentLikes.includes(commentId)
    
    try {
      const result = await toggleCommentLike(commentId)
      if (result.success) {
        if (isLiked) {
          setUserCommentLikes(prev => prev.filter(id => id !== commentId))
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, like_count: Math.max(0, comment.like_count - 1) }
              : comment
          ))
        } else {
          setUserCommentLikes(prev => [...prev, commentId])
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, like_count: comment.like_count + 1 }
              : comment
          ))
        }
      }
    } catch (error) {
      console.error('댓글 좋아요 처리 오류:', error)
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        댓글 {comments.length}개
      </h2>

      {/* 댓글 작성 폼 */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 resize-vertical transition-colors"
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-right">
              {newComment.length}/1000
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  작성 중...
                </>
              ) : (
                '댓글 작성'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            로그인하기
          </Link>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    댓글 작성자
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-orange-500 dark:text-orange-400">
                      (수정됨)
                    </span>
                  )}
                </div>
                
                {currentUser && currentUser.id === comment.author_id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {deletingCommentId === comment.id ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                )}
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 text-sm"
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {editContent.length}/1000
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        disabled={isEditing || !editContent.trim()}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded transition-colors"
                      >
                        {isEditing ? '수정 중...' : '수정'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap mb-3">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      disabled={!currentUser}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        userCommentLikes.includes(comment.id)
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                      } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <svg 
                        className={`w-3 h-3 ${userCommentLikes.includes(comment.id) ? 'fill-current' : ''}`} 
                        fill={userCommentLikes.includes(comment.id) ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                      <span>{comment.like_count}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              아직 댓글이 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              첫 번째 댓글을 작성해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}