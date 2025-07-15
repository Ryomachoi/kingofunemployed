'use server'

import { createClient } from '@/lib/supabase/server'

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

    // 프로필 업데이트
    const updateData: {
      nickname: string | null
      updated_at: string
    } = {
      nickname: nickname || null, // 빈 문자열인 경우 null로 저장
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { success: false, error: '프로필 업데이트에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' }
  }
}