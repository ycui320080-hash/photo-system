@echo off
cd /d "%~dp0"
call npm.cmd run electron -w desktop-admin
pause
