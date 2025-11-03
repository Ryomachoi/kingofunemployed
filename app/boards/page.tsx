import { createClient } from '@/lib/supabase/server'
import type { Board } from '@/types/database'
import BoardsClient from './BoardsClient'

export default async function BoardsPage() {
  const supabase = await createClient()
  
  // 게시판 목록 조회 (실제 게시글 수 집계)
  const { data: boardsData, error } = await supabase
    .from('boards')
    .select(`
      id,
      name,
      description,
      category,
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
      creator_id
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

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
        } as Board
      })
    )
    
    // 게시글 수로 정렬
    boards.sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
  }

  // 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  return <BoardsClient initialBoards={boards} user={user} />
}