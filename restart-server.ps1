# 서버 재시작 스크립트
# 기존 Next.js 프로세스를 종료하고 동일한 포트에서 재시작

# 포트 3009에서 실행 중인 프로세스 찾기 및 종료
$processes = Get-NetTCPConnection -LocalPort 3009 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "Stopping process with PID: $pid"
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Next.js 개발 서버 시작
Write-Host "Starting Next.js development server on port 3009..."
npx next dev --port 3009