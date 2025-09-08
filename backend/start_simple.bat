@echo off
title Backend Simple Start
color 0A

:start
cls
echo.
echo ========================================
echo    BACKEND SIMPLE START
echo ========================================
echo.
echo Starting backend...
echo.

cd /d "%~dp0"

REM Kill existing Python processes on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Wait a bit
timeout /t 2 /nobreak >nul

REM Start backend
echo [%date% %time%] Starting backend...
python main_simple.py

REM If we get here, backend stopped
echo.
echo [%date% %time%] Backend stopped.
echo Restarting in 3 seconds...
echo Press Ctrl+C to stop completely
timeout /t 3 /nobreak >nul

goto start
