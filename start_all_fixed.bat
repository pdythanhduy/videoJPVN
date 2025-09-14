@echo off
echo Starting Video Review Tool...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && python main_simple.py"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5174
echo.
pause
