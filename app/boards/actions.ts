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

  try {
    // 중복 게시판 확인
    const { data: existingBoard } = await supabase
      .from('boards')
      .select('id')
      .eq('name', name.trim())
      .eq('is_active', true)
      .single()

    if (existingBoard) {
      return { error: '이미 존재하는 기업 게시판입니다.' }
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
      return { error: '게시판 생성에 실패했습니다.' }
    }

    revalidatePath('/boards')
    return redirect(`/boards/${data.id}`)
  } catch (error) {
    console.error('게시판 생성 중 오류:', error)
    return { error: '게시판 생성 중 오류가 발생했습니다.' }
  }
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

  if (title.trim().length > 200) {
    return { error: '제목은 200자 이하로 입력해주세요.' }
  }

  if (!content || content.trim().length === 0) {
    return { error: '내용을 입력해주세요.' }
  }

  if (content.trim().length > 10000) {
    return { error: '내용은 10,000자 이하로 입력해주세요.' }
  }

  try {
    // 게시판 존재 및 활성화 여부 확인
    const { data: board } = await supabase
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .eq('is_active', true)
      .single()

    if (!board) {
      return { error: '존재하지 않거나 비활성화된 게시판입니다.' }
    }

    // 게시글 생성
    const { data, error } = await supabase
      .from('posts')
      .insert({
        board_id: boardId,
        author_id: user.id,
        title: title.trim(),
        content: content.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('게시글 생성 오류:', error)
      return { error: '게시글 작성에 실패했습니다.' }
    }

    revalidatePath(`/boards/${boardId}`)
    return redirect(`/boards/${boardId}/posts/${data.id}`)
  } catch (error) {
    console.error('게시글 생성 중 오류:', error)
    return { error: '게시글 작성 중 오류가 발생했습니다.' }
  }
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
  if (!title || title.trim().length === 0) {
    return { error: '제목을 입력해주세요.' }
  }

  if (title.trim().length > 200) {
    return { error: '제목은 200자 이하로 입력해주세요.' }
  }

  if (!content || content.trim().length === 0) {
    return { error: '내용을 입력해주세요.' }
  }

  if (content.trim().length > 10000) {
    return { error: '내용은 10,000자 이하로 입력해주세요.' }
  }

  try {
    // 게시글 존재 및 권한 확인
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, board_id')
      .eq('id', postId)
      .eq('author_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (!post) {
      return { error: '게시글을 찾을 수 없거나 수정 권한이 없습니다.' }
    }

    // 게시글 수정
    const { error } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)

    if (error) {
      console.error('게시글 수정 오류:', error)
      return { error: '게시글 수정에 실패했습니다.' }
    }

    revalidatePath(`/boards/${post.board_id}`)
    revalidatePath(`/boards/${post.board_id}/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error('게시글 수정 중 오류:', error)
    return { error: '게시글 수정 중 오류가 발생했습니다.' }
  }
}

// 게시글 삭제 (소프트 삭제)
export async function deletePost(postId: string) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  try {
    // 게시글 존재 및 권한 확인
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, board_id')
      .eq('id', postId)
      .eq('author_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (!post) {
      return { error: '게시글을 찾을 수 없거나 삭제 권한이 없습니다.' }
    }

    // 소프트 삭제
    const { error } = await supabase
      .from('posts')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)

    if (error) {
      console.error('게시글 삭제 오류:', error)
      return { error: '게시글 삭제에 실패했습니다.' }
    }

    revalidatePath(`/boards/${post.board_id}`)
    return { success: true }
  } catch (error) {
    console.error('게시글 삭제 중 오류:', error)
    return { error: '게시글 삭제 중 오류가 발생했습니다.' }
  }
}

// 댓글 생성
export async function createComment(formData: FormData) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  const postId = formData.get('postId') as string
  const content = formData.get('content') as string

  // 입력값 검증
  if (!postId) {
    return { error: '게시글 정보가 없습니다.' }
  }

  if (!content || content.trim().length === 0) {
    return { error: '댓글 내용을 입력해주세요.' }
  }

  if (content.trim().length > 1000) {
    return { error: '댓글은 1,000자 이하로 입력해주세요.' }
  }

  try {
    // 게시글 존재 확인
    const { data: post } = await supabase
      .from('posts')
      .select('id, board_id')
      .eq('id', postId)
      .eq('is_deleted', false)
      .single()

    if (!post) {
      return { error: '존재하지 않는 게시글입니다.' }
    }

    // 댓글 생성
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim()
      })

    if (error) {
      console.error('댓글 생성 오류:', error)
      return { error: '댓글 작성에 실패했습니다.' }
    }

    revalidatePath(`/boards/${post.board_id}/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error('댓글 생성 중 오류:', error)
    return { error: '댓글 작성 중 오류가 발생했습니다.' }
  }
}

