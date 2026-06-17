# 量化交易平台 - 完整使用说明

一个专业的量化交易回测与模拟交易Web平台，包含炫酷的深色交易终端风格界面。

## 技术栈

- 后端：Python 3.9+ + FastAPI + pandas + numpy
- 前端：Next.js 14 + React 18 + TypeScript + TailwindCSS
- 图表：TradingView lightweight-charts

## 项目结构

```
quant-trading-platform/
├── backend/                    # Python后端
│   ├── main.py                # FastAPI主服务
│   ├── requirements.txt       # Python依赖
│   ├── strategies/            # 策略模块
│   │   ├── __init__.py
│   │   └── ma_crossover.py   # 均线交叉策略
│   └── data/                  # 数据模块
│       ├── __init__.py
│       └── data_provider.py  # 数据提供器
└── frontend/                  # Next.js前端
    ├── app/                   # Next.js应用目录
    │   ├── layout.tsx        # 全局布局
    │   ├── page.tsx          # 主页面
    │   └── globals.css       # 全局样式
    ├── components/            # React组件
    │   ├── PriceChart.tsx    # K线图
    │   ├── EquityChart.tsx   # 权益曲线
    │   ├── StatsCards.tsx    # 统计卡片
    │   ├── StrategyParamsPanel.tsx  # 参数面板
    │   ├── PositionsPanel.tsx       # 持仓面板
    │   └── TradingPanel.tsx         # 交易面板
    ├── lib/                   # 工具库
    │   └── api.ts            # API封装
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    └── next.config.js
```

## 安装步骤

### 1. 后端安装

由于C盘空间不足，我们将Python虚拟环境创建在项目目录下：

```bash
# 进入后端目录
cd backend

# 在项目目录下创建虚拟环境（所有依赖都会安装在这里，不占用C盘）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 前端安装

```bash
# 进入前端目录
cd frontend

# 安装依赖（使用npm、yarn或pnpm均可）
npm install
# 或
yarn install
# 或
pnpm install
```

## 启动项目

### 1. 启动后端服务

```bash
# 确保在backend目录下，并已激活虚拟环境
cd backend
venv\Scripts\activate

# 启动FastAPI服务（默认端口8000）
python main.py

# 或使用uvicorn命令
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端启动成功后，访问 http://localhost:8000 可以看到API信息。
API文档地址：http://localhost:8000/docs

### 2. 启动前端服务

打开新的终端窗口：

```bash
# 进入前端目录
cd frontend

# 启动Next.js开发服务器（默认端口3000）
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

前端启动成功后，访问 http://localhost:3000 即可看到量化交易平台界面。

## 使用说明

### 1. 回测功能

1. 在左侧"策略参数设置"面板中：
   - 选择交易标的（默认BTCUSDT）
   - 选择时间周期（1m, 5m, 15m, 30m, 1h, 4h, 1d）
   - 设置回测时间范围（开始和结束日期）
   - 调整策略参数：
     - 快线周期：5-50（默认20）
     - 慢线周期：20-200（默认50）
     - ATR周期：7-30（默认14）
     - ATR倍数：1.0-5.0（默认2.0）

2. 点击"运行回测"按钮

3. 查看结果：
   - 中间区域显示K线图、权益曲线和回撤曲线
   - 下方显示详细的统计指标卡片：
     - 总收益率
     - 年化收益率
     - 最大回撤
     - 夏普比率
     - 胜率
     - 交易次数
     - 最终净值

### 2. 模拟交易功能

1. 在右侧"模拟交易"面板中：
   - 选择交易方向（做多或做空）
   - 输入交易数量
   - 输入价格（模拟市价）
   - 查看预计成本和手续费

2. 点击"开仓"按钮进行开仓操作

3. 点击"平仓"按钮进行平仓操作

4. 在下方"当前持仓"和"历史订单"区域查看交易记录

### 3. 账户管理

- 初始资金：10万美元
- 可用资金：显示在顶部导航栏
- 手续费：0.1%（开仓和平仓各收取一次）

需要重置账户时，可以调用后端API：
```bash
curl -X POST http://localhost:8000/api/account/reset
```

## 策略说明

### 均线交叉策略（MA Crossover）

这是一个经典的趋势跟随策略：

入场逻辑：
- 金叉：当快线（短期EMA）向上穿过慢线（长期EMA）时，产生买入信号
- 死叉：当快线向下穿过慢线时，产生卖出信号

风险控制：
- 使用ATR（平均真实波幅）动态计算止损距离
- 单笔风险控制在总资金的1%以内
- 不进行加仓操作

适用场景：
- 趋势明显的市场
- 适合中长期持仓
- 震荡市场表现较差

## API接口说明

### 1. 获取K线数据
```
GET /api/ohlcv?symbol=BTCUSDT&timeframe=5m&start=2024-01-01&end=2024-12-31
```

### 2. 运行回测
```
POST /api/backtest
Body: {
  "symbol": "BTCUSDT",
  "timeframe": "5m",
  "start": "2024-01-01",
  "end": "2024-12-31",
  "strategy_type": "ma_crossover",
  "params": {
    "fast_period": 20,
    "slow_period": 50,
    "atr_period": 14,
    "atr_multiplier": 2.0
  }
}
```

### 3. 模拟交易
```
POST /api/paper-trade
Body: {
  "symbol": "BTCUSDT",
  "side": "buy",
  "action": "open",
  "quantity": 0.01,
  "price": 50000
}
```

### 4. 获取账户信息
```
GET /api/account
```

### 5. 重置账户
```
POST /api/account/reset
```

## 界面特色

1. 深色主题：专业的交易终端风格
2. 霓虹配色：蓝、紫、粉、绿等高亮色
3. 动效设计：
   - 卡片hover放大和发光效果
   - 按钮点击涟漪效果
   - 数字跳动动画
4. 响应式布局：适配不同屏幕尺寸

## 注意事项

1. 这是一个学习和演示项目，仅用于教育目的
2. 所有交易均为模拟操作，不涉及真实资金
3. 历史数据使用随机生成的模拟数据
4. 实际交易中需要考虑滑点、流动性等更多因素
5. 回测结果不代表未来表现

## 扩展建议

如果想进一步完善项目，可以考虑：

1. 接入真实数据源（如币安API、股票API）
2. 添加更多策略（网格交易、动量策略等）
3. 实现策略优化和参数扫描
4. 添加风险管理模块
5. 实现多标的组合管理
6. 添加用户认证和数据持久化
7. 实现实时推送和WebSocket连接
8. 添加更多技术指标（MACD、RSI、布林带等）

## 常见问题

Q: 为什么K线图不显示？
A: 请确保后端服务已启动，并检查浏览器控制台是否有CORS错误。

Q: 如何修改初始资金？
A: 在backend/main.py中修改paper_account的初始值。

Q: 如何添加新的策略？
A: 在backend/strategies/目录下创建新的策略类，参考ma_crossover.py的实现方式。

Q: 前端如何连接不同的后端地址？
A: 修改frontend/lib/api.ts中的API_BASE_URL变量。

## 技术支持

如遇到问题，请检查：
1. Python版本是否为3.9+
2. Node.js版本是否为16+
3. 后端服务是否正常运行
4. 浏览器控制台是否有错误信息

---

开始体验专业的量化交易平台吧！🚀
