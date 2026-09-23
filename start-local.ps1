# FarmIQ Procurement Service Local Launcher
Write-Host "Starting FarmIQ Procurement Service..." -ForegroundColor Green

# Start API Server on Port 5000 in background
$apiProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "pnpm.cmd --filter @workspace/api-server run dev" -PassThru -WindowStyle Normal

# Start Frontend on Port 3000 in background
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "pnpm.cmd --filter farmiq run dev" -PassThru -WindowStyle Normal

Write-Host "FarmIQ Services Launched:" -ForegroundColor Cyan
Write-Host "  Frontend   : http://localhost:3000" -ForegroundColor Yellow
Write-Host "  API Server : http://localhost:5000" -ForegroundColor Yellow
