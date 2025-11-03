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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPostsRLS() {
  try {
    console.log('=== posts 테이블 RLS 정책 확인 ===')
    
    // 1. RLS 활성화 상태 확인
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'posts' })
      .single()
    
    if (rlsError) {
      console.log('RLS 상태 확인 실패, 직접 쿼리 시도...')
      
      // 직접 SQL로 RLS 상태 확인
      const { data: directRLS, error: directError } = await supabase
        .from('pg_class')
        .select('relname, relrowsecurity')
        .eq('relname', 'posts')
        .single()
      
      if (!directError && directRLS) {
        console.log('RLS 활성화 상태:', directRLS.relrowsecurity ? '활성화됨' : '비활성화됨')
      }
    } else {
      console.log('RLS 상태:', rlsStatus)
    }
    
    // 2. 정책 목록 확인
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'posts')
    
    if (policyError) {
      console.error('정책 조회 오류:', policyError)
    } else {
      console.log('\n=== posts 테이블 정책 목록 ===')
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`정책명: ${policy.policyname}`)
          console.log(`명령: ${policy.cmd}`)
          console.log(`조건: ${policy.qual || 'N/A'}`)
          console.log(`체크: ${policy.with_check || 'N/A'}`)
          console.log('---')
        })
      } else {
        console.log('정책이 없습니다.')
      }
    }
    
    // 3. 테이블 권한 확인
    const { data: permissions, error: permError } = await supabase
      .from('information_schema.table_privileges')
      .select('*')
      .eq('table_name', 'posts')
      .limit(10)
    
    if (!permError && permissions) {
      console.log('\n=== posts 테이블 권한 ===')
      permissions.forEach(perm => {
        console.log(`권한: ${perm.privilege_type}, 사용자: ${perm.grantee}`)
      })
    }
    
  } catch (error) {
    console.error('RLS 확인 중 오류:', error)
  }
}

checkPostsRLS()