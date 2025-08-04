const { createClient } = require('@supabase/supabase-js')

// Supabase 설정 (직접 설정)
const supabaseUrl = 'https://kgvafgztjaqafznagzlz.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndmFmZ3p0amFxYWZ6bmFnemx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDEzMDksImV4cCI6MjA2NjQxNzMwOX0.7Pp981t2Wp4lcvBt89XR971D5HsVsr8IIfnVRrf370c'

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserProfiles() {
  try {
    console.log('=== user_profiles 테이블 조회 ===\n')
    
    // 모든 user_profiles 조회
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('프로필 조회 오류:', error)
      return
    }
    
    console.log(`총 ${profiles.length}개의 프로필이 있습니다.\n`)
    
    if (profiles.length === 0) {
      console.log('프로필이 없습니다.')
    } else {
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. 프로필 정보:`)
        console.log(`   ID: ${profile.id}`)
        console.log(`   닉네임: ${profile.nickname || '(없음)'}`)
        console.log(`   표시명: ${profile.display_name || '(없음)'}`)
        console.log(`   생성일: ${profile.created_at}`)
        console.log(`   수정일: ${profile.updated_at}`)
        console.log('')
      })
    }
    
    // auth.users와 비교
    console.log('=== auth.users와 비교 ===\n')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('사용자 조회 오류:', usersError)
    } else {
      console.log(`총 ${users.users.length}명의 사용자가 있습니다.`)
      
      const profileIds = new Set(profiles.map(p => p.id))
      const missingProfiles = users.users.filter(user => !profileIds.has(user.id))
      
      if (missingProfiles.length > 0) {
        console.log(`\n프로필이 없는 사용자 ${missingProfiles.length}명:`)
        missingProfiles.forEach((user, index) => {
          console.log(`${index + 1}. ${user.id} (${user.email || '이메일 없음'}) - 생성일: ${user.created_at}`)
        })
      } else {
        console.log('\n모든 사용자에게 프로필이 있습니다.')
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error)
  }
}

checkUserProfiles()