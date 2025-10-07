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

async function testAllPagesViewCount() {
  const testPostId = 'af8dfc9a-32fe-4acb-b754-fe316911a708'
  
  try {
    console.log('=== 모든 페이지에서 조회수 일치 여부 확인 ===')
    
    // 1. 게시물 상세 페이지 조회수 (ViewCounter 컴포넌트)
    console.log('\n1. 게시물 상세 페이지 조회수 확인')
    const { data: detailPost, error: detailError } = await supabase
      .from('posts')
      .select('id, title, view_count, created_at, board_id')
      .eq('id', testPostId)
      .eq('is_deleted', false)
      .single()
    
    if (detailError) {
      console.error('상세 페이지 조회 오류:', detailError)
      return
    }
    
    console.log(`게시물 ID: ${detailPost.id}`)
    console.log(`제목: ${detailPost.title}`)
    console.log(`상세 페이지 조회수: ${detailPost.view_count}`)
    console.log(`게시판 ID: ${detailPost.board_id}`)
    
    // 2. 게시물 목록 페이지 조회수 (게시판별)
    console.log('\n2. 게시물 목록 페이지 조회수 확인')
    const { data: listPosts, error: listError } = await supabase
      .from('posts')
      .select('id, title, view_count, comment_count, created_at')
      .eq('board_id', detailPost.board_id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (listError) {
      console.error('목록 페이지 조회 오류:', listError)
      return
    }
    
    const targetPostInList = listPosts.find(post => post.id === testPostId)
    
    if (targetPostInList) {
      console.log(`목록 페이지 조회수: ${targetPostInList.view_count}`)
      console.log(`목록 페이지 댓글수: ${targetPostInList.comment_count}`)
    } else {
      console.log('❌ 목록에서 해당 게시물을 찾을 수 없습니다.')
    }
    
    // 3. 홈페이지 최신 게시물 조회수
    console.log('\n3. 홈페이지 최신 게시물 조회수 확인')
    const { data: homePosts, error: homeError } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        view_count, 
        comment_count, 
        created_at,
        boards!inner(name)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (homeError) {
      console.error('홈페이지 조회 오류:', homeError)
    } else {
      const targetPostInHome = homePosts.find(post => post.id === testPostId)
      
      if (targetPostInHome) {
        console.log(`홈페이지 조회수: ${targetPostInHome.view_count}`)
        console.log(`홈페이지 댓글수: ${targetPostInHome.comment_count}`)
      } else {
        console.log('ℹ️ 홈페이지 최신 게시물 20개에 해당 게시물이 없습니다.')
      }
    }
    
    // 4. 검색 결과 조회수
    console.log('\n4. 검색 결과 조회수 확인')
    const searchKeyword = detailPost.title.split(' ')[0] // 제목의 첫 번째 단어로 검색
    
    const { data: searchPosts, error: searchError } = await supabase
      .from('posts')
      .select('id, title, view_count, comment_count, created_at')
      .ilike('title', `%${searchKeyword}%`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (searchError) {
      console.error('검색 조회 오류:', searchError)
    } else {
      const targetPostInSearch = searchPosts.find(post => post.id === testPostId)
      
      if (targetPostInSearch) {
        console.log(`검색 결과 조회수: ${targetPostInSearch.view_count}`)
        console.log(`검색 키워드: "${searchKeyword}"`)
      } else {
        console.log(`ℹ️ 검색 결과에 해당 게시물이 없습니다. (키워드: "${searchKeyword}")`)
      }
    }
    
    // 5. 조회수 일치 여부 분석
    console.log('\n=== 조회수 일치 여부 분석 ===')
    
    const viewCounts = {
      detail: detailPost.view_count,
      list: targetPostInList ? targetPostInList.view_count : null,
      home: homePosts.find(post => post.id === testPostId)?.view_count || null,
      search: searchPosts.find(post => post.id === testPostId)?.view_count || null
    }
    
    console.log('각 페이지별 조회수:')
    console.log(`  상세 페이지: ${viewCounts.detail}`)
    console.log(`  목록 페이지: ${viewCounts.list || 'N/A'}`)
    console.log(`  홈페이지: ${viewCounts.home || 'N/A'}`)
    console.log(`  검색 결과: ${viewCounts.search || 'N/A'}`)
    
    // 일치 여부 확인
    const availableCounts = Object.values(viewCounts).filter(count => count !== null)
    const uniqueCounts = [...new Set(availableCounts)]
    
    if (uniqueCounts.length === 1) {
      console.log('✅ 모든 페이지에서 조회수가 일치합니다!')
    } else {
      console.log('❌ 페이지별로 조회수가 다릅니다.')
      console.log(`고유한 조회수 값: ${uniqueCounts.join(', ')}`)
    }
    
    // 6. 캐싱 문제 확인
    console.log('\n6. 캐싱 문제 확인')
    
    // 짧은 간격으로 여러 번 조회하여 캐싱 여부 확인
    const cacheTests = []
    
    for (let i = 1; i <= 3; i++) {
      const startTime = Date.now()
      
      const { data: cacheTestPost, error: cacheError } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', testPostId)
        .single()
      
      const responseTime = Date.now() - startTime
      
      if (!cacheError && cacheTestPost) {
        cacheTests.push({
          attempt: i,
          viewCount: cacheTestPost.view_count,
          responseTime: responseTime
        })
        
        console.log(`${i}번째 조회: ${cacheTestPost.view_count} (${responseTime}ms)`)
      }
      
      // 100ms 대기
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const allSameCount = cacheTests.every(test => test.viewCount === cacheTests[0].viewCount)
    const avgResponseTime = cacheTests.reduce((sum, test) => sum + test.responseTime, 0) / cacheTests.length
    
    console.log(`평균 응답 시간: ${avgResponseTime.toFixed(1)}ms`)
    
    if (allSameCount) {
      console.log('✅ 연속 조회 시 일관된 결과를 반환합니다.')
    } else {
      console.log('⚠️ 연속 조회 시 결과가 다릅니다. (동시성 문제 가능)')
    }
    
    // 7. 문제 진단 및 해결 방안
    console.log('\n=== 문제 진단 및 해결 방안 ===')
    
    if (uniqueCounts.length > 1) {
      console.log('🔍 문제: 페이지별 조회수 불일치')
      console.log('📋 가능한 원인:')
      console.log('  1. 브라우저 캐싱')
      console.log('  2. Next.js 서버 사이드 캐싱')
      console.log('  3. Supabase 클라이언트 캐싱')
      console.log('  4. 데이터베이스 트랜잭션 지연')
      console.log('')
      console.log('💡 해결 방안:')
      console.log('  1. 캐시 무효화 (Cache-Control 헤더)')
      console.log('  2. 실시간 구독 (Supabase Realtime)')
      console.log('  3. 클라이언트 상태 관리 (Zustand/Redux)')
      console.log('  4. 낙관적 업데이트 구현')
    } else {
      console.log('✅ 모든 페이지에서 조회수가 일치합니다.')
      console.log('ℹ️ 하지만 조회수 증가 기능은 여전히 RLS 정책 문제로 작동하지 않습니다.')
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error)
  }
}

testAllPagesViewCount()