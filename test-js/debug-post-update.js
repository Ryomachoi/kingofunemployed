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

async function debugPostUpdate() {
  try {
    console.log('=== 게시물 업데이트 디버깅 ===')
    
    const postId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
    
    // 1. 게시물 존재 확인
    console.log('1. 게시물 존재 확인...')
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
    
    if (fetchError) {
      console.error('게시물 조회 오류:', fetchError)
      return
    }
    
    console.log('게시물 정보:', {
      id: post.id,
      title: post.title,
      view_count: post.view_count,
      is_deleted: post.is_deleted
    })
    
    // 2. 조건 확인
    console.log('\n2. 업데이트 조건 확인...')
    const { data: conditionCheck, error: conditionError } = await supabase
      .from('posts')
      .select('id, view_count, is_deleted')
      .eq('id', postId)
      .eq('is_deleted', false)
    
    console.log('조건 확인 결과:', conditionCheck)
    
    // 3. 직접 업데이트 시도
    console.log('\n3. 직접 업데이트 시도...')
    const newViewCount = (post.view_count || 0) + 1
    
    const { data: updateResult, error: updateError } = await supabase
      .from('posts')
      .update({ view_count: newViewCount })
      .eq('id', postId)
      .eq('is_deleted', false)
    
    console.log('업데이트 결과:', updateResult)
    console.log('업데이트 오류:', updateError)
    
    // 4. 업데이트 후 확인
    console.log('\n4. 업데이트 후 확인...')
    const { data: afterUpdate, error: afterError } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', postId)
      .single()
    
    console.log('업데이트 후 조회수:', afterUpdate?.view_count)
    console.log('예상 조회수:', newViewCount)
    console.log('업데이트 성공:', afterUpdate?.view_count === newViewCount ? '✅' : '❌')
    
  } catch (error) {
    console.error('디버깅 중 오류:', error)
  }
}

debugPostUpdate()