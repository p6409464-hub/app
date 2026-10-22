@echo off
title Push Pranesh Music Hub to GitHub
color 0D
echo ================================================================
echo        Push Pranesh Music Hub to p6409464-hub/music-app.git
echo ================================================================
echo.
echo Notice: Windows currently has cached credentials for a different
echo GitHub user, causing a 403 Forbidden when pushing to p6409464-hub.
echo.
echo Choose an option:
echo [1] Push using GitHub Personal Access Token (PAT) [Fastest & Recommended]
echo [2] Login with GitHub in Browser
echo [3] Exit
echo.
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" goto token_push
if "%choice%"=="2" goto browser_login
if "%choice%"=="3" goto end

:token_push
echo.
echo ----------------------------------------------------------------
echo Quick Steps to create a Personal Access Token (takes 30 seconds):
echo 1. Open: https://github.com/settings/tokens
echo 2. Click "Generate new token" -> "Generate new token (classic)"
echo 3. Check the "repo" box (Full control of private repositories)
echo 4. Click "Generate token" and copy it (starts with ghp_...)
echo ----------------------------------------------------------------
echo.
set /p token="Paste your GitHub Token here and press Enter: "

if "%token%"=="" (
    echo Token cannot be empty.
    pause
    exit /b
)

echo.
echo Pushing code to GitHub...
cd /d "%~dp0"
git push -u https://%token%@github.com/p6409464-hub/music-app.git main

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Your code is now live on GitHub:
    echo https://github.com/p6409464-hub/music-app
    echo ============================================================
) else (
    echo.
    echo Failed to push. Please verify that your token has 'repo' permissions
    echo and belongs to the 'p6409464-hub' account.
)
pause
exit /b

:browser_login
echo.
echo Clearing cached GitHub credentials for Git Credential Manager...
cmdkey /delete:git:https://github.com
git credential reject
protocol=https
host=github.com

echo.
echo Now attempting push. A browser window will open to authorize p6409464-hub...
cd /d "%~dp0"
git push -u origin main
pause
exit /b

:end
exit /b
