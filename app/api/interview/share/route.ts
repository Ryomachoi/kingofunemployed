import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { interviewId } = await request.json();

    if (!interviewId) {
      return NextResponse.json(
        { success: false, error: '면접 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 면접 데이터 조회
    const { data: interview, error: fetchError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single();

    if (fetchError || !interview) {
      console.error('면접 데이터 조회 오류:', fetchError);
      return NextResponse.json(
        { success: false, error: '면접 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 공유된 면접인지 확인
    if (interview.is_shared) {
      return NextResponse.json(
        { success: false, error: '이미 공유된 면접입니다.' },
        { status: 400 }
      );
    }

    // is_shared 플래그를 true로 업데이트
    const { error: updateError } = await supabase
      .from('interviews')
      .update({ is_shared: true })
      .eq('id', interviewId);

    if (updateError) {
      console.error('면접 공유 상태 업데이트 오류:', updateError);
      return NextResponse.json(
        { success: false, error: '공유 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '면접이 성공적으로 커뮤니티에 공유되었습니다.'
    });

  } catch (error) {
    console.error('면접 공유 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}