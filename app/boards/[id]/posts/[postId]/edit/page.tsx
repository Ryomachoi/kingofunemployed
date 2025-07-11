import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditPostForm from './EditPostForm'

interface EditPostPageProps {
  params: {
    id: string
    postId: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 게시글 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      author_id,
      board_id,
      is_deleted,
      boards!posts_board_id_fkey(name)
    `)
    .eq('id', resolvedParams.postId)
    .eq('board_id', resolvedParams.id)
    .single()

  if (postError || !post || post.is_deleted) {
    notFound()
  }

  // 작성자 확인
  if (post.author_id !== user.id) {
    redirect(`/boards/${resolvedParams.id}/posts/${resolvedParams.postId}`)
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <EditPostForm 
          post={post}
          boardId={resolvedParams.id}
          boardName="게시판"
        />
      </div>
    </div>
  )
}