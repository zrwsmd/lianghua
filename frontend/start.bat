@echo off
chcp 65001 >nul
echo ========================================
echo    量化交易平台 - 前端服务启动
echo ========================================
echo.

cd /d %~dp0

if not exist "node_modules\" (
    echo [警告] 未找到 node_modules，正在自动安装依赖...
    echo.
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo.
)

echo [启动] Next.js 开发服务器...
echo.
echo 前端地址: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

npm run dev
