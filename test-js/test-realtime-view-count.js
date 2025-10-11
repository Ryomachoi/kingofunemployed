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

async function testRealtimeViewCount() {
  const testPostId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
  
  try {
    console.log('=== 실시간 조회수 업데이트 테스트 ===')
    
    // 1. 초기 상태 확인
    console.log('\n1. 초기 조회수 확인')
    const { data: initialPost, error: initialError } = await supabase
      .from('posts')
      .select('view_count, title')
      .eq('id', testPostId)
      .single()
    
    if (initialError) {
      console.error('초기 조회 오류:', initialError)
      return
    }
    
    console.log(`게시물: ${initialPost.title}`)
    console.log(`초기 조회수: ${initialPost.view_count}`)
    
    // 2. 여러 번 연속 업데이트 시도
    console.log('\n2. 연속 업데이트 테스트 (5회)')
    
    const updatePromises = []
    const startTime = Date.now()
    
    for (let i = 1; i <= 5; i++) {
      const promise = (async (index) => {
        const updateStart = Date.now()
        
        // 현재 조회수 조회
        const { data: currentPost, error: fetchError } = await supabase
          .from('posts')
          .select('view_count')
          .eq('id', testPostId)
          .single()
        
        if (fetchError) {
          console.log(`${index}번째 조회 실패:`, fetchError.message)
          return { index, success: false, error: fetchError.message }
        }
        
        const newViewCount = (currentPost.view_count || 0) + 1
        
        // 업데이트 시도
        const { error: updateError } = await supabase
          .from('posts')
          .update({ view_count: newViewCount })
          .eq('id', testPostId)
          .eq('is_deleted', false)
        
        const updateTime = Date.now() - updateStart
        
        if (updateError) {
          console.log(`${index}번째 업데이트 실패:`, updateError.message)
          return { index, success: false, error: updateError.message, time: updateTime }
        }
        
        console.log(`${index}번째 업데이트: ${currentPost.view_count} → ${newViewCount} (${updateTime}ms)`)
        return { index, success: true, oldCount: currentPost.view_count, newCount: newViewCount, time: updateTime }
      })(i)
      
      updatePromises.push(promise)
      
      // 100ms 간격으로 실행
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const results = await Promise.all(updatePromises)
    const totalTime = Date.now() - startTime
    
    console.log(`\n총 실행 시간: ${totalTime}ms`)
    console.log(`성공한 업데이트: ${results.filter(r => r.success).length}/5`)
    console.log(`실패한 업데이트: ${results.filter(r => !r.success).length}/5`)
    
    // 3. 최종 상태 확인
    console.log('\n3. 최종 조회수 확인')
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
    
    const { data: finalPost, error: finalError } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', testPostId)
      .single()
    
    if (!finalError && finalPost) {
      console.log(`최종 조회수: ${finalPost.view_count}`)
      console.log(`예상 조회수: ${initialPost.view_count + results.filter(r => r.success).length}`)
      console.log(`실제 증가량: ${finalPost.view_count - initialPost.view_count}`)
      
      const expectedIncrease = results.filter(r => r.success).length
      const actualIncrease = finalPost.view_count - initialPost.view_count
      
      if (actualIncrease === expectedIncrease) {
        console.log('✅ 조회수가 정확히 증가했습니다!')
      } else if (actualIncrease === 0) {
        console.log('❌ 조회수가 전혀 증가하지 않았습니다. (RLS 정책 문제)')
      } else {
        console.log('⚠️ 조회수가 예상과 다르게 증가했습니다. (동시성 문제 가능)')
      }
    }
    
    // 4. 브라우저에서의 실시간 업데이트 시뮬레이션
    console.log('\n4. 브라우저 실시간 업데이트 시뮬레이션')
    
    // ViewCounter 컴포넌트의 로직 시뮬레이션
    const simulateViewCounter = async () => {
      console.log('ViewCounter 마운트 시뮬레이션...')
      
      // 초기 조회수
      const { data: post } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', testPostId)
        .single()
      
      const initialViewCount = post.view_count
      console.log(`초기 조회수: ${initialViewCount}`)
      
      // 낙관적 업데이트 (UI에서 먼저 증가)
      const optimisticViewCount = initialViewCount + 1
      console.log(`낙관적 업데이트: ${optimisticViewCount}`)
      
      // 백엔드 업데이트 시도
      const newViewCount = (initialViewCount || 0) + 1
      const { error: updateError } = await supabase
        .from('posts')
        .update({ view_count: newViewCount })
        .eq('id', testPostId)
        .eq('is_deleted', false)
      
      if (updateError) {
        console.log('백엔드 업데이트 실패, 원래 값으로 롤백:', initialViewCount)
        return initialViewCount
      } else {
        console.log('백엔드 업데이트 성공')
        
        // 실제 값 확인
        const { data: updatedPost } = await supabase
          .from('posts')
          .select('view_count')
          .eq('id', testPostId)
          .single()
        
        console.log(`실제 조회수: ${updatedPost.view_count}`)
        return updatedPost.view_count
      }
    }
    
    await simulateViewCounter()
    
    // 5. 문제 진단 및 해결 방안
    console.log('\n=== 문제 진단 및 해결 방안 ===')
    
    if (finalPost && finalPost.view_count === initialPost.view_count) {
      console.log('🔍 문제: 조회수가 데이터베이스에 저장되지 않음')
      console.log('📋 가능한 원인:')
      console.log('  1. Supabase RLS 정책이 UPDATE를 차단')
      console.log('  2. Service Role Key 없음')
      console.log('  3. 테이블 권한 문제')
      console.log('')
      console.log('💡 해결 방안:')
      console.log('  1. .env.local에 SUPABASE_SERVICE_ROLE_KEY 추가')
      console.log('  2. posts 테이블의 RLS 정책 수정')
      console.log('  3. 클라이언트 사이드 캐싱 구현')
      console.log('  4. 별도 조회 로그 테이블 사용')
    } else {
      console.log('✅ 조회수가 정상적으로 저장되고 있습니다.')
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error)
  }
}

testRealtimeViewCount()