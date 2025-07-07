import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  // URL에서 postId 파라미터 가져오기
  const url = new URL(request.url)
  const postId = url.searchParams.get('postId')
  
  if (!postId) {
    return NextResponse.json({ error: '게시물 ID가 필요합니다.' }, { status: 400 })
  }

  // 게시물 존재 여부 확인
  const { data: post } = await supabase
    .from('posts')
    .select('id, forum_id')
    .eq('id', postId)
    .single()

  if (!post) {
    return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 })
  }

  // 폼 데이터 가져오기
  const formData = await request.formData()
  const content = formData.get('content') as string

  if (!content) {
    return NextResponse.json({ error: '댓글 내용이 필요합니다.' }, { status: 400 })
  }

  // 댓글 생성
  const { error } = await supabase
    .from('comments')
    .insert({ content, user_id: user.id, post_id: postId })

  if (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: '댓글 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }

  // 게시물의 댓글 수 업데이트
  await supabase.rpc('increment_comment_count', { post_id: postId })

  // 캐시 무효화 및 리다이렉트
  revalidatePath(`/forums/${post.forum_id}/${postId}`)
  
  return NextResponse.json({ success: true })
}