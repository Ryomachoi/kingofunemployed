const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// .env.local 파일 수동 파싱
function loadEnvLocal() {
  const envPath = path.join(__dirname, '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.error('.env.local 파일을 찾을 수 없습니다.')
    return {}
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
  
  return env
}

const env = loadEnvLocal()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAlternativeApproaches() {
  const testPostId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
  
  try {
    console.log('=== Service Role Key 없이 조회수 업데이트 대안 테스트 ===')
    
    // 1. 현재 상태 확인
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('view_count, title')
      .eq('id', testPostId)
      .single()
    
    if (fetchError) {
      console.error('게시물 조회 오류:', fetchError)
      return
    }
    
    console.log('현재 게시물:', currentPost.title)
    console.log('현재 조회수:', currentPost.view_count)
    
    // 2. RPC 함수 생성 및 테스트
    console.log('\n=== RPC 함수 생성 시도 ===')
    
    // RPC 함수 생성 (SECURITY DEFINER로 권한 우회)
    const createRpcQuery = `
      CREATE OR REPLACE FUNCTION increment_post_view_count_public(post_id UUID)
      RETURNS INTEGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
          new_view_count INTEGER;
      BEGIN
          -- 게시물이 존재하고 삭제되지 않았는지 확인
          IF NOT EXISTS (
              SELECT 1 FROM posts 
              WHERE id = post_id AND is_deleted = false
          ) THEN
              RETURN 0;
          END IF;
          
          -- 조회수 증가 및 새로운 값 반환
          UPDATE posts 
          SET view_count = COALESCE(view_count, 0) + 1,
              updated_at = NOW()
          WHERE id = post_id AND is_deleted = false
          RETURNING view_count INTO new_view_count;
          
          RETURN COALESCE(new_view_count, 0);
      END;
      $$;
    `
    
    // RPC 함수 생성 시도
    const { error: createRpcError } = await supabase.rpc('exec', { 
      query: createRpcQuery 
    }).catch(() => ({ error: 'RPC 생성 권한 없음' }))
    
    if (createRpcError) {
      console.log('RPC 함수 생성 실패:', createRpcError)
    } else {
      console.log('RPC 함수 생성 성공 ✅')
    }
    
    // 3. 기존 RPC 함수 호출 테스트
    console.log('\n=== 기존 RPC 함수 호출 테스트 ===')
    
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('increment_post_view_count_public', { post_id: testPostId })
    
    if (rpcError) {
      console.log('RPC 함수 호출 실패:', rpcError.message)
    } else {
      console.log('RPC 함수 호출 성공:', rpcResult)
    }
    
    // 4. 직접 SQL 실행 테스트
    console.log('\n=== 직접 SQL 실행 테스트 ===')
    
    const updateSql = `
      UPDATE posts 
      SET view_count = COALESCE(view_count, 0) + 1,
          updated_at = NOW()
      WHERE id = '${testPostId}' AND is_deleted = false
      RETURNING view_count;
    `
    
    const { data: sqlResult, error: sqlError } = await supabase
      .rpc('exec', { query: updateSql })
      .catch(() => ({ error: 'SQL 실행 권한 없음' }))
    
    if (sqlError) {
      console.log('직접 SQL 실행 실패:', sqlError)
    } else {
      console.log('직접 SQL 실행 성공:', sqlResult)
    }
    
    // 5. 트리거 기반 접근법 테스트
    console.log('\n=== 트리거 기반 접근법 테스트 ===')
    
    // 조회 로그 테이블에 삽입하여 트리거로 조회수 증가
    const { error: logError } = await supabase
      .from('post_view_logs')
      .insert({
        post_id: testPostId,
        viewed_at: new Date().toISOString()
      })
      .catch(() => ({ error: '로그 테이블 없음' }))
    
    if (logError) {
      console.log('조회 로그 삽입 실패:', logError)
    } else {
      console.log('조회 로그 삽입 성공 ✅')
    }
    
    // 6. 최종 상태 확인
    console.log('\n=== 최종 상태 확인 ===')
    
    const { data: finalPost, error: finalError } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', testPostId)
      .single()
    
    if (!finalError && finalPost) {
      console.log('최종 조회수:', finalPost.view_count)
      console.log('조회수 변경됨:', finalPost.view_count !== currentPost.view_count ? '✅ 변경됨' : '❌ 변경 안됨')
    }
    
    // 7. 권한 문제 해결 방안 제시
    console.log('\n=== 권한 문제 해결 방안 ===')
    console.log('1. Service Role Key 추가 (.env.local에 SUPABASE_SERVICE_ROLE_KEY 설정)')
    console.log('2. RLS 정책 수정 (posts 테이블의 UPDATE 정책 완화)')
    console.log('3. 트리거 기반 조회수 증가 (별도 로그 테이블 사용)')
    console.log('4. 클라이언트 사이드 캐싱 (로컬 스토리지 활용)')
    
  } catch (error) {
    console.error('테스트 중 오류:', error)
  }
}

testAlternativeApproaches()