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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testViewCountConsistency() {
  const postId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
  
  try {
    console.log('=== 조회수 일관성 테스트 ===')
    
    // 1. 게시물 상세 정보 조회 (게시물 상세 페이지에서 사용하는 쿼리)
    const { data: postDetail, error: detailError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        view_count,
        comment_count,
        created_at,
        updated_at,
        author_id,
        board_id,
        is_deleted,
        tags
      `)
      .eq('id', postId)
      .eq('is_deleted', false)
      .single()
    
    if (detailError) {
      console.error('게시물 상세 조회 오류:', detailError)
      return
    }
    
    console.log('게시물 상세 페이지 조회수:', postDetail.view_count)
    
    // 2. 게시물 목록에서 조회 (게시물 목록 페이지에서 사용하는 쿼리)
    const { data: postList, error: listError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        view_count,
        comment_count,
        created_at,
        updated_at,
        author_id,
        board_id,
        is_deleted,
        tags
      `)
      .eq('board_id', postDetail.board_id)
      .eq('is_deleted', false)
      .eq('id', postId)
      .single()
    
    if (listError) {
      console.error('게시물 목록 조회 오류:', listError)
      return
    }
    
    console.log('게시물 목록 페이지 조회수:', postList.view_count)
    
    // 3. 일관성 확인
    const isConsistent = postDetail.view_count === postList.view_count
    console.log(`조회수 일관성: ${isConsistent ? '✅ 일치' : '❌ 불일치'}`)
    
    if (!isConsistent) {
      console.log(`상세 페이지: ${postDetail.view_count}, 목록 페이지: ${postList.view_count}`)
    }
    
    // 4. 조회수 증가 테스트
    console.log('\n=== 조회수 증가 테스트 ===')
    const originalViewCount = postDetail.view_count
    console.log('증가 전 조회수:', originalViewCount)
    
    // 조회수 증가 (actions.ts의 incrementPostViewCount 함수와 동일한 로직)
    const newViewCount = (originalViewCount || 0) + 1
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ view_count: newViewCount })
      .eq('id', postId)
      .eq('is_deleted', false)
    
    if (updateError) {
      console.error('조회수 업데이트 오류:', updateError)
    } else {
      console.log('조회수 업데이트 성공')
      
      // 업데이트 후 확인
      const { data: updatedPost, error: verifyError } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single()
      
      if (!verifyError && updatedPost) {
        console.log('업데이트 후 조회수:', updatedPost.view_count)
        console.log(`증가 확인: ${updatedPost.view_count === newViewCount ? '✅ 성공' : '❌ 실패'}`)
      }
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error)
  }
}

testViewCountConsistency()