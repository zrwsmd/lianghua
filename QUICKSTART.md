# 快速入门指南

## 从零开始（5分钟启动项目）

### 前置要求

1. Python 3.9 或更高版本
2. Node.js 16 或更高版本
3. Windows系统（已提供bat脚本）

### 第一步：初始化后端（约2分钟）

```bash
# 进入后端目录
cd backend

# 双击运行 setup.bat 或在命令行执行：
setup.bat
```

这个脚本会：
- 在项目目录下创建Python虚拟环境（不占用C盘）
- 安装所有Python依赖包

### 第二步：启动后端服务

```bash
# 在backend目录下，双击运行 start.bat 或执行：
start.bat
```

看到以下信息表示启动成功：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 第三步：安装前端依赖（约1分钟）

打开新的命令行窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

### 第四步：启动前端服务

```bash
# 在frontend目录下，双击运行 start.bat 或执行：
start.bat
```

看到以下信息表示启动成功：
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 第五步：打开浏览器

访问：http://localhost:3000

你将看到一个炫酷的深色主题量化交易界面！

---

## 一键启动（已初始化后）

如果你已经完成了上述初始化步骤，后续可以使用一键启动：

在项目根目录双击运行：
```
start-all.bat
```

这会自动在两个窗口中启动后端和前端服务。

---

## 快速体验功能

### 1. 运行第一次回测

1. 左侧面板中，参数保持默认即可
2. 点击底部的 "🚀 运行回测" 按钮
3. 等待几秒钟，中间区域会显示：
   - K线图（带均线指标）
   - 权益曲线图
   - 统计指标卡片

### 2. 模拟交易

1. 右上方"模拟交易"面板
2. 选择"做多"或"做空"
3. 输入数量（如0.01）
4. 点击"开仓"按钮
5. 在下方"当前持仓"看到新持仓
6. 点击"平仓"按钮完成交易
7. 在"历史订单"看到交易记录

---

## 调整策略参数

左侧面板中的滑块可以实时调整：

- 快线周期（5-50）：控制短期趋势灵敏度
- 慢线周期（20-200）：控制长期趋势参考
- ATR周期（7-30）：控制波动率计算周期
- ATR倍数（1.0-5.0）：控制止损距离

每次调整后点击"运行回测"重新计算结果。

---

## 常见问题排查

### 后端启动失败

1. 检查Python版本：`python --version`（需要3.9+）
2. 检查是否已运行setup.bat初始化虚拟环境
3. 检查8000端口是否被占用：`netstat -ano | findstr :8000`

### 前端启动失败

1. 检查Node版本：`node --version`（需要16+）
2. 删除node_modules文件夹，重新运行 `npm install`
3. 检查3000端口是否被占用

### 页面显示但没有数据

1. 确认后端服务正在运行（http://localhost:8000 能访问）
2. 打开浏览器开发者工具（F12），查看Console标签页是否有错误
3. 检查Network标签页，API请求是否返回200状态码

### CORS跨域错误

后端main.py中已配置CORS，如果还有问题：
1. 确认前端访问的是 http://localhost:3000
2. 确认后端API地址配置正确（frontend/lib/api.ts中的API_BASE_URL）

---

## 项目目录说明

```
lianghua-project/
├── backend/                 # 后端目录
│   ├── venv/               # Python虚拟环境（初始化后生成）
│   ├── main.py             # API服务入口
│   ├── strategies/         # 策略模块
│   ├── data/               # 数据模块
│   ├── setup.bat           # 初始化脚本
│   └── start.bat           # 启动脚本
│
├── frontend/               # 前端目录
│   ├── node_modules/       # Node依赖（安装后生成）
│   ├── app/                # Next.js页面
│   ├── components/         # React组件
│   ├── lib/                # 工具库
│   └── start.bat           # 启动脚本
│
├── README.md               # 完整文档
├── QUICKSTART.md           # 本文件
└── start-all.bat           # 一键启动脚本
```

---

## 下一步

- 阅读完整的 README.md 了解更多功能
- 尝试调整不同的策略参数，观察回测结果变化
- 查看 http://localhost:8000/docs 浏览API文档
- 修改策略代码，实现自己的交易逻辑

---

祝你使用愉快！🎉
