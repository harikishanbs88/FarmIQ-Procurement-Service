@echo off
echo Starting FarmIQ Procurement Service...
echo.

rem Start API Server on Port 5000
start "FarmIQ API Server (Port 5000)" cmd /k "pnpm.cmd --filter @workspace/api-server run dev"

rem Start Frontend on Port 3000
start "FarmIQ Frontend (Port 3000)" cmd /k "pnpm.cmd --filter farmiq run dev"

echo FarmIQ services have been started!
echo - Frontend: http://localhost:3000
echo - API Server: http://localhost:5000
echo.
pause
