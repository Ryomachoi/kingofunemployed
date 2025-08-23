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
    .select('user_id, nickname, display_name, created_at, updated_at')
    .eq('user_id', user.id)
    .single()

  // 최근 게시글 가져오기
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      boards(name),
      comment_count:comments(count)
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // 최근 댓글 가져오기
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      posts(
        title,
        boards(name)
      )
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <MyPageClient 
      user={user}
      profile={profile}
      posts={posts || []}
      comments={comments || []}
    />
  )
}