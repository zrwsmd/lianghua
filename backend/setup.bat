@echo off
chcp 65001 >nul
echo ========================================
echo    量化交易平台 - 后端环境初始化
echo ========================================
echo.

cd /d %~dp0

echo [1/3] 创建虚拟环境（所有依赖将安装在项目目录下，不占用C盘）...
py -m venv venv
if errorlevel 1 (
    echo [错误] 虚拟环境创建失败，请确保已安装Python 3.9+
    pause
    exit /b 1
)

echo [2/3] 激活虚拟环境...
call venv\Scripts\activate.bat

echo [3/3] 安装依赖包...
pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo    初始化完成！
echo ========================================
echo.
echo 现在可以运行 start.bat 启动后端服务
echo.
pause
