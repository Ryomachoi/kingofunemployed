import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserProfile } from '@/types/database'
import MyPageClient from './MyPageClient'

export default async function MyPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 사용자 인증 확인
  if (!user) {
    redirect('/login')
  }

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, nickname, display_name, created_at, updated_at')
    .eq('id', user.id)
    .single()

  // 최근 게시글 가져오기 (게시판에서만)
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      boards(name)
    `)
    .eq('author_id', user.id)
    .not('board_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // 각 게시글에 대한 댓글 개수 조회
  let postsWithCommentCount = []
  if (posts) {
    postsWithCommentCount = await Promise.all(
      posts.map(async (post) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        return {
          ...post,
          comment_count: count || 0
        }
      })
    )
  }

  // 최근 댓글 가져오기 (게시판에서만)
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      posts!inner(
        title,
        board_id,
        boards(name)
      )
    `)
    .eq('author_id', user.id)
    .not('posts.board_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // 면접 후기 가져오기 (새로운 스키마: 질문 개수 포함)
  const { data: interviews } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // 각 면접에 대한 질문 개수 조회
  let interviewsWithQuestionCount = []
  if (interviews) {
    interviewsWithQuestionCount = await Promise.all(
      interviews.map(async (interview) => {
        const { count } = await supabase
          .from('interview_questions')
          .select('*', { count: 'exact', head: true })
          .eq('interview_id', interview.id)

        return {
          ...interview,
          question_count: count || 0
        }
      })
    )
  }

  return (
    <MyPageClient 
      user={user}
      profile={profile}
      posts={postsWithCommentCount || []}
      comments={comments || []}
      interviews={interviewsWithQuestionCount || []}
    />
  )
}