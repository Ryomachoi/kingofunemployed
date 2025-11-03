# 킹오브실업자 프로젝트 일반적인 문제 해결 스크립트
# PowerShell에서 실행: .\fix-common-issues.ps1

Write-Host "🔧 킹오브실업자 프로젝트 문제 해결을 시작합니다..." -ForegroundColor Green

# 1. 프로세스 종료 (포트 충돌 해결)
Write-Host "\n🛑 기존 프로세스 종료 중..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "✅ Node.js 프로세스가 종료되었습니다." -ForegroundColor Green
} else {
    Write-Host "ℹ️  실행 중인 Node.js 프로세스가 없습니다." -ForegroundColor Cyan
}

# 2. 포트 3000 확인 및 해제
Write-Host "\n🔍 포트 3000 사용 중인 프로세스 확인..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000"
if ($port3000) {
    Write-Host "⚠️  포트 3000이 사용 중입니다:" -ForegroundColor Red
    Write-Host $port3000 -ForegroundColor White
    
    # PID 추출 및 프로세스 종료
    $pids = $port3000 | ForEach-Object { ($_ -split "\s+")[-1] } | Sort-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -match "^\d+$") {
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "✅ PID $pid 프로세스가 종료되었습니다." -ForegroundColor Green
            } catch {
                Write-Host "❌ PID $pid 프로세스 종료 실패: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✅ 포트 3000이 사용 가능합니다." -ForegroundColor Green
}

# 3. 캐시 및 임시 파일 정리
Write-Host "\n🧹 캐시 및 임시 파일 정리 중..." -ForegroundColor Yellow

# Next.js 캐시 정리
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "✅ Next.js 캐시 정리 완료" -ForegroundColor Green

# npm 캐시 정리
npm cache clean --force
Write-Host "✅ npm 캐시 정리 완료" -ForegroundColor Green

# 4. node_modules 재설치
Write-Host "\n📦 의존성 재설치 중..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 의존성 재설치 완료" -ForegroundColor Green
} else {
    Write-Host "❌ 의존성 설치 실패" -ForegroundColor Red
    Write-Host "다음을 시도해보세요:" -ForegroundColor Yellow
    Write-Host "1. 인터넷 연결 확인" -ForegroundColor White
    Write-Host "2. npm registry 확인: npm config get registry" -ForegroundColor White
    Write-Host "3. 방화벽/보안 프로그램 확인" -ForegroundColor White
}

# 5. 환경 변수 파일 확인
Write-Host "\n🔧 환경 변수 파일 확인..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local 파일이 존재합니다." -ForegroundColor Green
    
    # 필수 환경 변수 확인
    $envContent = Get-Content ".env.local" -Raw
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY", 
        "SUPABASE_SERVICE_ROLE_KEY",
        "OPENAI_API_KEY"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var=.+") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "⚠️  다음 환경 변수가 설정되지 않았습니다:" -ForegroundColor Red
        $missingVars | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
    } else {
        Write-Host "✅ 모든 필수 환경 변수가 설정되어 있습니다." -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env.local 파일이 없습니다." -ForegroundColor Red
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ .env.example에서 .env.local을 생성했습니다." -ForegroundColor Green
        Write-Host "⚠️  .env.local 파일을 열어서 실제 값을 입력해야 합니다!" -ForegroundColor Red
    }
}

# 6. 완료 메시지
Write-Host "\n🎉 문제 해결 스크립트 실행 완료!" -ForegroundColor Green
Write-Host "\n이제 다음 명령어로 프로젝트를 실행해보세요:" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor White

Write-Host "\n여전히 문제가 발생하면:" -ForegroundColor Yellow
Write-Host "1. README.md 파일의 문제 해결 섹션을 확인하세요" -ForegroundColor White
Write-Host "2. .env.local 파일의 모든 값이 올바른지 확인하세요" -ForegroundColor White
Write-Host "3. Node.js 버전이 18 이상인지 확인하세요" -ForegroundColor White