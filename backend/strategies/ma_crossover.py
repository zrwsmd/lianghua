"""
均线交叉策略实现
当短期均线上穿长期均线时做多，下穿时平仓做空
"""
import pandas as pd
import numpy as np


class MACrossoverStrategy:
    """
    双均线交叉策略
    """

    def __init__(self, params: dict):
        """
        初始化策略参数
        params = {
            "fast_period": 20,  # 快线周期
            "slow_period": 50,  # 慢线周期
            "atr_period": 14,   # ATR周期（用于止损）
            "atr_multiplier": 2.0  # ATR倍数
        }
        """
        self.fast_period = params.get("fast_period", 20)
        self.slow_period = params.get("slow_period", 50)
        self.atr_period = params.get("atr_period", 14)
        self.atr_multiplier = params.get("atr_multiplier", 2.0)

    def generate_signals(self, df: pd.DataFrame) -> pd.Series:
        """
        生成交易信号
        返回：
        - 1: 买入信号
        - -1: 卖出信号
        - 0: 无信号
        """
        # 计算快慢均线
        df["ema_fast"] = df["close"].ewm(span=self.fast_period, adjust=False).mean()
        df["ema_slow"] = df["close"].ewm(span=self.slow_period, adjust=False).mean()

        # 计算ATR（用于后续止损，这里简化处理）
        df["tr"] = np.maximum(
            df["high"] - df["low"],
            np.maximum(
                abs(df["high"] - df["close"].shift(1)),
                abs(df["low"] - df["close"].shift(1))
            )
        )
        df["atr"] = df["tr"].rolling(window=self.atr_period).mean()

        # 生成信号
        signals = pd.Series(0, index=df.index)

        # 金叉：快线上穿慢线 -> 买入
        golden_cross = (df["ema_fast"] > df["ema_slow"]) & (
            df["ema_fast"].shift(1) <= df["ema_slow"].shift(1)
        )

        # 死叉：快线下穿慢线 -> 卖出
        death_cross = (df["ema_fast"] < df["ema_slow"]) & (
            df["ema_fast"].shift(1) >= df["ema_slow"].shift(1)
        )

        signals[golden_cross] = 1
        signals[death_cross] = -1

        return signals

    def get_indicators(self, df: pd.DataFrame) -> dict:
        """
        获取指标数据用于前端绘图
        """
        df["ema_fast"] = df["close"].ewm(span=self.fast_period, adjust=False).mean()
        df["ema_slow"] = df["close"].ewm(span=self.slow_period, adjust=False).mean()

        ema_fast_data = []
        ema_slow_data = []

        for _, row in df.iterrows():
            ema_fast_data.append({
                "time": int(row["timestamp"] / 1000),
                "value": float(row["ema_fast"])
            })
            ema_slow_data.append({
                "time": int(row["timestamp"] / 1000),
                "value": float(row["ema_slow"])
            })

        return {
            "ema_fast": ema_fast_data,
            "ema_slow": ema_slow_data
        }
