Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   IntelliSpend — Intelligent Expense Management Platform" -ForegroundColor Green
Write-Host "   100% Free & Local Architecture — Zero Cloud Cost / No Paid APIs" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/2] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\expense-management-springboot'; mvn spring-boot:run"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Angular Frontend (Port 4200)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend\expense-management-angular'; npm start"

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host " IntelliSpend is launching!" -ForegroundColor Green
Write-Host " Frontend UI:  http://localhost:4200" -ForegroundColor White
Write-Host " Swagger Docs: http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host " H2 Console:   http://localhost:8080/h2-console" -ForegroundColor White
Write-Host "`n Demo Account: alex_morgan / Password123!" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
