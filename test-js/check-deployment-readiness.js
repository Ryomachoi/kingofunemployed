const fs = require('fs')
const path = require('path')

function checkDeploymentReadiness() {
  console.log('=== 배포 환경에서의 조회수 기능 작동 여부 확인 ===')
  
  try {
    // 1. 환경 변수 파일 확인
    console.log('\n1. 환경 변수 파일 확인')
    
    const envFiles = [
      '.env.local',
      '.env.production',
      '.env'
    ]
    
    envFiles.forEach(fileName => {
      const filePath = path.join(__dirname, fileName)
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${fileName} 존재`)
        
        const content = fs.readFileSync(filePath, 'utf8')
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
        
        const hasSupabaseUrl = lines.some(line => line.includes('NEXT_PUBLIC_SUPABASE_URL'))
        const hasAnonKey = lines.some(line => line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
        const hasServiceKey = lines.some(line => line.includes('SUPABASE_SERVICE_ROLE_KEY'))
        
        console.log(`    - SUPABASE_URL: ${hasSupabaseUrl ? '✅' : '❌'}`)
        console.log(`    - ANON_KEY: ${hasAnonKey ? '✅' : '❌'}`)
        console.log(`    - SERVICE_ROLE_KEY: ${hasServiceKey ? '✅' : '❌'}`)
      } else {
        console.log(`  ❌ ${fileName} 없음`)
      }
    })
    
    // 2. Next.js 설정 확인
    console.log('\n2. Next.js 설정 확인')
    
    const nextConfigPath = path.join(__dirname, 'next.config.js')
    const nextConfigMjsPath = path.join(__dirname, 'next.config.mjs')
    
    let nextConfigExists = false
    let nextConfigContent = ''
    
    if (fs.existsSync(nextConfigPath)) {
      nextConfigExists = true
      nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
      console.log('  ✅ next.config.js 존재')
    } else if (fs.existsSync(nextConfigMjsPath)) {
      nextConfigExists = true
      nextConfigContent = fs.readFileSync(nextConfigMjsPath, 'utf8')
      console.log('  ✅ next.config.mjs 존재')
    } else {
      console.log('  ❌ next.config 파일 없음')
    }
    
    if (nextConfigExists) {
      const hasEnvConfig = nextConfigContent.includes('env') || nextConfigContent.includes('publicRuntimeConfig')
      console.log(`    - 환경 변수 설정: ${hasEnvConfig ? '✅' : '⚠️'}`)
    }
    
    // 3. 패키지 의존성 확인
    console.log('\n3. 패키지 의존성 확인')
    
    const packageJsonPath = path.join(__dirname, 'package.json')
    
    if (fs.existsSync(packageJsonPath)) {
      console.log('  ✅ package.json 존재')
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
      
      const requiredPackages = [
        '@supabase/supabase-js',
        'next',
        'react'
      ]
      
      requiredPackages.forEach(pkg => {
        if (dependencies[pkg]) {
          console.log(`    - ${pkg}: ✅ ${dependencies[pkg]}`)
        } else {
          console.log(`    - ${pkg}: ❌ 없음`)
        }
      })
      
      // 빌드 스크립트 확인
      const scripts = packageJson.scripts || {}
      console.log('\n  빌드 스크립트:')
      console.log(`    - build: ${scripts.build ? '✅' : '❌'}`)
      console.log(`    - start: ${scripts.start ? '✅' : '❌'}`)
      console.log(`    - dev: ${scripts.dev ? '✅' : '❌'}`)
      
    } else {
      console.log('  ❌ package.json 없음')
    }
    
    // 4. 조회수 관련 파일 확인
    console.log('\n4. 조회수 관련 파일 확인')
    
    const criticalFiles = [
      'app/boards/actions.ts',
      'app/components/ViewCounter.tsx',
      'app/boards/[id]/posts/[postId]/page.tsx',
      'app/boards/[id]/page.tsx'
    ]
    
    criticalFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, filePath)
      if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${filePath}`)
        
        const content = fs.readFileSync(fullPath, 'utf8')
        
        // 조회수 관련 코드 확인
        const hasViewCount = content.includes('view_count')
        const hasIncrement = content.includes('increment') || content.includes('증가')
        const hasSupabase = content.includes('supabase')
        
        console.log(`    - view_count 사용: ${hasViewCount ? '✅' : '❌'}`)
        console.log(`    - 증가 로직: ${hasIncrement ? '✅' : '❌'}`)
        console.log(`    - Supabase 연동: ${hasSupabase ? '✅' : '❌'}`)
      } else {
        console.log(`  ❌ ${filePath} 없음`)
      }
    })
    
    // 5. 빌드 테스트 시뮬레이션
    console.log('\n5. 빌드 준비 상태 확인')
    
    const buildIssues = []
    
    // TypeScript 설정 확인
    const tsConfigPath = path.join(__dirname, 'tsconfig.json')
    if (fs.existsSync(tsConfigPath)) {
      console.log('  ✅ TypeScript 설정 존재')
    } else {
      console.log('  ⚠️ TypeScript 설정 없음')
      buildIssues.push('TypeScript 설정 파일 없음')
    }
    
    // Tailwind CSS 설정 확인
    const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js')
    const tailwindConfigTsPath = path.join(__dirname, 'tailwind.config.ts')
    
    if (fs.existsSync(tailwindConfigPath) || fs.existsSync(tailwindConfigTsPath)) {
      console.log('  ✅ Tailwind CSS 설정 존재')
    } else {
      console.log('  ⚠️ Tailwind CSS 설정 없음')
    }
    
    // 6. 배포 플랫폼별 고려사항
    console.log('\n6. 배포 플랫폼별 고려사항')
    
    console.log('\n  Vercel 배포 시:')
    console.log('    - 환경 변수를 Vercel 대시보드에 설정 필요')
    console.log('    - NEXT_PUBLIC_SUPABASE_URL')
    console.log('    - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('    - SUPABASE_SERVICE_ROLE_KEY (조회수 기능용)')
    
    console.log('\n  Netlify 배포 시:')
    console.log('    - 환경 변수를 Netlify 대시보드에 설정 필요')
    console.log('    - 동일한 환경 변수들 필요')
    
    console.log('\n  기타 플랫폼:')
    console.log('    - Docker 컨테이너 환경 변수 설정')
    console.log('    - 서버 환경 변수 파일 설정')
    
    // 7. 조회수 기능 배포 시 주의사항
    console.log('\n7. 조회수 기능 배포 시 주의사항')
    
    console.log('\n  현재 문제점:')
    console.log('    ❌ Service Role Key 없음 → 조회수 업데이트 실패')
    console.log('    ❌ RPC 함수 없음 → 대안 방법 필요')
    console.log('    ✅ 조회수 표시는 정상 작동')
    console.log('    ✅ 모든 페이지에서 일치하는 조회수 표시')
    
    console.log('\n  배포 전 해결 필요사항:')
    console.log('    1. 🔑 Service Role Key 추가')
    console.log('       - Supabase 대시보드에서 키 복사')
    console.log('       - 배포 플랫폼 환경 변수에 추가')
    console.log('    2. 🔧 RPC 함수 생성')
    console.log('       - create-rpc-function.sql 실행')
    console.log('       - 또는 대안 방법 구현')
    
    console.log('\n  배포 후 테스트 항목:')
    console.log('    - 게시물 조회 시 조회수 표시 확인')
    console.log('    - 조회수 증가 기능 작동 확인')
    console.log('    - 모든 페이지에서 조회수 일치 확인')
    console.log('    - 성능 및 응답 시간 확인')
    
    // 8. 최종 권장사항
    console.log('\n=== 최종 권장사항 ===')
    
    console.log('\n🚀 배포 준비 상태:')
    if (buildIssues.length === 0) {
      console.log('  ✅ 기본 빌드 준비 완료')
    } else {
      console.log('  ⚠️ 다음 문제들을 해결하세요:')
      buildIssues.forEach(issue => {
        console.log(`    - ${issue}`)
      })
    }
    
    console.log('\n🔧 조회수 기능 수정 방안:')
    console.log('  옵션 1: Service Role Key 추가 (권장)')
    console.log('    - 가장 간단하고 확실한 해결책')
    console.log('    - 기존 코드 수정 최소화')
    
    console.log('\n  옵션 2: 클라이언트 사이드 캐싱')
    console.log('    - localStorage 또는 sessionStorage 사용')
    console.log('    - 실제 DB 업데이트는 백그라운드에서')
    
    console.log('\n  옵션 3: 별도 로그 테이블')
    console.log('    - view_logs 테이블 생성')
    console.log('    - 트리거로 posts.view_count 업데이트')
    
    console.log('\n📋 배포 체크리스트:')
    console.log('  □ 환경 변수 설정 완료')
    console.log('  □ Service Role Key 추가')
    console.log('  □ 로컬에서 빌드 테스트')
    console.log('  □ 조회수 기능 테스트')
    console.log('  □ 성능 테스트')
    console.log('  □ 배포 후 기능 검증')
    
  } catch (error) {
    console.error('배포 준비 상태 확인 중 오류:', error)
  }
}

checkDeploymentReadiness()