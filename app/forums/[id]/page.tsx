import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getForumDetails } from '../actions'

export default async function ForumDetailPage({ params }: { params: { id: string } }) {
  const { forum, posts, error } = await getForumDetails(params.id)
  
  if (error || !forum) {
    return notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href="/forums" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          게시판 목록으로 돌아가기
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {forum.name}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {forum.description}
          </p>
        </div>
        <Link 
          href={`/forums/${params.id}/new`}
          className="btn btn-primary"
        >
          새 게시물 작성
        </Link>
      </div>
      
      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/forums/${params.id}/${post.id}`} className="block">
              <div className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <button className="text-slate-400 hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-lg font-medium my-1">{post.vote_count || 0}</span>
                    <button className="text-slate-400 hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                      {post.content}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comment_count || 0} 댓글</span>
                      </div>
                      <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
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
              아직 게시물이 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              첫 번째 게시물을 작성해보세요!
            </p>
            <Link 
              href={`/forums/${params.id}/new`}
              className="btn btn-primary"
            >
              새 게시물 작성
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}