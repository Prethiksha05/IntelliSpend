@echo off
title IntelliSpend Launch Controller
echo =====================================================================
echo    IntelliSpend — Intelligent Expense Management Platform
echo    100%% Free & Local Architecture — Zero Cloud Cost / No Paid APIs
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "IntelliSpend Backend" cmd /k "cd backend\expense-management-springboot && mvn spring-boot:run"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Angular Frontend (Port 4200)...
start "IntelliSpend Frontend" cmd /k "cd frontend\expense-management-angular && npm start"

echo.
echo =====================================================================
echo  IntelliSpend is launching!
echo  Frontend UI:  http://localhost:4200
echo  Backend APIs: http://localhost:8080/swagger-ui.html
echo  H2 Console:   http://localhost:8080/h2-console
echo.
echo  Demo Credentials:
echo  Username: alex_morgan
echo  Password: Password123!
echo =====================================================================
echo.
pause
