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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.')
  process.exit(1)
}

console.log('=== Supabase 키 확인 ===')
console.log('Service Role Key 존재:', !!supabaseServiceKey)
console.log('Anon Key 존재:', !!supabaseAnonKey)

async function testUpdate() {
  const postId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
  
  // 1. Service Role Key로 테스트
  if (supabaseServiceKey) {
    console.log('\n=== Service Role Key로 테스트 ===')
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
    
    try {
      // 현재 조회수 확인
      const { data: currentPost, error: fetchError } = await supabaseService
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single()
      
      if (fetchError) {
        console.error('게시물 조회 오류:', fetchError)
      } else {
        console.log('현재 조회수:', currentPost.view_count)
        
        // 조회수 업데이트 시도
        const newViewCount = currentPost.view_count + 1
        const { data: updateResult, error: updateError } = await supabaseService
          .from('posts')
          .update({ view_count: newViewCount })
          .eq('id', postId)
          .select('view_count')
        
        if (updateError) {
          console.error('Service Role Key 업데이트 오류:', updateError)
        } else {
          console.log('Service Role Key 업데이트 성공:', updateResult)
        }
      }
    } catch (error) {
      console.error('Service Role Key 테스트 오류:', error)
    }
  }
  
  // 2. Anon Key로 테스트
  if (supabaseAnonKey) {
    console.log('\n=== Anon Key로 테스트 ===')
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
      // 현재 조회수 확인
      const { data: currentPost, error: fetchError } = await supabaseAnon
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single()
      
      if (fetchError) {
        console.error('게시물 조회 오류:', fetchError)
      } else {
        console.log('현재 조회수:', currentPost.view_count)
        
        // 조회수 업데이트 시도
        const newViewCount = currentPost.view_count + 1
        const { data: updateResult, error: updateError } = await supabaseAnon
          .from('posts')
          .update({ view_count: newViewCount })
          .eq('id', postId)
          .select('view_count')
        
        if (updateError) {
          console.error('Anon Key 업데이트 오류:', updateError)
        } else {
          console.log('Anon Key 업데이트 성공:', updateResult)
        }
      }
    } catch (error) {
      console.error('Anon Key 테스트 오류:', error)
    }
  }
}

testUpdate()