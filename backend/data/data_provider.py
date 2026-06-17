"""
数据提供器
用于生成和提供历史K线数据
实际项目中应该连接真实的数据源（如交易所API、数据库等）
这里使用模拟数据进行演示
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta


class DataProvider:
    """
    数据提供器类
    """

    def __init__(self):
        self.cache = {}

    def get_ohlcv(self, symbol: str, timeframe: str, start: str, end: str) -> pd.DataFrame:
        """
        获取OHLCV数据
        参数：
        - symbol: 交易标的
        - timeframe: 时间周期（1m, 5m, 15m, 1h, 1d）
        - start: 开始日期（YYYY-MM-DD）
        - end: 结束日期（YYYY-MM-DD）

        返回：包含timestamp, open, high, low, close, volume的DataFrame
        """
        # 解析时间
        start_dt = datetime.strptime(start, "%Y-%m-%d")
        end_dt = datetime.strptime(end, "%Y-%m-%d")

        # 根据timeframe确定数据间隔（分钟）
        interval_map = {
            "1m": 1,
            "5m": 5,
            "15m": 15,
            "30m": 30,
            "1h": 60,
            "4h": 240,
            "1d": 1440
        }

        interval_minutes = interval_map.get(timeframe, 5)

        # 生成时间序列
        timestamps = []
        current = start_dt
        while current <= end_dt:
            timestamps.append(current)
            current += timedelta(minutes=interval_minutes)

        # 生成模拟价格数据（使用随机游走模型）
        base_price = 50000.0  # 基础价格（模拟BTC价格）
        volatility = 0.02  # 波动率

        prices = [base_price]
        for i in range(1, len(timestamps)):
            # 随机游走 + 趋势
            trend = 0.0001  # 轻微上升趋势
            random_change = np.random.normal(trend, volatility)
            new_price = prices[-1] * (1 + random_change)
            prices.append(new_price)

        # 生成OHLCV数据
        data = []
        for i, ts in enumerate(timestamps):
            close = prices[i]
            open_price = close * (1 + np.random.uniform(-0.005, 0.005))
            high = max(open_price, close) * (1 + abs(np.random.uniform(0, 0.01)))
            low = min(open_price, close) * (1 - abs(np.random.uniform(0, 0.01)))
            volume = np.random.uniform(100, 1000)

            data.append({
                "timestamp": int(ts.timestamp() * 1000),  # 毫秒时间戳
                "open": open_price,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume
            })

        df = pd.DataFrame(data)
        return df

    def get_realtime_price(self, symbol: str) -> float:
        """
        获取实时价格（模拟）
        """
        # 这里返回模拟价格
        return 50000.0 + np.random.uniform(-500, 500)
