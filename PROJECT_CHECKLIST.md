# 项目文件清单

## 后端文件 (backend/)

```
backend/
├── main.py                      # FastAPI主服务，包含所有API接口和回测引擎
├── requirements.txt             # Python依赖包列表
├── setup.bat                    # 后端初始化脚本（创建虚拟环境+安装依赖）
├── start.bat                    # 后端启动脚本
├── .gitignore                   # Git忽略配置
├── strategies/
│   ├── __init__.py             # 策略模块初始化
│   └── ma_crossover.py         # 均线交叉策略实现
└── data/
    ├── __init__.py             # 数据模块初始化
    └── data_provider.py        # 模拟数据生成器
```

## 前端文件 (frontend/)

```
frontend/
├── package.json                 # npm依赖配置
├── tsconfig.json               # TypeScript配置
├── tailwind.config.ts          # TailwindCSS配置（深色主题+霓虹色）
├── postcss.config.js           # PostCSS配置
├── next.config.js              # Next.js配置
├── start.bat                   # 前端启动脚本
├── .gitignore                  # Git忽略配置
├── .env.example                # 环境变量示例
├── app/
│   ├── layout.tsx              # 全局布局组件
│   ├── page.tsx                # 主页面（整合所有组件）
│   └── globals.css             # 全局样式（霓虹效果、动画）
├── components/
│   ├── PriceChart.tsx          # K线图组件（使用lightweight-charts）
│   ├── EquityChart.tsx         # 权益曲线图组件
│   ├── StatsCards.tsx          # 统计指标卡片组件
│   ├── StrategyParamsPanel.tsx # 策略参数调节面板
│   ├── PositionsPanel.tsx      # 持仓和订单面板
│   └── TradingPanel.tsx        # 模拟交易面板
└── lib/
    └── api.ts                  # API调用封装（axios）
```

## 根目录文件

```
lianghua-project/
├── README.md                    # 完整使用文档
├── QUICKSTART.md               # 5分钟快速入门指南
├── PROJECT_CHECKLIST.md        # 本文件
├── .gitignore                  # 全局Git忽略配置
└── start-all.bat               # 一键启动脚本（同时启动前后端）
```

## 功能特性清单

### 后端功能 ✓

- [x] FastAPI RESTful API服务
- [x] OHLCV历史数据生成（模拟数据）
- [x] 均线交叉策略实现
- [x] 完整回测引擎（支持权益曲线、回撤、统计指标）
- [x] 模拟交易系统（开仓、平仓、持仓管理）
- [x] 账户管理（资金、持仓、订单历史）
- [x] CORS跨域支持

### 前端功能 ✓

- [x] Next.js 14 + TypeScript项目架构
- [x] 深色主题交易终端界面
- [x] TradingView K线图（lightweight-charts）
- [x] 权益曲线和回撤图表
- [x] 实时统计指标展示
- [x] 策略参数动态调节
- [x] 模拟交易下单面板
- [x] 持仓和历史订单展示
- [x] 响应式布局设计

### UI/UX特色 ✓

- [x] 霓虹配色方案（蓝、紫、粉、绿）
- [x] 卡片悬停发光效果
- [x] 按钮点击涟漪动画
- [x] 数字跳动动画
- [x] 自定义滚动条样式
- [x] 渐变背景
- [x] 专业交易终端风格

## 技术栈版本

- Python: 3.9+
- FastAPI: 0.109.0
- pandas: 2.1.4
- numpy: 1.26.3
- Node.js: 16+
- Next.js: 14.1.0
- React: 18.2.0
- TypeScript: 5.3.3
- TailwindCSS: 3.4.1
- lightweight-charts: 4.1.1
- axios: 1.6.5

## 快速启动步骤

### 第一次使用

1. 后端初始化：
   ```bash
   cd backend
   setup.bat
   ```

2. 前端安装：
   ```bash
   cd frontend
   npm install
   ```

3. 启动服务：
   - 方式1：双击根目录的 `start-all.bat`
   - 方式2：分别在backend和frontend目录运行 `start.bat`

4. 访问：http://localhost:3000

### 后续使用

直接双击 `start-all.bat` 即可

## 测试清单

### 后端测试

- [ ] 访问 http://localhost:8000 显示API信息
- [ ] 访问 http://localhost:8000/docs 显示Swagger文档
- [ ] GET /api/ohlcv 返回K线数据
- [ ] POST /api/backtest 返回回测结果
- [ ] POST /api/paper-trade 执行交易成功
- [ ] GET /api/account 返回账户信息

### 前端测试

- [ ] 页面正常加载，显示深色主题界面
- [ ] K线图正常渲染
- [ ] 调整策略参数，点击"运行回测"能看到结果
- [ ] 权益曲线和统计卡片正常显示
- [ ] 模拟交易面板能正常开仓平仓
- [ ] 持仓和订单列表正常更新

## 已知限制和改进方向

### 当前限制

1. 使用模拟数据，非真实市场数据
2. 回测撮合逻辑简化（按下一根K线开盘价成交）
3. 未考虑滑点和流动性
4. 模拟账户数据存储在内存（重启后丢失）
5. 单一策略（均线交叉）

### 可扩展方向

1. 接入真实数据源（币安API、股票API）
2. 添加更多策略（网格、动量、套利）
3. 实现WebSocket实时推送
4. 添加用户认证系统
5. 数据库持久化（PostgreSQL、MongoDB）
6. 添加更多技术指标（MACD、RSI、布林带）
7. 实现策略参数优化功能
8. 支持多标的组合管理
9. 添加风险管理模块
10. 移动端适配

## 开发环境信息

- 操作系统：Windows 10/11
- Python路径：可通过 `where python` 查看
- Node路径：可通过 `where node` 查看
- 项目路径：e:\claude-project\lianghua-project

## 故障排查清单

### 后端问题

- [ ] Python版本检查：`python --version`
- [ ] 虚拟环境已创建：backend/venv/ 目录存在
- [ ] 依赖已安装：`pip list` 能看到fastapi、pandas等
- [ ] 端口8000未被占用：`netstat -ano | findstr :8000`

### 前端问题

- [ ] Node版本检查：`node --version`
- [ ] 依赖已安装：frontend/node_modules/ 目录存在
- [ ] 端口3000未被占用：`netstat -ano | findstr :3000`
- [ ] API地址配置正确：frontend/lib/api.ts

### 浏览器问题

- [ ] 使用Chrome或Edge浏览器
- [ ] 打开开发者工具（F12）查看Console错误
- [ ] 检查Network标签查看API请求状态
- [ ] 清除浏览器缓存后重试

## 项目状态

✅ 所有代码文件已创建完成
✅ 所有配置文件已就位
✅ 启动脚本已准备
✅ 文档已完善

🎉 项目可以直接使用！

---

最后更新：2024-01-01
