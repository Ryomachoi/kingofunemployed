import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Board } from '@/types/database'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 게시판 목록 조회 (실제 게시글 수 집계)
    const { data: boardsData, error } = await supabase
      .from('boards')
      .select(`
        id,
        name,
        description,
        industry,
        job_category,
        headquarters_location,
        website,
        tags,
        logo_image_url,
        logo_icon,
        banner_image_url,
        community_rules,
        created_at,
        creator_id,
        is_active
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('게시판 조회 오류:', error)
      return NextResponse.json({ error: '게시판을 불러올 수 없습니다.' }, { status: 500 })
    }

    // 각 게시판의 실제 게시글 수 집계
    let boards: Board[] = []
    if (boardsData) {
      boards = await Promise.all(
        boardsData.map(async (board) => {
          const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('board_id', board.id)
            .eq('is_deleted', false)
          
          return {
            ...board,
            post_count: count || 0
          }
        })
      )
      
      // 게시글 수로 정렬 (내림차순)
      boards.sort((a, b) => (b.post_count ?? 0) - (a.post_count ?? 0))
    }

    return NextResponse.json({ boards })
  } catch (error) {
    console.error('인기 게시판 조회 중 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}