'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    try {
      const cookieMatch = document.cookie.match(/(?:^|; )theme=([^;]*)/)
      const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = cookieTheme ? cookieTheme === 'dark' : (stored ? stored === 'dark' : prefersDark)
      setEnabled(isDark)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      const root = document.documentElement
      const body = document.body
      if (enabled) {
        root.classList.add('dark')
        body.classList.add('dark')
        root.setAttribute('data-theme', 'dark')
        document.cookie = 'theme=dark; path=/; max-age=31536000'
        localStorage.setItem('theme', 'dark')
      } else {
        root.classList.remove('dark')
        body.classList.remove('dark')
        root.removeAttribute('data-theme')
        document.cookie = 'theme=light; path=/; max-age=31536000'
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {
      // ignore
    }
  }, [enabled])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">화면 모드</h2>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">다크 모드</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">눈의 피로를 줄이는 어두운 테마로 전환합니다.</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}