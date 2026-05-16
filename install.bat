@echo off
echo ========================================
echo  SafeCity - Installing Dependencies
echo ========================================
echo.

echo [1/3] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo [2/3] Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo [3/3] Installing ML Service Dependencies...
cd ml
pip install -r requirements.txt
cd ..

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Run 'start.bat' to launch all services
echo.
pause
