import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { interviewId } = await request.json()
    
    console.log('Received interviewId:', interviewId)
    console.log('Current user ID:', user.id)
    
    if (!interviewId) {
      return NextResponse.json(
        { error: '면접 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 해당 면접 후기가 현재 사용자의 것인지 확인
    const { data: interview, error: fetchError } = await supabase
      .from('interviews')
      .select('id, user_id, is_shared')
      .eq('id', interviewId)
      .single()
    
    console.log('Database query result:', { interview, fetchError })

    if (fetchError) {
      return NextResponse.json(
        { error: '면접 후기를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (interview.user_id !== user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // is_shared 상태 토글
    const newIsShared = !interview.is_shared
    
    // Update is_shared status
    const { data: updatedInterview, error: updateError } = await supabase
      .from('interviews')
      .update({ 
        is_shared: newIsShared
      })
      .eq('id', interviewId)
      .select('id, is_shared')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: '공개 상태 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      isShared: updatedInterview.is_shared,
      message: updatedInterview.is_shared ? '게시물이 공개되었습니다.' : '게시물이 비공개되었습니다.'
    })

  } catch (error) {
    console.error('Privacy toggle error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}