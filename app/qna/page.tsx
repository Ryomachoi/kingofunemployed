import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function QnaPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('*')

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Q&A 게시판
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            취업 관련 질문과 답변을 나누는 공간입니다
          </p>
        </div>
        <Link 
          href="/qna/new"
          className="btn btn-primary"
        >
          질문하기
        </Link>
      </div>
      
      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/qna/${post.id}`} className="block">
              <div className="card p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                  {post.content}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>작성자: {post.user_id}</span>
                  <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="card p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              아직 질문이 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              첫 번째 질문을 올려보세요!
            </p>
            <Link 
              href="/qna/new"
              className="btn btn-primary"
            >
              질문하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}