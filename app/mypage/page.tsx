import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileEditor from './ProfileEditor'
import { updateProfile, deleteAccount } from './actions'
import type { UserProfile } from '@/types/database'
import DeleteAccountButton from './DeleteAccountButton'

export default async function MyPage() {
  const supabase = await createClient()
  
  // 사용자 인증 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // 사용자 프로필 정보 가져오기
  const { data: profile }: { data: UserProfile | null } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 사용자가 작성한 게시글 가져오기
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      created_at,
      comment_count,
      boards(name)
    `)
    .eq('author_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10)

  // 사용자가 작성한 댓글 가져오기
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      posts(id, title, boards(name))
    `)
    .eq('author_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">마이페이지</h1>
      
      {/* 프로필 섹션 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">프로필 정보</h2>
        <div className="rounded border p-6 bg-white dark:bg-slate-900">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              이메일
            </label>
            <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
          </div>
          
          <ProfileEditor 
            userId={user.id}
            initialNickname={profile?.nickname || ''}
            initialDisplayName={profile?.display_name || user.id.substring(0, 8)}
            onUpdateProfile={updateProfile}
          />
        </div>
      </section>

      {/* 내 게시글 관리 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">내 게시글 관리</h2>
        <div className="rounded border p-4 bg-white dark:bg-slate-900">
          {posts && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-slate-200 dark:border-slate-700 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(post.boards as any)?.name ?? '게시판'} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      💬 {post.comment_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">작성한 게시글이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 내 댓글 관리 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">내 댓글 관리</h2>
        <div className="rounded border p-4 bg-white dark:bg-slate-900">
          {comments && comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-slate-200 dark:border-slate-700 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-slate-700 dark:text-slate-300 mb-2">
                        {comment.content.length > 100 
                          ? comment.content.substring(0, 100) + '...' 
                          : comment.content
                        }
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(comment.posts as any)?.boards?.name ?? '게시판'} • {(comment.posts as any)?.title ?? '게시글'} • {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">작성한 댓글이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 회원탈퇴 섹션 */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">회원탈퇴</h2>
        <div className="rounded border border-red-200 dark:border-red-800 p-6 bg-red-50 dark:bg-red-950">
          <div className="mb-4">
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">회원탈퇴 시 주의사항</h3>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• 작성한 모든 게시글과 댓글이 삭제됩니다.</li>
              <li>• 프로필 정보가 완전히 삭제됩니다.</li>
              <li>• 탈퇴 후에는 동일한 계정으로 재가입이 어려울 수 있습니다.</li>
              <li>• 이 작업은 되돌릴 수 없습니다.</li>
            </ul>
          </div>
          <DeleteAccountButton onDeleteAccount={deleteAccount} />
        </div>
      </section>
    </div>
  );
}