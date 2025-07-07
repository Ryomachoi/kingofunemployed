'use client'

import { useState } from 'react'

type VoteButtonsProps = {
  postId: string
  initialVoteCount: number
  userVote?: number
}

export default function VoteButtons({ postId, initialVoteCount, userVote }: VoteButtonsProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [currentVote, setCurrentVote] = useState(userVote || 0)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (value: number) => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      // 같은 값으로 다시 클릭하면 투표 취소
      const newVote = currentVote === value ? 0 : value
      
      // 투표 상태 낙관적 업데이트
      if (currentVote === value) {
        // 투표 취소
        setVoteCount(voteCount - value)
        setCurrentVote(0)
      } else if (currentVote === 0) {
        // 새 투표
        setVoteCount(voteCount + value)
        setCurrentVote(value)
      } else {
        // 투표 변경 (이전 값의 반대로 2배)
        setVoteCount(voteCount + (value * 2))
        setCurrentVote(value)
      }
      
      // API 호출
      const response = await fetch(`/api/votes?postId=${postId}&value=${value}`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('투표 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Vote error:', error)
      // 오류 발생 시 원래 상태로 복원
      setVoteCount(initialVoteCount)
      setCurrentVote(userVote || 0)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button 
        className={`text-slate-400 hover:text-blue-500 transition-colors ${currentVote === 1 ? 'text-blue-500' : ''}`}
        onClick={() => handleVote(1)}
        disabled={isLoading}
        aria-label="추천"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <span className="text-lg font-medium my-1">{voteCount}</span>
      <button 
        className={`text-slate-400 hover:text-blue-500 transition-colors ${currentVote === -1 ? 'text-blue-500' : ''}`}
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        aria-label="비추천"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}