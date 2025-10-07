'use client'

import { useEffect, useState } from 'react'
import { incrementPostViewCount } from '@/app/boards/actions'

interface ViewCounterProps {
  postId: string
  initialViewCount: number
}

export default function ViewCounter({ postId, initialViewCount }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialViewCount)

  useEffect(() => {
    console.log('ViewCounter 마운트:', { postId, initialViewCount })
    
    // 낙관적 업데이트: UI를 먼저 업데이트
    setViewCount(prev => prev + 1)
    console.log('낙관적 업데이트 실행:', initialViewCount + 1)
    
    // 백엔드에 조회수 증가 요청
    incrementPostViewCount(postId)
      .then((newViewCount) => {
        console.log('조회수 증가 결과:', newViewCount)
        if (newViewCount > 0) {
          // 서버에서 반환된 실제 조회수로 업데이트
          console.log('서버 조회수로 업데이트:', newViewCount)
          setViewCount(newViewCount)
        } else {
          console.error('조회수 증가 실패')
          // 실패 시 원래 값으로 롤백
          setViewCount(initialViewCount)
        }
      })
      .catch((error) => {
        console.error('조회수 증가 중 오류:', error)
        // 오류 시 원래 값으로 롤백
        setViewCount(initialViewCount)
      })
  }, [postId, initialViewCount])

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500">
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
        />
      </svg>
      <span>조회 {viewCount.toLocaleString()}</span>
    </div>
  )
}