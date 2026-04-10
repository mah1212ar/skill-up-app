@echo off
echo ========================================================
echo STARTING QA ENGINEERING TESTING SUITE (BACKEND & FRONTEND)
echo ========================================================

echo.
echo Installing Backend Dependancy Packages...
cd backend
call cmd.exe /c "npm install"
echo.
echo [TEST] Executing Jest Test Suite on Express API...
set NODE_ENV=test
call cmd.exe /c "npm run test" > ..\backend_test_output.txt 2>&1
echo Backend testing finalized. Results saved to backend_test_output.txt

cd ..

echo.
echo Installing Frontend Dependancy Packages...
cd frontend
call cmd.exe /c "npm install"
echo.
echo [TEST] Executing Vitest Suite on React Components...
call cmd.exe /c "npm run test" > ..\frontend_test_output.txt 2>&1
echo Frontend testing finalized. Results saved to frontend_test_output.txt

cd ..
echo.
echo ========================================================
echo QA CYCLE COMPLETED. 
echo ========================================================
pause
