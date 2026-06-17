"""
量化交易后端主服务
提供回测、模拟交易、行情数据等API接口
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from strategies.ma_crossover import MACrossoverStrategy
from data.data_provider import DataProvider

app = FastAPI(title="量化交易后端API")

# 配置CORS，允许前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局模拟账户状态（实际项目中应使用数据库）
paper_account = {
    "balance": 100000.0,  # 初始资金10万
    "equity": 100000.0,   # 账户净值
    "available": 100000.0, # 可用资金
    "positions": [],       # 持仓列表
    "orders": [],          # 历史订单
    "realized_pnl": 0.0    # 已实现盈亏
}

# 数据提供器实例
data_provider = DataProvider()


# ============== 请求和响应模型 ==============

class OHLCVRequest(BaseModel):
    symbol: str
    timeframe: str  # 1m, 5m, 15m, 1h, 1d
    start: str
    end: str


class BacktestRequest(BaseModel):
    symbol: str
    timeframe: str
    start: str
    end: str
    strategy_type: str  # "ma_crossover"
    params: Dict[str, Any]


class PaperTradeRequest(BaseModel):
    symbol: str
    side: str  # "buy" 或 "sell"
    action: str  # "open" 或 "close"
    quantity: float
    price: Optional[float] = None  # 市价单可不传


# ============== API接口实现 ==============

@app.get("/")
def root():
    return {"message": "量化交易后端API运行中", "version": "1.0.0"}


@app.get("/api/ohlcv")
def get_ohlcv(symbol: str, timeframe: str, start: str, end: str):
    """
    获取历史K线数据
    参数：
    - symbol: 交易标的，例如 BTCUSDT
    - timeframe: 时间周期，例如 5m, 1h, 1d
    - start: 开始时间，格式 YYYY-MM-DD
    - end: 结束时间，格式 YYYY-MM-DD
    """
    try:
        df = data_provider.get_ohlcv(symbol, timeframe, start, end)

        # 转换为前端需要的格式
        data = []
        for _, row in df.iterrows():
            data.append({
                "timestamp": int(row["timestamp"]),
                "time": int(row["timestamp"] / 1000),  # lightweight-charts需要秒级时间戳
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
                "volume": float(row["volume"])
            })

        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/backtest")
def run_backtest(request: BacktestRequest):
    """
    运行回测
    返回权益曲线、回撤曲线、交易记录和统计指标
    """
    try:
        # 获取历史数据
        df = data_provider.get_ohlcv(
            request.symbol,
            request.timeframe,
            request.start,
            request.end
        )

        # 根据策略类型创建策略实例
        if request.strategy_type == "ma_crossover":
            strategy = MACrossoverStrategy(request.params)
        else:
            raise HTTPException(status_code=400, detail="不支持的策略类型")

        # 运行回测引擎
        result = run_backtest_engine(
            df, strategy, initial_capital=100000.0, timeframe=request.timeframe
        )

        return {
            "success": True,
            "equity_curve": result["equity_curve"],
            "drawdown_curve": result["drawdown_curve"],
            "trades": result["trades"],
            "stats": result["stats"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/paper-trade")
def paper_trade(request: PaperTradeRequest):
    """
    模拟交易下单
    """
    global paper_account

    try:
        # 获取当前价格（实际应该从实时行情获取）
        current_price = request.price if request.price else get_latest_price(request.symbol)

        # 处理订单
        if request.action == "open":
            # 开仓
            cost = request.quantity * current_price
            fee = cost * 0.001  # 0.1%手续费
            total_cost = cost + fee

            if paper_account["available"] < total_cost:
                raise HTTPException(status_code=400, detail="可用资金不足")

            # 更新账户
            paper_account["available"] -= total_cost
            paper_account["positions"].append({
                "symbol": request.symbol,
                "side": request.side,
                "quantity": request.quantity,
                "entry_price": current_price,
                "current_price": current_price,
                "pnl": 0.0,
                "pnl_percent": 0.0
            })

            # 记录订单
            paper_account["orders"].append({
                "timestamp": datetime.now().isoformat(),
                "symbol": request.symbol,
                "side": request.side,
                "action": "open",
                "quantity": request.quantity,
                "price": current_price,
                "fee": fee
            })

        elif request.action == "close":
            # 平仓
            position_found = False
            for i, pos in enumerate(paper_account["positions"]):
                if pos["symbol"] == request.symbol and pos["side"] == request.side:
                    # 计算盈亏
                    if request.side == "buy":
                        pnl = (current_price - pos["entry_price"]) * pos["quantity"]
                    else:
                        pnl = (pos["entry_price"] - current_price) * pos["quantity"]

                    revenue = pos["quantity"] * current_price
                    fee = revenue * 0.001
                    net_pnl = pnl - fee

                    # 更新账户
                    paper_account["available"] += revenue - fee
                    paper_account["realized_pnl"] += net_pnl
                    paper_account["positions"].pop(i)

                    # 记录订单
                    paper_account["orders"].append({
                        "timestamp": datetime.now().isoformat(),
                        "symbol": request.symbol,
                        "side": request.side,
                        "action": "close",
                        "quantity": pos["quantity"],
                        "price": current_price,
                        "pnl": net_pnl,
                        "fee": fee
                    })

                    position_found = True
                    break

            if not position_found:
                raise HTTPException(status_code=400, detail="未找到对应持仓")

        # 更新账户净值
        paper_account["equity"] = paper_account["available"]
        for pos in paper_account["positions"]:
            paper_account["equity"] += pos["quantity"] * pos["current_price"]

        return {"success": True, "account": paper_account}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/account")
def get_account():
    """
    获取模拟账户信息
    """
    return {"success": True, "account": paper_account}


@app.post("/api/account/reset")
def reset_account():
    """
    重置模拟账户
    """
    global paper_account
    paper_account = {
        "balance": 100000.0,
        "equity": 100000.0,
        "available": 100000.0,
        "positions": [],
        "orders": [],
        "realized_pnl": 0.0
    }
    return {"success": True, "account": paper_account}


# ============== 回测引擎核心逻辑 ==============

def run_backtest_engine(df: pd.DataFrame, strategy, initial_capital: float = 100000.0,
                        timeframe: str = "1d"):
    """
    简单回测引擎实现
    """
    # 生成交易信号
    signals = strategy.generate_signals(df)

    # 初始化回测状态
    capital = initial_capital   # 现金（含已实现盈亏）
    position_side = 0           # 持仓方向：1=多头，-1=空头，0=空仓
    position = 0.0             # 持仓数量（恒为正，方向由position_side表示）
    entry_price = 0.0          # 当前持仓的开仓价
    stop_price = 0.0           # 当前持仓的ATR止损价（0表示未设止损）
    equity_curve = []
    trades = []
    pending_signal = 0         # 上一根K线收盘确认、待在本根开盘价执行的信号

    fee_rate = 0.001           # 单边手续费率0.1%
    risk_per_trade = 0.01      # 单笔最大亏损占总资金比例（1%风控）
    atr_multiplier = getattr(strategy, "atr_multiplier", 2.0)  # ATR止损倍数

    def close_position(exit_price, ts, reason="signal"):
        """按给定价格平掉当前持仓，结算盈亏到现金，返回平仓交易记录。"""
        nonlocal capital, position, position_side, entry_price, stop_price
        if position_side == 1:
            pnl = (exit_price - entry_price) * position   # 多头盈亏
            trade_type = "sell"
        else:
            pnl = (entry_price - exit_price) * position   # 空头盈亏
            trade_type = "cover"
        fee = (entry_price + exit_price) * position * fee_rate  # 两腿手续费
        net_pnl = pnl - fee
        capital += net_pnl
        record = {
            "timestamp": int(ts),
            "type": trade_type,
            "price": float(exit_price),
            "quantity": float(position),
            "pnl": float(net_pnl),
            "reason": reason   # signal=信号平仓，stop=触发ATR止损
        }
        position = 0.0
        position_side = 0
        entry_price = 0.0
        stop_price = 0.0
        return record

    def open_position(side, open_price, ts, atr):
        """按给定方向和价格开仓。

        仓位由“单笔1%风险”反推：每股风险 = ATR × 倍数（即开仓价到止损价的距离），
        仓位 = 总资金×1% / 每股风险，再受“不加杠杆”的名义市值上限约束。
        ATR无效（预热期）时退回95%资金法且不挂止损。
        """
        nonlocal capital, position, position_side, entry_price, stop_price
        entry_price = open_price
        position_side = side

        stop_distance = atr * atr_multiplier if atr and atr > 0 else 0.0
        max_qty = capital * 0.95 / entry_price   # 不加杠杆的最大可买数量

        if stop_distance > 0:
            risk_amount = capital * risk_per_trade
            qty_by_risk = risk_amount / stop_distance
            position = min(qty_by_risk, max_qty)
            if side == 1:
                stop_price = entry_price - stop_distance
            else:
                stop_price = entry_price + stop_distance
        else:
            position = max_qty
            stop_price = 0.0

        return {
            "timestamp": int(ts),
            "type": "buy" if side == 1 else "short",
            "price": float(entry_price),
            "quantity": float(position),
            "stop_price": float(stop_price)
        }

    # 遍历每根K线
    # 关键：信号在某根K线收盘后才能确认，成交则发生在“下一根K线的开盘价”，
    # 这样可避免前视偏差（look-ahead bias），更贴近实盘可执行的结果。
    for i in range(len(df)):
        row = df.iloc[i]
        price_open = row["open"]
        ts = row["timestamp"]
        atr = row["atr"] if "atr" in df.columns and not pd.isna(row["atr"]) else 0.0

        # 第一步：按“上一根产生的信号”，在本根K线开盘价成交
        if pending_signal == 1:
            # 金叉：若持有空头先平空，再开多
            if position_side == -1:
                trades.append(close_position(price_open, ts))
            if position_side == 0:
                trades.append(open_position(1, price_open, ts, atr))

        elif pending_signal == -1:
            # 死叉：若持有多头先平多，再开空（“平多并做空”）
            if position_side == 1:
                trades.append(close_position(price_open, ts))
            if position_side == 0:
                trades.append(open_position(-1, price_open, ts, atr))

        # 第二步：盘中检查ATR止损（在开仓之后、本根收盘前）。
        # 多头：本根最低价跌破止损价即触发；空头：本根最高价升破止损价即触发。
        # 成交价取止损价本身（贴近止损单实盘行为）；跳空时按更不利的开盘价成交。
        if position_side != 0 and stop_price > 0:
            if position_side == 1 and row["low"] <= stop_price:
                fill = min(stop_price, price_open) if price_open < stop_price else stop_price
                trades.append(close_position(fill, ts, reason="stop"))
            elif position_side == -1 and row["high"] >= stop_price:
                fill = max(stop_price, price_open) if price_open > stop_price else stop_price
                trades.append(close_position(fill, ts, reason="stop"))

        # 第三步：本根K线收盘后才确认信号，留到下一根开盘执行
        pending_signal = signals.iloc[i]

        # 第三步：按本根收盘价计算当前账户净值
        if position_side == 1:
            equity = capital + position * (row["close"] - entry_price)
        elif position_side == -1:
            equity = capital + position * (entry_price - row["close"])
        else:
            equity = capital

        equity_curve.append({
            "timestamp": int(row["timestamp"]),
            "time": int(row["timestamp"] / 1000),
            "equity": float(equity)
        })

    # 计算回撤曲线
    equity_series = pd.Series([point["equity"] for point in equity_curve])
    running_max = equity_series.expanding().max()
    drawdown = (equity_series - running_max) / running_max * 100

    drawdown_curve = []
    for i, dd in enumerate(drawdown):
        drawdown_curve.append({
            "timestamp": equity_curve[i]["timestamp"],
            "time": equity_curve[i]["time"],
            "drawdown": float(dd)
        })

    # 计算统计指标
    final_equity = equity_curve[-1]["equity"]
    total_return = (final_equity - initial_capital) / initial_capital * 100
    max_drawdown = float(drawdown.min())

    # 计算年化收益率
    days = (df.iloc[-1]["timestamp"] - df.iloc[0]["timestamp"]) / (1000 * 86400)
    annual_return = (final_equity / initial_capital) ** (365 / days) - 1 if days > 0 else 0
    annual_return = float(annual_return * 100)

    # 计算夏普比率（简化版）
    # 年化因子需随周期变化：日线一年约252个交易日，分钟线则一年有数万根K线，
    # 写死252会让分钟线的夏普严重失真，这里按周期动态计算每年的K线根数。
    bars_per_year_map = {
        "1m": 252 * 240,   # 每个交易日约240分钟（A股4小时）
        "5m": 252 * 48,
        "15m": 252 * 16,
        "30m": 252 * 8,
        "1h": 252 * 4,
        "4h": 252 * 1,
        "1d": 252,
    }
    bars_per_year = bars_per_year_map.get(timeframe, 252)

    returns = equity_series.pct_change().dropna()
    sharpe_ratio = float(returns.mean() / returns.std() * np.sqrt(bars_per_year)) if returns.std() > 0 else 0

    # 计算胜率
    winning_trades = [t for t in trades if "pnl" in t and t["pnl"] > 0]
    total_trades = len([t for t in trades if "pnl" in t])
    win_rate = len(winning_trades) / total_trades * 100 if total_trades > 0 else 0

    stats = {
        "total_return": round(total_return, 2),
        "annual_return": round(annual_return, 2),
        "max_drawdown": round(max_drawdown, 2),
        "sharpe_ratio": round(sharpe_ratio, 2),
        "win_rate": round(win_rate, 2),
        "total_trades": total_trades,
        "final_equity": round(final_equity, 2)
    }

    return {
        "equity_curve": equity_curve,
        "drawdown_curve": drawdown_curve,
        "trades": trades,
        "stats": stats
    }


def get_latest_price(symbol: str) -> float:
    """
    获取最新价格（这里用模拟数据）
    """
    # 实际应该连接交易所API获取实时价格
    # 这里简单返回一个模拟价格
    return 50000.0


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
