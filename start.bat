@echo off
echo ========================================
echo  SafeCity - Starting All Services
echo ========================================
echo.

echo [1/3] Starting ML Service (Python FastAPI)...
start "SafeCity ML Service" cmd /k "cd ml && python main.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend (Node.js + Express)...
start "SafeCity Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (React + Vite)...
start "SafeCity Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  All Services Started!
echo ========================================
echo.
echo ML Service:  http://localhost:8000
echo Backend:     http://localhost:5000
echo Frontend:    http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
