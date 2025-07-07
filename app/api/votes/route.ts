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

  // URL에서 파라미터 가져오기
  const url = new URL(request.url)
  const postId = url.searchParams.get('postId')
  const value = parseInt(url.searchParams.get('value') || '0')
  
  if (!postId) {
    return NextResponse.json({ error: '게시물 ID가 필요합니다.' }, { status: 400 })
  }

  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: '유효하지 않은 투표 값입니다.' }, { status: 400 })
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

  // 이미 투표했는지 확인
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id, value')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    // 같은 값으로 투표한 경우 투표 취소
    if (existingVote.value === value) {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)

      if (error) {
        console.error('Error deleting vote:', error)
        return NextResponse.json({ error: '투표 취소 중 오류가 발생했습니다.' }, { status: 500 })
      }

      // 게시물의 투표 수 업데이트
      await supabase.rpc('update_vote_count', { post_id: postId, vote_value: -value })
    } 
    // 다른 값으로 투표한 경우 투표 수정
    else {
      const { error } = await supabase
        .from('votes')
        .update({ value })
        .eq('id', existingVote.id)

      if (error) {
        console.error('Error updating vote:', error)
        return NextResponse.json({ error: '투표 수정 중 오류가 발생했습니다.' }, { status: 500 })
      }

      // 게시물의 투표 수 업데이트 (이전 값의 반대로 2배)
      await supabase.rpc('update_vote_count', { post_id: postId, vote_value: value * 2 })
    }
  } 
  // 새로운 투표 생성
  else {
    const { error } = await supabase
      .from('votes')
      .insert({ post_id: postId, user_id: user.id, value })

    if (error) {
      console.error('Error creating vote:', error)
      return NextResponse.json({ error: '투표 생성 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // 게시물의 투표 수 업데이트
    await supabase.rpc('update_vote_count', { post_id: postId, vote_value: value })
  }

  // 캐시 무효화
  revalidatePath(`/forums/${post.forum_id}/${postId}`)
  
  return NextResponse.json({ success: true })
}