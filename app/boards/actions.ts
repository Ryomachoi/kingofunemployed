'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// 게시판 생성
export async function createBoard(formData: FormData) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  // 입력값 검증
  if (!name || name.trim().length === 0) {
    return { error: '기업명을 입력해주세요.' }
  }

  if (name.trim().length > 100) {
    return { error: '기업명은 100자 이하로 입력해주세요.' }
  }

  if (description && description.length > 500) {
    return { error: '설명은 500자 이하로 입력해주세요.' }
  }

  // 중복 게시판명 확인
  const { data: existingBoard } = await supabase
    .from('boards')
    .select('id')
    .eq('name', name.trim())
    .single()

  if (existingBoard) {
    return { error: '이미 존재하는 기업명입니다. 다른 이름을 사용해주세요.' }
  }

  // 게시판 생성
  const { data, error } = await supabase
    .from('boards')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      creator_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('게시판 생성 오류:', error)
    
    // 구체적인 오류 메시지 제공
    if (error.code === '42P01') {
      return { error: '데이터베이스 테이블이 설정되지 않았습니다. 관리자에게 문의하세요.' }
    }
    if (error.code === '23505') {
      return { error: '이미 존재하는 기업명입니다. 다른 이름을 사용해주세요.' }
    }
    if (error.code === '42501') {
      return { error: '권한이 없습니다. 로그인 상태를 확인해주세요.' }
    }
    
    return { error: `게시판 생성 중 오류가 발생했습니다: ${error.message}` }
  }

  // 캐시 무효화
  revalidatePath('/boards')
  
  return { success: true, board: data }
}

// 게시글 생성
export async function createPost(formData: FormData) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  const boardId = formData.get('boardId') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // 입력값 검증
  if (!boardId) {
    return { error: '게시판 정보가 없습니다.' }
  }

  if (!title || title.trim().length === 0) {
    return { error: '제목을 입력해주세요.' }
  }

  if (!content || content.trim().length === 0) {
    return { error: '내용을 입력해주세요.' }
  }

  if (title.trim().length > 200) {
    return { error: '제목은 200자 이하로 입력해주세요.' }
  }

  if (content.trim().length > 10000) {
    return { error: '내용은 10,000자 이하로 입력해주세요.' }
  }

  // 게시판 존재 확인
  const { data: board } = await supabase
    .from('boards')
    .select('id, is_active')
    .eq('id', boardId)
    .single()

  if (!board) {
    return { error: '존재하지 않는 게시판입니다.' }
  }

  if (!board.is_active) {
    return { error: '비활성화된 게시판입니다.' }
  }

  // 게시글 생성
  const { data, error } = await supabase
    .from('posts')
    .insert({
      board_id: boardId,
      title: title.trim(),
      content: content.trim(),
      author_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('게시글 생성 오류:', error)
    return { error: '게시글 작성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  // 게시판의 post_count 수동 업데이트 (INSERT 트리거가 작동하지 않을 수 있음)
  const { error: countError } = await supabase
    .from('boards')
    .update({ post_count: supabase.raw('post_count + 1') })
    .eq('id', boardId)

  if (countError) {
    console.error('게시글 수 업데이트 오류:', countError)
  }

  // 캐시 무효화
  revalidatePath(`/boards/${boardId}`)
  revalidatePath('/boards')
  
  return { success: true, post: data }
}

// 게시글 수정
export async function updatePost(formData: FormData) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  const postId = formData.get('postId') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // 입력값 검증
  if (!postId) {
    return { error: '게시글 정보가 없습니다.' }
  }

  if (!title || title.trim().length === 0) {
    return { error: '제목을 입력해주세요.' }
  }

  if (!content || content.trim().length === 0) {
    return { error: '내용을 입력해주세요.' }
  }

  // 게시글 존재 및 권한 확인
  const { data: post } = await supabase
    .from('posts')
    .select('id, author_id, board_id')
    .eq('id', postId)
    .eq('author_id', user.id)
    .single()

  if (!post) {
    return { error: '게시글을 찾을 수 없거나 수정 권한이 없습니다.' }
  }

  // 게시글 수정
  const { data, error } = await supabase
    .from('posts')
    .update({
      title: title.trim(),
      content: content.trim(),
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    return { error: '게시글 수정 중 오류가 발생했습니다.' }
  }

  // 캐시 무효화
  revalidatePath(`/boards/${post.board_id}`)
  revalidatePath(`/boards/${post.board_id}/posts/${postId}`)
  
  return { success: true, post: data }
}

// 게시글 삭제
export async function deletePost(postId: string) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  // 게시글 존재 및 권한 확인
  const { data: post } = await supabase
    .from('posts')
    .select('id, author_id, board_id')
    .eq('id', postId)
    .eq('author_id', user.id)
    .single()

  if (!post) {
    return { error: '게시글을 찾을 수 없거나 삭제 권한이 없습니다.' }
  }

  // 게시글 삭제 (소프트 삭제)
  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', postId)

  if (error) {
    return { error: '게시글 삭제 중 오류가 발생했습니다.' }
  }

  // 게시판의 post_count 수동 업데이트 (소프트 삭제이므로 트리거가 작동하지 않음)
  const { error: countError } = await supabase
    .from('boards')
    .update({ post_count: supabase.raw('post_count - 1') })
    .eq('id', post.board_id)

  if (countError) {
    console.error('게시글 수 업데이트 오류:', countError)
  }

  // 캐시 무효화
  revalidatePath(`/boards/${post.board_id}`)
  
  return { success: true }
}

// 게시판의 post_count 재계산 및 업데이트
export async function recalculatePostCount(boardId: string) {
  const supabase = await createClient()

  // 실제 게시물 수 계산 (삭제되지 않은 게시물만)
  const { count, error: countError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', boardId)
    .eq('is_deleted', false)

  if (countError) {
    console.error('게시물 수 계산 오류:', countError)
    return { error: '게시물 수 계산 중 오류가 발생했습니다.' }
  }

  // 게시판의 post_count 업데이트
  const { error: updateError } = await supabase
    .from('boards')
    .update({ post_count: count || 0 })
    .eq('id', boardId)

  if (updateError) {
    console.error('게시판 post_count 업데이트 오류:', updateError)
    return { error: '게시판 정보 업데이트 중 오류가 발생했습니다.' }
  }

  return { success: true, count: count || 0 }
}
