@echo off
echo ========================================
echo ClearPitch Installation Script
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
echo npm version:
npm --version
echo.

REM Install backend dependencies
echo ========================================
echo Installing Backend Dependencies...
echo ========================================
cd backend
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and add your GEMINI_API_KEY
    echo Get your API key from: https://makersuite.google.com/app/apikey
    echo.
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
cd ..
echo.

REM Install frontend dependencies
echo ========================================
echo Installing Frontend Dependencies...
echo ========================================
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env and add your GEMINI_API_KEY
echo    Get it from: https://makersuite.google.com/app/apikey
echo.
echo 2. Run start-clearpitch.bat to start the application
echo    OR manually:
echo    - Terminal 1: cd backend ^&^& npm start
echo    - Terminal 2: cd frontend ^&^& npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
pause
