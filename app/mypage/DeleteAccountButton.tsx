'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteAccountButtonProps {
  onDeleteAccount: () => Promise<{ success: boolean; error?: string }>
}

export default function DeleteAccountButton({ onDeleteAccount }: DeleteAccountButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirmText !== '회원탈퇴') {
      alert('"회원탈퇴"를 정확히 입력해주세요.')
      return
    }

    setIsDeleting(true)
    
    try {
      const result = await onDeleteAccount()
      
      if (result.success) {
        alert('회원탈퇴가 완료되었습니다.')
        router.push('/')
        router.refresh()
      } else {
        alert(result.error || '회원탈퇴 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      alert('회원탈퇴 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
      setConfirmText('')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
      >
        회원탈퇴
      </button>

      {/* 확인 모달 */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              회원탈퇴 확인
            </h3>
            
            <div className="mb-4">
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                정말로 회원탈퇴를 하시겠습니까?
              </p>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                확인을 위해 아래 입력란에 <strong>"회원탈퇴"</strong>를 입력해주세요.
              </p>
              
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="회원탈퇴"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                disabled={isDeleting}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsConfirmOpen(false)
                  setConfirmText('')
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                취소
              </button>
              
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== '회원탈퇴'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
              >
                {isDeleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}