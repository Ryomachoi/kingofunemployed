import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { PostWithProfile } from '@/types/database'

interface BoardDetailPageProps {
  params: {
    id: string
  }
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // 게시판 정보 조회
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select(`
      id,
      name,
      description,
      created_at,
      creator_id
    `)
    .eq('id', resolvedParams.id)
    .eq('is_active', true)
    .single()

  if (boardError || !board) {
    notFound()
  }

  // 실제 게시글 수 집계
  const { count: actualPostCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', resolvedParams.id)
    .eq('is_deleted', false)

  // 게시글 목록 조회
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      like_count,
      comment_count,
      view_count,
      created_at,
      updated_at,
      author_id
    `)
    .eq('board_id', resolvedParams.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20)

  // 게시글 작성자들의 프로필 정보 조회
  let postsWithProfiles: PostWithProfile[] = posts || []
  if (posts && posts.length > 0) {
    const authorIds = [...new Set(posts.map(post => post.author_id).filter(Boolean))]
    
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, nickname, display_name')
        .in('id', authorIds)
      
      // 게시글에 프로필 정보 매핑
      postsWithProfiles = posts.map(post => ({
        ...post,
        user_profiles: profiles?.find(profile => profile.id === post.author_id) || null
      }))
    }
  }

  if (postsError) {
    console.error('게시글 조회 오류:', postsError)
  }

  // 사용자 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/boards"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          게시판 목록으로 돌아가기
        </Link>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {board.name}
              </h1>
              {board.description && (
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {board.description}
                </p>
              )}
              <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {actualPostCount || 0}개 게시글
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  생성일: {new Date(board.created_at).toLocaleDateString('ko-KR')}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  {new Date(board.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
            
            {user && (
              <Link
                href={`/boards/${resolvedParams.id}/posts/new`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 ml-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                글쓰기
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {postsWithProfiles && postsWithProfiles.length > 0 ? (
          postsWithProfiles.map((post) => (
            <Link
              key={post.id}
              href={`/boards/${resolvedParams.id}/posts/${post.id}`}
              className="block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                      {post.content.replace(/\n/g, ' ').substring(0, 150)}
                      {post.content.length > 150 && '...'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {post.author_id ? (
                          post.user_profiles?.nickname || 
                          post.user_profiles?.display_name || 
                          post.author_id.substring(0, 8)
                        ) : '익명'}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(post.created_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {post.updated_at !== post.created_at && (
                        <span className="text-orange-500 dark:text-orange-400">
                          (수정됨)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.view_count || 0}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.like_count}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comment_count}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              아직 작성된 게시글이 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              이 게시판의 첫 번째 게시글을 작성해보세요!
            </p>
            {user ? (
              <Link
                href={`/boards/${resolvedParams.id}/posts/new`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                첫 게시글 작성하기
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                로그인하여 글쓰기
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 페이지네이션 (추후 구현) */}
      {posts && posts.length >= 20 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            더 많은 게시글을 보려면 페이지네이션 기능을 구현해야 합니다.
          </p>
        </div>
      )}
    </div>
  )
}