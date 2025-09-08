@echo off
title Start Both Backend and Frontend
color 0A

echo.
echo ========================================
echo    STARTING BOTH BACKEND AND FRONTEND
echo ========================================
echo.

cd /d "%~dp0"

echo [%date% %time%] Starting Backend...
start "Backend" cmd /k "cd backend && start_simple.bat"

echo [%date% %time%] Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo [%date% %time%] Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    BOTH SERVICES STARTED
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
