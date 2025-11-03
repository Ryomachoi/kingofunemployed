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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

console.log('=== 환경 변수 확인 ===')
console.log('Supabase URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
console.log('Anon Key:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음')
console.log('Service Role Key:', supabaseServiceKey ? '✅ 설정됨' : '❌ 없음')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('필수 Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

async function comprehensiveViewCountDebug() {
  const testPostId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
  
  try {
    console.log('\n=== 1. 게시물 존재 여부 확인 ===')
    
    const { data: post, error: postError } = await supabaseAnon
      .from('posts')
      .select('*')
      .eq('id', testPostId)
      .single()
    
    if (postError) {
      console.error('게시물 조회 오류:', postError)
      return
    }
    
    console.log('게시물 제목:', post.title)
    console.log('현재 조회수:', post.view_count)
    console.log('삭제 여부:', post.is_deleted)
    console.log('작성자 ID:', post.author_id)
    
    console.log('\n=== 2. RLS 정책 확인 (Admin 권한) ===')
    
    if (supabaseAdmin) {
      // RLS 상태 확인
      const { data: rlsStatus, error: rlsError } = await supabaseAdmin
        .from('pg_class')
        .select('relname, relrowsecurity')
        .eq('relname', 'posts')
        .single()
      
      if (!rlsError && rlsStatus) {
        console.log('Posts 테이블 RLS 활성화:', rlsStatus.relrowsecurity ? '✅ 활성화' : '❌ 비활성화')
      }
      
      // 테이블 권한 확인
      const { data: permissions, error: permError } = await supabaseAdmin
        .rpc('check_table_permissions', { table_name: 'posts' })
        .catch(() => null)
      
      if (permissions) {
        console.log('테이블 권한:', permissions)
      }
    } else {
      console.log('Service Role Key가 없어 RLS 정책을 확인할 수 없습니다.')
    }
    
    console.log('\n=== 3. Anon Key로 업데이트 테스트 ===')
    
    const originalViewCount = post.view_count || 0
    const newViewCount = originalViewCount + 1
    
    console.log(`업데이트 시도: ${originalViewCount} → ${newViewCount}`)
    
    // 업데이트 시도 (반환값 없이)
    const { error: updateError1 } = await supabaseAnon
      .from('posts')
      .update({ view_count: newViewCount })
      .eq('id', testPostId)
      .eq('is_deleted', false)
    
    console.log('업데이트 오류 (반환값 없음):', updateError1 || '없음')
    
    // 업데이트 시도 (반환값 포함)
    const { data: updateResult, error: updateError2 } = await supabaseAnon
      .from('posts')
      .update({ view_count: newViewCount + 1 })
      .eq('id', testPostId)
      .eq('is_deleted', false)
      .select('view_count')
    
    console.log('업데이트 오류 (반환값 포함):', updateError2 || '없음')
    console.log('업데이트 결과:', updateResult)
    
    console.log('\n=== 4. 실제 데이터베이스 상태 확인 ===')
    
    // 업데이트 후 실제 값 확인
    const { data: updatedPost, error: checkError } = await supabaseAnon
      .from('posts')
      .select('view_count, updated_at')
      .eq('id', testPostId)
      .single()
    
    if (!checkError && updatedPost) {
      console.log('실제 조회수:', updatedPost.view_count)
      console.log('마지막 업데이트:', updatedPost.updated_at)
      console.log('조회수 변경됨:', updatedPost.view_count !== originalViewCount ? '✅ 변경됨' : '❌ 변경 안됨')
    }
    
    console.log('\n=== 5. Service Role Key로 업데이트 테스트 ===')
    
    if (supabaseAdmin) {
      const serviceViewCount = (updatedPost?.view_count || 0) + 1
      
      const { data: adminUpdateResult, error: adminUpdateError } = await supabaseAdmin
        .from('posts')
        .update({ view_count: serviceViewCount })
        .eq('id', testPostId)
        .select('view_count')
      
      console.log('Admin 업데이트 오류:', adminUpdateError || '없음')
      console.log('Admin 업데이트 결과:', adminUpdateResult)
      
      if (!adminUpdateError && adminUpdateResult && adminUpdateResult.length > 0) {
        console.log('Service Role Key로 업데이트 성공 ✅')
      }
    }
    
    console.log('\n=== 6. 다른 게시물들의 조회수 확인 ===')
    
    const { data: otherPosts, error: otherError } = await supabaseAnon
      .from('posts')
      .select('id, title, view_count, updated_at')
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false })
      .limit(5)
    
    if (!otherError && otherPosts) {
      console.log('최근 게시물들의 조회수:')
      otherPosts.forEach(p => {
        console.log(`- ${p.title}: ${p.view_count || 0}회`)
      })
    }
    
    console.log('\n=== 7. 네트워크 및 연결 상태 확인 ===')
    
    // 간단한 연결 테스트
    const startTime = Date.now()
    const { data: connectionTest, error: connectionError } = await supabaseAnon
      .from('posts')
      .select('count')
      .limit(1)
    
    const responseTime = Date.now() - startTime
    console.log('Supabase 연결 응답 시간:', responseTime + 'ms')
    console.log('연결 상태:', connectionError ? '❌ 오류' : '✅ 정상')
    
  } catch (error) {
    console.error('디버깅 중 오류:', error)
  }
}

comprehensiveViewCountDebug()