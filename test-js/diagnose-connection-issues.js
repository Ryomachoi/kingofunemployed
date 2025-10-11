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

async function diagnoseConnectionIssues() {
  console.log('=== 프론트엔드-백엔드-Supabase 연결 문제 진단 ===')
  
  try {
    // 1. 환경 변수 확인
    console.log('\n1. 환경 변수 확인')
    const env = loadEnvLocal()
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    const optionalVars = [
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    console.log('필수 환경 변수:')
    requiredVars.forEach(varName => {
      const value = env[varName]
      if (value) {
        console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`)
      } else {
        console.log(`  ❌ ${varName}: 없음`)
      }
    })
    
    console.log('\n선택적 환경 변수:')
    optionalVars.forEach(varName => {
      const value = env[varName]
      if (value) {
        console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`)
      } else {
        console.log(`  ⚠️ ${varName}: 없음 (조회수 업데이트 실패 원인)`)
      }
    })
    
    // 2. Supabase 클라이언트 연결 테스트
    console.log('\n2. Supabase 클라이언트 연결 테스트')
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Supabase 환경 변수가 설정되지 않았습니다.')
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // 기본 연결 테스트
    const startTime = Date.now()
    const { data: healthCheck, error: healthError } = await supabase
      .from('posts')
      .select('count')
      .limit(1)
    
    const connectionTime = Date.now() - startTime
    
    if (healthError) {
      console.log(`❌ Supabase 연결 실패: ${healthError.message}`)
    } else {
      console.log(`✅ Supabase 연결 성공 (${connectionTime}ms)`)
    }
    
    // 3. 프론트엔드 API 라우트 테스트 시뮬레이션
    console.log('\n3. 프론트엔드 API 라우트 테스트 시뮬레이션')
    
    const testPostId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
    
    // ViewCounter 컴포넌트의 로직 시뮬레이션
    console.log('ViewCounter 컴포넌트 로직 시뮬레이션:')
    
    try {
      // 1단계: 초기 조회수 가져오기
      const { data: initialPost, error: fetchError } = await supabase
        .from('posts')
        .select('view_count, title')
        .eq('id', testPostId)
        .eq('is_deleted', false)
        .single()
      
      if (fetchError) {
        console.log(`  ❌ 초기 조회 실패: ${fetchError.message}`)
        return
      }
      
      console.log(`  ✅ 초기 조회 성공: ${initialPost.title} (조회수: ${initialPost.view_count})`)
      
      // 2단계: 조회수 증가 시도 (actions.ts의 incrementPostViewCount 함수 시뮬레이션)
      console.log('\n  조회수 증가 시도:')
      
      const newViewCount = (initialPost.view_count || 0) + 1
      
      const updateStart = Date.now()
      const { error: updateError } = await supabase
        .from('posts')
        .update({ view_count: newViewCount })
        .eq('id', testPostId)
        .eq('is_deleted', false)
      
      const updateTime = Date.now() - updateStart
      
      if (updateError) {
        console.log(`  ❌ 조회수 업데이트 실패 (${updateTime}ms): ${updateError.message}`)
        console.log(`  📋 오류 코드: ${updateError.code}`)
        console.log(`  📋 오류 세부사항: ${updateError.details || 'N/A'}`)
        console.log(`  📋 오류 힌트: ${updateError.hint || 'N/A'}`)
      } else {
        console.log(`  ✅ 조회수 업데이트 성공 (${updateTime}ms)`)
        
        // 3단계: 업데이트 확인
        const { data: updatedPost, error: verifyError } = await supabase
          .from('posts')
          .select('view_count')
          .eq('id', testPostId)
          .single()
        
        if (!verifyError && updatedPost) {
          console.log(`  ✅ 업데이트 확인: ${initialPost.view_count} → ${updatedPost.view_count}`)
          
          if (updatedPost.view_count === newViewCount) {
            console.log('  🎉 조회수가 정상적으로 증가했습니다!')
          } else {
            console.log('  ⚠️ 조회수가 예상과 다릅니다.')
          }
        }
      }
      
    } catch (error) {
      console.log(`  ❌ 시뮬레이션 중 오류: ${error.message}`)
    }
    
    // 4. RPC 함수 테스트
    console.log('\n4. RPC 함수 테스트')
    
    try {
      const rpcStart = Date.now()
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('increment_post_view_count', { post_id: testPostId })
      
      const rpcTime = Date.now() - rpcStart
      
      if (rpcError) {
        console.log(`❌ RPC 함수 실행 실패 (${rpcTime}ms): ${rpcError.message}`)
        console.log(`📋 RPC 오류 코드: ${rpcError.code}`)
      } else {
        console.log(`✅ RPC 함수 실행 성공 (${rpcTime}ms)`)
        console.log(`📋 반환값: ${rpcResult}`)
      }
    } catch (error) {
      console.log(`❌ RPC 테스트 중 오류: ${error.message}`)
    }
    
    // 5. 네트워크 및 성능 테스트
    console.log('\n5. 네트워크 및 성능 테스트')
    
    const performanceTests = []
    
    for (let i = 1; i <= 5; i++) {
      const testStart = Date.now()
      
      const { data: perfTest, error: perfError } = await supabase
        .from('posts')
        .select('id, view_count')
        .eq('id', testPostId)
        .single()
      
      const testTime = Date.now() - testStart
      
      performanceTests.push({
        attempt: i,
        success: !perfError,
        time: testTime,
        error: perfError?.message
      })
      
      console.log(`  ${i}번째 테스트: ${perfError ? '실패' : '성공'} (${testTime}ms)`)
      
      // 100ms 대기
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const successfulTests = performanceTests.filter(test => test.success)
    const avgTime = successfulTests.reduce((sum, test) => sum + test.time, 0) / successfulTests.length
    
    console.log(`\n성공률: ${successfulTests.length}/5 (${(successfulTests.length / 5 * 100).toFixed(1)}%)`)
    console.log(`평균 응답 시간: ${avgTime.toFixed(1)}ms`)
    
    // 6. 문제 진단 및 해결 방안
    console.log('\n=== 연결 문제 진단 결과 ===')
    
    const hasServiceRoleKey = !!env.SUPABASE_SERVICE_ROLE_KEY
    const connectionSuccessful = !healthError
    const performanceGood = avgTime < 1000
    
    console.log('\n🔍 진단 결과:')
    console.log(`  Supabase 연결: ${connectionSuccessful ? '✅ 정상' : '❌ 실패'}`)
    console.log(`  Service Role Key: ${hasServiceRoleKey ? '✅ 있음' : '❌ 없음'}`)
    console.log(`  네트워크 성능: ${performanceGood ? '✅ 양호' : '⚠️ 느림'}`)
    
    console.log('\n💡 해결 방안:')
    
    if (!hasServiceRoleKey) {
      console.log('  1. 🔑 Service Role Key 추가')
      console.log('     - Supabase 대시보드 → Settings → API')
      console.log('     - service_role key 복사')
      console.log('     - .env.local에 SUPABASE_SERVICE_ROLE_KEY 추가')
    }
    
    if (!connectionSuccessful) {
      console.log('  2. 🌐 네트워크 연결 확인')
      console.log('     - 인터넷 연결 상태 확인')
      console.log('     - Supabase URL 정확성 확인')
      console.log('     - 방화벽 설정 확인')
    }
    
    if (!performanceGood) {
      console.log('  3. ⚡ 성능 최적화')
      console.log('     - 네트워크 상태 확인')
      console.log('     - Supabase 리전 확인')
      console.log('     - 쿼리 최적화 고려')
    }
    
    console.log('\n  4. 🔧 대안 해결책:')
    console.log('     - 클라이언트 사이드 캐싱 구현')
    console.log('     - 낙관적 업데이트 사용')
    console.log('     - 별도 조회 로그 테이블 생성')
    console.log('     - 서버 액션 대신 API 라우트 사용')
    
  } catch (error) {
    console.error('진단 중 오류:', error)
  }
}

diagnoseConnectionIssues()