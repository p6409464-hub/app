@echo off
title Pranesh Music Hub - Mobile Live Stream Launcher
color 0B
echo ================================================================
echo           Pranesh Music Hub - Mobile Live Stream Launcher
echo ================================================================
echo.
cd /d "%~dp0"

echo 1. Checking if web server is running on port 8080...
netstat -ano | findstr :8080 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo Starting Flask web server in background...
    start /b python app.py
    timeout /t 3 /nobreak >nul
) else (
    echo Web server is already running on port 8080!
)

echo.
echo 2. Starting Cloudflare HTTPS Tunnel for Mobile Access...
echo ----------------------------------------------------------------
echo Look for the https://*.trycloudflare.com link below:
echo ----------------------------------------------------------------
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:8080
pause
