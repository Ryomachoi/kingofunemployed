import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()
  
  // 사용자 인증 상태 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // 테이블 존재 여부 확인
  let tablesInfo = []
  let tablesError = null
  
  try {
    // profiles 테이블 확인
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    tablesInfo.push({
      table: 'profiles',
      exists: !profilesError,
      error: profilesError?.message || null,
      code: profilesError?.code || null
    })
    
  } catch (err) {
    tablesError = err
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">데이터베이스 디버그 정보</h1>
      
      {/* 사용자 인증 상태 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">사용자 인증 상태</h2>
        {userError ? (
          <div className="text-red-600 dark:text-red-400">
            <p>오류: {userError.message}</p>
          </div>
        ) : (
          <div>
            <p>로그인 상태: {user ? '로그인됨' : '로그인되지 않음'}</p>
            {user && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                <p>사용자 ID: {user.id}</p>
                <p>이메일: {user.email}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 테이블 상태 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">데이터베이스 테이블 상태</h2>
        {tablesError ? (
          <div className="text-red-600 dark:text-red-400">
            <p>테이블 확인 중 오류: {tablesError.message}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tablesInfo.map((table) => (
              <div key={table.table} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
                <span className="font-medium">{table.table} 테이블</span>
                <div className="text-right">
                  {table.exists ? (
                    <span className="text-green-600 dark:text-green-400">✓ 존재함</span>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">
                      <span>✗ 존재하지 않음</span>
                      {table.error && (
                        <div className="text-xs mt-1">
                          <p>오류: {table.error}</p>
                          {table.code && <p>코드: {table.code}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 환경 변수 확인 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold mb-4">환경 설정</h2>
        <div className="space-y-2 text-sm">
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '설정되지 않음'}</p>
          <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음'}</p>
        </div>
      </div>
      
      {/* 해결 방법 안내 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">해결 방법</h2>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          <p>1. Supabase 대시보드에 로그인하세요</p>
          <p>2. profiles 테이블이 없다면 사용자 프로필 관련 SQL을 실행하세요</p>
          <p>3. RLS 정책이 올바르게 설정되었는지 확인하세요</p>
        </div>
      </div>
    </div>
  )
}