// 댓글 수정
export async function updateComment(formData: FormData) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  const commentId = formData.get('commentId') as string
  const content = formData.get('content') as string

  // 입력값 검증
  if (!content || content.trim().length === 0) {
    return { error: '댓글 내용을 입력해주세요.' }
  }

  if (content.trim().length > 1000) {
    return { error: '댓글은 1,000자 이하로 입력해주세요.' }
  }

  try {
    // 댓글 존재 및 권한 확인
    const { data: comment } = await supabase
      .from('comments')
      .select('id, author_id, post_id')
      .eq('id', commentId)
      .eq('author_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (!comment) {
      return { error: '댓글을 찾을 수 없거나 수정 권한이 없습니다.' }
    }

    // 댓글 수정
    const { error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)

    if (error) {
      console.error('댓글 수정 오류:', error)
      return { error: '댓글 수정에 실패했습니다.' }
    }

    // 게시글의 board_id 조회
    const { data: post } = await supabase
      .from('posts')
      .select('board_id')
      .eq('id', comment.post_id)
      .single()

    if (post) {
      revalidatePath(`/boards/${post.board_id}/posts/${comment.post_id}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('댓글 수정 중 오류:', error)
    return { error: '댓글 수정 중 오류가 발생했습니다.' }
  }
}

// 댓글 삭제 (소프트 삭제)
export async function deleteComment(commentId: string) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  try {
    // 댓글 존재 및 권한 확인
    const { data: comment } = await supabase
      .from('comments')
      .select('id, author_id, post_id')
      .eq('id', commentId)
      .eq('author_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (!comment) {
      return { error: '댓글을 찾을 수 없거나 삭제 권한이 없습니다.' }
    }

    // 소프트 삭제
    const { error } = await supabase
      .from('comments')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)

    if (error) {
      console.error('댓글 삭제 오류:', error)
      return { error: '댓글 삭제에 실패했습니다.' }
    }

    // 게시글의 board_id 조회
    const { data: post } = await supabase
      .from('posts')
      .select('board_id')
      .eq('id', comment.post_id)
      .single()

    if (post) {
      revalidatePath(`/boards/${post.board_id}/posts/${comment.post_id}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('댓글 삭제 중 오류:', error)
    return { error: '댓글 삭제 중 오류가 발생했습니다.' }
  }
}

// 게시글 추천/추천 취소
export async function togglePostLike(postId: string) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  try {
    // 기존 추천 확인
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // 추천 취소
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) {
        console.error('추천 취소 오류:', error)
        return { error: '추천 취소에 실패했습니다.' }
      }

      return { success: true, liked: false }
    } else {
      // 추천 추가
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (error) {
        console.error('추천 추가 오류:', error)
        return { error: '추천에 실패했습니다.' }
      }

      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('게시글 추천 중 오류:', error)
    return { error: '추천 처리 중 오류가 발생했습니다.' }
  }
}

// 댓글 추천/추천 취소
export async function toggleCommentLike(commentId: string) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('로그인이 필요합니다.')}`)
  }

  try {
    // 기존 추천 확인
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // 추천 취소
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) {
        console.error('댓글 추천 취소 오류:', error)
        return { error: '추천 취소에 실패했습니다.' }
      }

      return { success: true, liked: false }
    } else {
      // 추천 추가
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id
        })

      if (error) {
        console.error('댓글 추천 추가 오류:', error)
        return { error: '추천에 실패했습니다.' }
      }

      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('댓글 추천 중 오류:', error)
    return { error: '추천 처리 중 오류가 발생했습니다.' }
  }
}