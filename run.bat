@echo off
title Project Eleven: Agentic Football Arena - Launcher
color 0A

:: Ensure working directory is the script directory
cd /d "%~dp0"

echo =====================================================================
echo           PROJECT ELEVEN: AGENTIC FOOTBALL ARENA
echo =====================================================================
echo.

:: 1. Check for node.js installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: 2. Check dependencies
if not exist "node_modules" (
    echo [INFO] First time run detected. Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: 3. Build shared packages if not present
if not exist "packages\shared\dist" (
    echo [INFO] Building shared types package...
    call npm run build -w packages/shared
)

echo.
echo [1/3] Starting Authoritative Match Server (Port 3001)...
start "Project Eleven - Backend Server (Port 3001)" cmd /k "npm run dev:server"

echo [2/3] Waiting for server initialization...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Web Client with Three.js Arena (Port 5173)...
start "Project Eleven - Web Client (Port 5173)" cmd /k "npm run dev:web"

timeout /t 2 /nobreak >nul

echo.
echo [INFO] Launching game in default browser...
start http://localhost:5173

echo.
echo =====================================================================
echo  Game is running!
echo   - Web Client:     http://localhost:5173
echo   - Match Server:   http://localhost:3001
echo   - Health Check:   http://localhost:3001/health
echo =====================================================================
echo.
echo You can close this launcher window anytime.
echo The server and web windows will remain running in background.
echo.
pause
