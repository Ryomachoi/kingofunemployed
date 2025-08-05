'use client'

import { login } from './actions'
import { signInWithKakao, signInWithNaver } from '@/lib/auth-helpers'
import { useState } from 'react'

// 카카오 로그인 버튼 컴포넌트
function KakaoLoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true)
      await signInWithKakao()
    } catch (error) {
      console.error('카카오 로그인 실패:', error)
      alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleKakaoLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l1.47-3.576C2.661 16.174 1.5 14.264 1.5 11.185 1.5 6.665 6.201 3 12 3Z"/>
          </svg>
          <span className="text-gray-900 font-medium">카카오로 로그인</span>
        </>
      )}
    </button>
  )
}

// 네이버 로그인 버튼 컴포넌트
function NaverLoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleNaverLogin = async () => {
    try {
      setIsLoading(true)
      await signInWithNaver()
    } catch (error) {
      console.error('네이버 로그인 실패:', error)
      alert('네이버 로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleNaverLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" fill="white"/>
          </svg>
          <span className="text-white font-medium">네이버로 로그인</span>
        </>
      )}
    </button>
  )
}

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">로그인</h2>
        </div>
        <div className="card p-8">
          {/* 소셜 로그인 섹션 */}
          <div className="space-y-4 mb-6">
            <KakaoLoginButton />
            <NaverLoginButton />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
          </div>

          {/* 기존 이메일/비밀번호 로그인 */}
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">이메일</label>
              <input id="email" name="email" type="email" required className="input" placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">비밀번호</label>
              <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
            </div>
            <button formAction={login} className="btn btn-primary w-full">이메일로 로그인</button>
            <a href="/signup" className="btn btn-secondary w-full mt-2">회원가입</a>
          </form>
        </div>
      </div>
    </div>
  )
}