import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { searchForums } from './actions'

export default async function ForumsPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const query = searchParams.query || ''
  const { forums } = await searchForums(query)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            게시판
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            취업 관련 정보와 경험을 공유하는 공간입니다
          </p>
        </div>
        <Link 
          href="/forums/new"
          className="btn btn-primary"
        >
          새 게시판 만들기
        </Link>
      </div>

      <div className="mb-8">
        <form className="flex gap-2">
          <input
            type="text"
            name="query"
            placeholder="게시판 검색..."
            defaultValue={query}
            className="input flex-1"
          />
          <button type="submit" className="btn btn-secondary">
            검색
          </button>
        </form>
      </div>
      
      <div className="space-y-4">
        {forums && forums.length > 0 ? (
          forums.map((forum) => (
            <Link key={forum.id} href={`/forums/${forum.id}`} className="block">
              <div className="card p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {forum.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                  {forum.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>게시물: {forum.post_count || 0}개</span>
                  <span>{new Date(forum.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </Link>
          ))
        ) : query ? (
          <div className="card p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              '{query}'에 대한 게시판을 찾을 수 없습니다.
            </p>
            <Link 
              href="/forums/new"
              className="btn btn-primary"
            >
              새 게시판 만들기
            </Link>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              아직 게시판이 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              첫 번째 게시판을 만들어보세요!
            </p>
            <Link 
              href="/forums/new"
              className="btn btn-primary"
            >
              새 게시판 만들기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}