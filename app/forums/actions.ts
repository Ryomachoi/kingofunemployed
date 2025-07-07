'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Forum, Post } from '@/lib/types'

// 게시판 생성 함수
export async function createForum(formData: FormData) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name || !description) {
    return { error: '게시판 이름과 설명을 모두 입력해주세요.', success: false }
  }

  // 중복 게시판 확인
  const { data: existingForum } = await supabase
    .from('forums')
    .select('id')
    .ilike('name', name)
    .single()

  if (existingForum) {
    return { error: '이미 동일한 이름의 게시판이 존재합니다.', success: false }
  }

  try {
    // 게시판 생성
    const { error, data } = await supabase
      .from('forums')
      .insert({ name, description, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Error creating forum:', error)
      return { error: '게시판 생성 중 오류가 발생했습니다.', success: false }
    }

    revalidatePath('/forums')
    return { success: true, forumId: data.id }
  } catch (err) {
    console.error('Unexpected error creating forum:', err)
    return { error: '게시판 생성 중 예기치 않은 오류가 발생했습니다.', success: false }
  }
}

// 게시물 생성 함수
export async function createPost(formData: FormData) {
  const supabase = await createClient()

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const forum_id = formData.get('forum_id') as string

  if (!title || !content || !forum_id) {
    return { error: '제목, 내용, 게시판 정보가 모두 필요합니다.', success: false }
  }

  // 게시물 생성
  const { error } = await supabase
    .from('posts')
    .insert({ title, content, user_id: user.id, forum_id })

  if (error) {
    console.error('Error creating post:', error)
    return { error: '게시물 생성 중 오류가 발생했습니다.', success: false }
  }

  revalidatePath(`/forums/${forum_id}`)
  return { success: true }
}

// 게시판 검색 함수
export async function searchForums(query: string) {
  const supabase = await createClient()
  
  if (!query || query.trim() === '') {
    const { data } = await supabase
      .from('forums')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    return { forums: data || [] }
  }

  const { data } = await supabase
    .from('forums')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false })
  
  return { forums: data || [] }
}

// 게시판 상세 정보 조회 함수
export async function getForumDetails(forumId: string) {
  const supabase = await createClient()
  
  const { data: forum } = await supabase
    .from('forums')
    .select('*')
    .eq('id', forumId)
    .single()
  
  if (!forum) {
    return { error: '게시판을 찾을 수 없습니다.' }
  }
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('forum_id', forumId)
    .order('created_at', { ascending: false })
  
  return { forum, posts: posts || [] }
}

// 게시물 상세 정보 조회 함수
export async function getPostDetails(postId: string) {
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()
  
  if (!post) {
    return { error: '게시물을 찾을 수 없습니다.' }
  }
  
  const { data: forum } = await supabase
    .from('forums')
    .select('*')
    .eq('id', post.forum_id)
    .single()
  
  return { post, forum }
}