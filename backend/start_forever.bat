@echo off
title Backend Auto Manager
echo.
echo ========================================
echo    BACKEND AUTO MANAGER
echo ========================================
echo.
echo Starting backend with auto-restart...
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"

:restart
echo [%date% %time%] Starting backend...
python auto_start.py

echo.
echo [%date% %time%] Backend stopped. Restarting in 5 seconds...
echo Press Ctrl+C to stop completely
timeout /t 5 /nobreak >nul
goto restart
