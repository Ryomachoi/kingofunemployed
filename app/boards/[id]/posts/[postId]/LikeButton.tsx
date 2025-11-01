"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLikeCount: number
  currentUser: { id: string } | null
}

export default function LikeButton({ postId, initialLikeCount, currentUser }: LikeButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    const fetchLiked = async () => {
      if (!currentUser) return
      const { count, error } = await supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)

      if (!active) return
      if (!error) setLiked((count ?? 0) > 0)
    }
    fetchLiked()
    return () => {
      active = false
    }
  }, [currentUser, postId, supabase])

  // 다른 사용자의 좋아요가 발생하면 실시간으로 카운트 반영
  useEffect(() => {
    const channel = supabase
      .channel(`post-like-count-${postId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`,
      }, (payload) => {
        const next = (payload.new as any)?.like_count
        if (typeof next === 'number') {
          setLikeCount(next)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  const onToggle = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('toggle_post_like', { p_post_id: postId })
      if (error) throw error

      const row = Array.isArray(data) ? data[0] : data
      if (row && typeof row.like_count === 'number' && typeof row.status === 'string') {
        setLikeCount(row.like_count)
        setLiked(row.status === 'liked')
      } else {
        // Fallback: query latest like_count if unexpected shape
        const { data: post, error: postErr } = await supabase
          .from('posts')
          .select('like_count')
          .eq('id', postId)
          .single()
        if (!postErr && post) setLikeCount(post.like_count ?? likeCount)
        setLiked(!liked)
      }
    } catch (e: any) {
      // Fallback path if RPC is unavailable: direct insert/delete
      try {
        if (liked) {
          const { error: delErr } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUser.id)
          if (delErr) throw delErr
        } else {
          const { error: insErr } = await supabase
            .from('post_likes')
            .insert({ post_id: postId, user_id: currentUser.id })
          if (insErr) throw insErr
        }
        const { data: post, error: postErr } = await supabase
          .from('posts')
          .select('like_count')
          .eq('id', postId)
          .single()
        if (!postErr && post) setLikeCount(post.like_count ?? likeCount)
        setLiked(!liked)
      } catch {
        // noop: keep prior state if both paths failed
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      className={`flex items-center px-3 py-1 text-sm border rounded transition-colors ${
        liked
          ? 'text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-600 dark:hover:bg-rose-900/20'
          : 'text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-4 h-4 mr-1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.675 0-3.133.833-3.996 2.1-.863-1.267-2.32-2.1-3.996-2.1C5.73 3.75 3.631 5.765 3.631 8.25c0 5.82 7.142 9.037 8.686 10.087 1.544-1.05 8.683-4.267 8.683-10.087z"
        />
      </svg>
      <span>{likeCount}</span>
    </button>
  )
}