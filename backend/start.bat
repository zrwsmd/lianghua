@echo off
chcp 65001 >nul
echo ========================================
echo    量化交易平台 - 后端服务启动
echo ========================================
echo.

cd /d %~dp0

if not exist "venv\" (
    echo [错误] 未找到虚拟环境，请先运行 setup.bat 进行初始化
    pause
    exit /b 1
)

echo [1/2] 激活虚拟环境...
call venv\Scripts\activate.bat

echo [2/2] 启动FastAPI服务...
echo.
echo 后端服务地址: http://localhost:8000
echo API文档地址: http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

python main.py
