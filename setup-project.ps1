# 킹오브실업자 프로젝트 설정 스크립트
# PowerShell에서 실행: .\setup-project.ps1

Write-Host "🚀 킹오브실업자 프로젝트 설정을 시작합니다..." -ForegroundColor Green

# 1. Node.js 버전 확인
Write-Host "\n📋 Node.js 버전 확인 중..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "현재 Node.js 버전: $nodeVersion" -ForegroundColor Cyan

if ($nodeVersion -match "v(\d+)\." -and [int]$matches[1] -lt 18) {
    Write-Host "⚠️  경고: Node.js 18 이상을 권장합니다. 현재 버전: $nodeVersion" -ForegroundColor Red
    Write-Host "Node.js 최신 버전을 https://nodejs.org 에서 다운로드하세요." -ForegroundColor Red
}

# 2. 의존성 설치
Write-Host "\n📦 의존성 설치 중..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install 실패. 다시 시도합니다..." -ForegroundColor Red
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Remove-Item package-lock.json -ErrorAction SilentlyContinue
    npm install
}

# 3. 환경 변수 파일 설정
Write-Host "\n🔧 환경 변수 설정 중..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ .env.local 파일이 생성되었습니다." -ForegroundColor Green
        Write-Host "⚠️  중요: .env.local 파일을 열어서 실제 API 키와 URL을 입력해야 합니다!" -ForegroundColor Red
    } else {
        Write-Host "❌ .env.example 파일을 찾을 수 없습니다." -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env.local 파일이 이미 존재합니다." -ForegroundColor Green
}

# 4. 캐시 정리
Write-Host "\n🧹 캐시 정리 중..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "✅ Next.js 캐시가 정리되었습니다." -ForegroundColor Green

# 5. 설정 완료 안내
Write-Host "\n🎉 프로젝트 설정이 완료되었습니다!" -ForegroundColor Green
Write-Host "\n다음 단계:" -ForegroundColor Cyan
Write-Host "1. .env.local 파일을 열어서 실제 API 키를 입력하세요" -ForegroundColor White
Write-Host "2. 'npm run dev' 명령어로 개발 서버를 시작하세요" -ForegroundColor White
Write-Host "3. 브라우저에서 http://localhost:3000 을 열어보세요" -ForegroundColor White

Write-Host "\n필요한 환경 변수:" -ForegroundColor Cyan
Write-Host "- NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "- NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "- SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "- OPENAI_API_KEY" -ForegroundColor White

Write-Host "\n문제가 발생하면 README.md의 문제 해결 섹션을 참고하세요." -ForegroundColor Yellow