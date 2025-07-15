'use client'

import { useState } from 'react'

interface ProfileEditorProps {
  userId: string
  initialNickname: string
  initialDisplayName: string
  onUpdateProfile: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export default function ProfileEditor({ userId, initialNickname, initialDisplayName, onUpdateProfile }: ProfileEditorProps) {
  const [nickname, setNickname] = useState(initialNickname)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('nickname', nickname)
      
      const result = await onUpdateProfile(formData)
      
      if (result.success) {
        setMessage('닉네임이 성공적으로 업데이트되었습니다.')
        setIsEditing(false)
        // 페이지 새로고침으로 변경사항 반영
        window.location.reload()
      } else {
        setMessage(result.error || '업데이트 중 오류가 발생했습니다.')
      }
    } catch (error: unknown) {
      console.error('Profile update error:', error)
      setMessage('업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const displayName = nickname || initialDisplayName

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          닉네임
        </label>
        
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {displayName}
              </p>
              {!nickname && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  닉네임을 설정하지 않았습니다. (기본값: {initialDisplayName})
                </p>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              편집
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요 (2-20자)"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={2}
                maxLength={20}
                pattern="^[a-zA-Z0-9가-힣_-]+$"
                title="닉네임은 2-20자의 한글, 영문, 숫자, _, - 만 사용 가능합니다."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                2-20자의 한글, 영문, 숫자, _, - 만 사용 가능합니다.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || nickname.length < 2}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setNickname(initialNickname)
                  setMessage('')
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('성공') 
            ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
            : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}