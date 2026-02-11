@echo off
echo ========================================
echo Starting JaySim Application
echo ========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Start Backend
echo Starting Backend Server...
start cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend Server...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo JaySim is starting!
echo ========================================
echo.
echo Two new windows will open:
echo   1. Backend server (port 5000)
echo   2. Frontend server (port 3000)
echo.
echo Your browser will open automatically.
echo If not, visit: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
