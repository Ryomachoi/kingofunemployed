'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  // 사용자 인증 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: '인증이 필요합니다.' }
  }

  const nickname = formData.get('nickname') as string
  
  // 닉네임 유효성 검사
  if (nickname && (nickname.length < 2 || nickname.length > 20)) {
    return { success: false, error: '닉네임은 2-20자여야 합니다.' }
  }
  
  // 닉네임 패턴 검사 (한글, 영문, 숫자, _, - 만 허용)
  if (nickname && !/^[a-zA-Z0-9가-힣_-]+$/.test(nickname)) {
    return { success: false, error: '닉네임은 한글, 영문, 숫자, _, - 만 사용 가능합니다.' }
  }

  try {
    // 닉네임 중복 검사 (빈 문자열이 아닌 경우에만)
    if (nickname) {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('nickname', nickname)
        .neq('id', user.id)
        .single()
      
      if (existingProfile) {
        return { success: false, error: '이미 사용 중인 닉네임입니다.' }
      }
    }

    // 프로필 업데이트 또는 생성 (upsert 사용)
    const upsertData = {
      id: user.id,
      nickname: nickname || null, // 빈 문자열인 경우 null로 저장
      display_name: user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.user_metadata?.nickname ||
                   user.id.substring(0, 8),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(upsertData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (upsertError) {
      console.error('Profile upsert error:', upsertError)
      return { success: false, error: '프로필 업데이트에 실패했습니다.' }
    }

    // 프로필 변경사항을 즉시 반영하기 위한 revalidation
    revalidatePath('/mypage')
    revalidatePath('/layout')
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' }
  }
}

export async function deleteAccount() {
  const supabase = await createClient()
  
  // 사용자 인증 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: '인증이 필요합니다.' }
  }

  try {
    // 1. 사용자가 작성한 게시글을 완전 삭제
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('author_id', user.id)
    
    if (postsError) {
      console.error('Posts deletion error:', postsError)
      return { success: false, error: '게시글 삭제 처리 중 오류가 발생했습니다.' }
    }

    // 2. 사용자가 작성한 댓글을 완전 삭제
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('author_id', user.id)
    
    if (commentsError) {
      console.error('Comments deletion error:', commentsError)
      return { success: false, error: '댓글 삭제 처리 중 오류가 발생했습니다.' }
    }

    // 3. 사용자 프로필 삭제
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id)
    
    if (profileError) {
      console.error('Profile deletion error:', profileError)
      return { success: false, error: '프로필 삭제 중 오류가 발생했습니다.' }
    }

    // 4. Supabase Auth에서 사용자 완전 삭제 (Service Role Key 사용)
    console.log('Service Role Key 확인:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('사용자 ID:', user.id)
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        console.log('Admin client 생성 시작...')
        const { createClient } = await import('@supabase/supabase-js')
        const adminSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        
        console.log('Admin client 생성 완료, 사용자 삭제 시도...')
        const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(user.id)
        
        if (deleteUserError) {
          console.error('Supabase Auth user deletion error:', deleteUserError)
          console.error('Error details:', JSON.stringify(deleteUserError, null, 2))
          // Auth 삭제 실패해도 데이터베이스 삭제는 성공했으므로 계속 진행
        } else {
          console.log('✅ 사용자가 Supabase Auth에서 완전히 삭제되었습니다.')
        }
      } catch (error) {
        console.error('Admin client creation error:', error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error')
      }
    } else {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않아 Auth에서 사용자를 삭제할 수 없습니다.')
    }
    
    // 5. 로그아웃 처리
    await supabase.auth.signOut()
    
    return { success: true }
  } catch (error) {
    console.error('Account deletion error:', error)
    return { success: false, error: '회원탈퇴 처리 중 오류가 발생했습니다.' }
  }
}