import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function QnaDetailPage({ params }) {
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('id', params.id).single()
  if (!post) return notFound()
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className="mb-2 text-slate-500">작성자: {post.user_id} | {new Date(post.created_at).toLocaleDateString('ko-KR')}</div>
      <div className="prose dark:prose-invert">{post.content}</div>
    </div>
  )
}