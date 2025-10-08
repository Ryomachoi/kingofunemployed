'use client'

import { useEffect, useState, useRef } from 'react'
import { incrementPostViewCount } from '@/app/boards/actions'

interface ViewCounterProps {
  postId: string
  initialViewCount: number
}

export default function ViewCounter({ postId, initialViewCount }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialViewCount)
  const hasIncrementedRef = useRef(false)
  const postIdRef = useRef(postId)

  useEffect(() => {
    console.log('🔄 ViewCounter useEffect 실행:', { 
      postId, 
      initialViewCount, 
      timestamp: new Date().toISOString(),
      renderCount: Math.random(), // 각 실행을 구분하기 위한 랜덤 값
      hasIncremented: hasIncrementedRef.current,
      postIdChanged: postIdRef.current !== postId
    })
    
    // postId가 변경되었을 때만 플래그 리셋
    if (postIdRef.current !== postId) {
      console.log('📝 postId 변경됨, 플래그 리셋:', { 
        old: postIdRef.current, 
        new: postId 
      })
      hasIncrementedRef.current = false
      postIdRef.current = postId
    }
    
    // 이미 증가 요청을 보낸 경우 중복 실행 방지
    if (hasIncrementedRef.current) {
      console.log('⚠️ 이미 조회수 증가 요청을 보냄, 중복 실행 방지')
      return
    }
    
    // 플래그 설정 (중복 실행 방지)
    hasIncrementedRef.current = true
    
    // 즉시 UI 업데이트 (낙관적 업데이트)
    const optimisticViewCount = initialViewCount + 1
    console.log('🚀 낙관적 업데이트:', { from: initialViewCount, to: optimisticViewCount })
    setViewCount(optimisticViewCount)
    
    let isMounted = true
    
    // 백엔드에 조회수 증가 요청
    console.log('📡 POST 요청 시작:', postId)
    incrementPostViewCount(postId)
      .then((newViewCount) => {
        console.log('📡 POST 요청 완료:', { postId, newViewCount, isMounted })
        
        if (!isMounted) {
          console.log('⚠️ 컴포넌트 언마운트됨, 상태 업데이트 무시')
          return
        }
        
        console.log('조회수 증가 결과:', newViewCount)
        if (newViewCount > 0) {
          // 서버에서 반환된 실제 조회수로 업데이트 (낙관적 업데이트와 다를 수 있음)
          console.log('서버 조회수로 최종 업데이트:', { optimistic: optimisticViewCount, actual: newViewCount })
          setViewCount(newViewCount)
        } else {
          console.error('조회수 증가 실패, 원래 값으로 롤백')
          // 실패 시 원래 값으로 롤백
          setViewCount(initialViewCount)
        }
      })
      .catch((error) => {
        console.log('📡 POST 요청 실패:', { postId, error, isMounted })
        
        if (!isMounted) {
          console.log('⚠️ 컴포넌트 언마운트됨, 에러 처리 무시')
          return
        }
        
        console.error('조회수 증가 중 오류:', error)
        // 오류 시 원래 값으로 롤백
        console.log('🔄 오류로 인한 롤백:', { from: optimisticViewCount, to: initialViewCount })
        setViewCount(initialViewCount)
        // 오류 발생 시 플래그 리셋 (재시도 가능하도록)
        hasIncrementedRef.current = false
      })
    
    return () => {
      console.log('🧹 ViewCounter cleanup 실행:', postId)
      isMounted = false
    }
  }, [postId, initialViewCount]) // initialViewCount를 다시 의존성에 추가

  console.log('🎨 ViewCounter 렌더링:', { postId, viewCount, initialViewCount })

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