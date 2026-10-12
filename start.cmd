@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 24 or newer from https://nodejs.org/
  pause
  exit /b 1
)
echo Word Atlas - Open http://127.0.0.1:3210 in your browser.
echo Keep this window open while studying. Press Ctrl+C to stop.
if exist ".env" (
  node --env-file=.env server.mjs
) else (
  node server.mjs
)
if errorlevel 1 pause
