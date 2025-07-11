'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { likePost, unlikePost, deletePost } from '@/app/boards/actions'

interface PostActionsProps {
  postId: string
  boardId: string
  likeCount?: number
  isLiked?: boolean
  isAuthor?: boolean
}

export default function PostActions({ 
  postId, 
  boardId, 
  likeCount = 0, 
  isLiked = false, 
  isAuthor = false 
}: PostActionsProps) {
  const router = useRouter()
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount)
  const [currentIsLiked, setCurrentIsLiked] = useState(isLiked)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleLike = async () => {
    if (isLikeLoading) return
    
    setIsLikeLoading(true)
    
    try {
      if (currentIsLiked) {
        const result = await unlikePost(postId)
        if (result.success) {
          setCurrentIsLiked(false)
          setCurrentLikeCount(prev => Math.max(0, prev - 1))
        }
      } else {
        const result = await likePost(postId)
        if (result.success) {
          setCurrentIsLiked(true)
          setCurrentLikeCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleteLoading) return
    
    setIsDeleteLoading(true)
    
    try {
      const result = await deletePost(postId)
      if (result.success) {
        router.push(`/boards/${boardId}`)
      } else {
        alert(result.error || '게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 좋아요 버튼 */}
      <button
        onClick={handleLike}
        disabled={isLikeLoading}
        className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          currentIsLiked
            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
        } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg 
          className={`w-4 h-4 ${currentIsLiked ? 'fill-current' : ''}`} 
          fill={currentIsLiked ? 'currentColor' : 'none'} 
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
        <span>{currentLikeCount}</span>
      </button>

      {/* 삭제 버튼 (작성자만) */}
      {isAuthor && (
        <>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleteLoading}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            삭제
          </button>

          {/* 삭제 확인 모달 */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  게시글 삭제
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleteLoading}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleteLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                  >
                    {isDeleteLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        삭제 중...
                      </>
                    ) : (
                      '삭제'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}