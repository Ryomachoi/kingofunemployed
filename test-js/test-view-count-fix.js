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

async function testViewCountIncrement() {
  try {
    console.log('=== 조회수 증가 테스트 시작 ===')
    
    // 게시물 조회
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, view_count')
      .eq('is_deleted', false)
      .limit(1)
    
    if (postsError || !posts || posts.length === 0) {
      console.error('게시물 조회 오류:', postsError)
      return
    }
    
    const post = posts[0]
    console.log(`테스트 대상 게시물: "${post.title}" (ID: ${post.id})`)
    console.log(`현재 조회수: ${post.view_count}`)
    
    // 조회수 증가 테스트
    const newViewCount = (post.view_count || 0) + 1
    console.log(`시도할 조회수 업데이트: ${post.view_count} → ${newViewCount}`)
    
    const { data: updatedData, error: updateError } = await supabase
      .from('posts')
      .update({ view_count: newViewCount })
      .eq('id', post.id)
      .eq('is_deleted', false)
      .select('view_count')
    
    if (updateError) {
      console.error('조회수 업데이트 오류:', updateError)
      
      // 다시 조회해서 실제 상태 확인
      const { data: checkData, error: checkError } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', post.id)
        .eq('is_deleted', false)
        .single()
      
      if (!checkError && checkData) {
        console.log(`실제 현재 조회수: ${checkData.view_count}`)
      }
      return
    }
    
    console.log(`업데이트 결과:`, updatedData)
    if (updatedData && updatedData.length > 0) {
      console.log(`업데이트 후 조회수: ${updatedData[0].view_count}`)
      console.log(`예상 조회수: ${newViewCount}`)
      console.log(`업데이트 성공: ${updatedData[0].view_count === newViewCount ? '✅' : '❌'}`)
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error)
  }
}

testViewCountIncrement()