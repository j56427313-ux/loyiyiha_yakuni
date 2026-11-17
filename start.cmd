@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo BilimNova server ishga tushmoqda...
echo Manzil: http://localhost:8000
python server.py
pause
