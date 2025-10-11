const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// .env.local 파일 수동 파싱
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
  } catch (error) {
    console.error('.env.local 파일을 읽을 수 없습니다:', error.message)
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRPCFunction() {
  const postId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
  
  try {
    console.log('=== RPC 함수 테스트 ===')
    
    // 1. 현재 조회수 확인
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('view_count, title')
      .eq('id', postId)
      .single()
    
    if (fetchError) {
      console.error('게시물 조회 오류:', fetchError)
      return
    }
    
    console.log('게시물:', currentPost.title)
    console.log('현재 조회수:', currentPost.view_count)
    
    // 2. RPC 함수로 조회수 증가
    const { data: newViewCount, error: rpcError } = await supabase
      .rpc('increment_post_view_count', { post_id: postId })
    
    if (rpcError) {
      console.error('RPC 함수 오류:', rpcError)
      return
    }
    
    console.log('RPC 함수 결과:', newViewCount)
    
    // 3. 업데이트 후 조회수 확인
    const { data: updatedPost, error: verifyError } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', postId)
      .single()
    
    if (verifyError) {
      console.error('업데이트 확인 오류:', verifyError)
      return
    }
    
    console.log('업데이트 후 조회수:', updatedPost.view_count)
    console.log('증가량:', updatedPost.view_count - currentPost.view_count)
    
  } catch (error) {
    console.error('테스트 중 오류:', error)
  }
}

testRPCFunction()