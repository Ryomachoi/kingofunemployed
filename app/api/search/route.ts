import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '검색어를 입력해주세요.' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // 태그와 내용에서 검색
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        tags,
        view_count,
        created_at,
        board_id,
        user_id,
        user_profiles!posts_user_id_fkey (
          id,
          display_name,
          avatar_url
        ),
        boards!posts_board_id_fkey (
          id,
          name,
          logo_icon,
          logo_image_url
        )
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('검색 오류:', error)
      return NextResponse.json({ 
        success: false, 
        error: '검색 중 오류가 발생했습니다.' 
      }, { status: 500 })
    }

    // 검색 결과 개수 조회
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)

    if (countError) {
      console.error('검색 결과 개수 조회 오류:', countError)
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
      total: count || 0,
      query,
      limit,
      offset
    })

  } catch (error) {
    console.error('검색 API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}