@echo off
chcp 65001 >nul
echo ========================================
echo    量化交易平台 - 一键启动
echo ========================================
echo.

cd /d %~dp0

echo 此脚本将同时启动后端和前端服务
echo 请确保已经运行过初始化脚本
echo.
echo 后端地址: http://localhost:8000
echo 前端地址: http://localhost:3000
echo.
pause

echo.
echo [1/2] 启动后端服务...
start "量化平台-后端" cmd /k "cd backend && setup.bat >nul 2>&1 && start.bat"

timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务...
start "量化平台-前端" cmd /k "cd frontend && start.bat"

echo.
echo ========================================
echo    服务已启动！
echo ========================================
echo.
echo 两个服务窗口已打开，请等待启动完成
echo 关闭这些窗口即可停止服务
echo.
pause
