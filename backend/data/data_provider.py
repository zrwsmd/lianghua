"""
数据提供器 - 支持真实数据和模拟数据
支持A股、黄金、期货等多种资产类型
多数据源支持：akshare、baostock
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import akshare as ak
import baostock as bs


class DataProvider:
    """
    数据提供器类
    根据symbol自动识别资产类型并获取真实数据
    """

    def __init__(self):
        self.cache = {}

    def get_ohlcv(self, symbol: str, timeframe: str, start: str, end: str) -> pd.DataFrame:
        """
        获取OHLCV数据（自动识别资产类型）
        参数：
        - symbol: 交易标的
          - A股：6位数字（如 600000、000001）
          - 黄金：Au99.99（上海黄金交易所现货黄金）
          - 白银：Ag99.99（上海黄金交易所现货白银）
          - 黄金期货：AU0（期货主力合约）
          - 加密货币：BTCUSDT等（使用模拟数据）
        - timeframe: 时间周期（1d=日线，暂只支持日线真实数据）
        - start: 开始日期（YYYY-MM-DD）
        - end: 结束日期（YYYY-MM-DD）

        返回：包含timestamp, open, high, low, close, volume的DataFrame
        """
        try:
            # 识别资产类型
            asset_type = self._identify_asset_type(symbol)

            if asset_type == "stock":
                # A股数据
                return self._get_stock_data(symbol, start, end)
            elif asset_type == "gold":
                # 黄金数据
                return self._get_gold_data(symbol, start, end)
            elif asset_type == "futures":
                # 期货数据
                return self._get_futures_data(symbol, start, end)
            else:
                # 加密货币或其他（使用模拟数据）
                return self._get_mock_data(symbol, timeframe, start, end)

        except Exception as e:
            print(f"获取真实数据失败: {e}，使用模拟数据")
            return self._get_mock_data(symbol, timeframe, start, end)

    def _identify_asset_type(self, symbol: str) -> str:
        """
        识别资产类型
        """
        # 去除前缀（如SH、SZ）
        clean_symbol = symbol.upper().replace("SH", "").replace("SZ", "")

        # A股：6位数字
        if clean_symbol.isdigit() and len(clean_symbol) == 6:
            return "stock"

        # 黄金白银现货
        if symbol.upper() in ["AU99.99", "AG99.99", "AU(T+D)", "AG(T+D)"]:
            return "gold"

        # 期货（简单判断）
        if symbol.upper() in ["AU0", "AG0", "CU0", "AL0"]:
            return "futures"

        # 默认为加密货币
        return "crypto"

    def _get_stock_data(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        """
        获取A股数据（多数据源支持）
        优先使用akshare，失败时自动切换到baostock
        """
        print(f"正在获取A股数据: {symbol}, {start} to {end}")

        # 尝试akshare数据源
        try:
            df = self._get_stock_data_akshare(symbol, start, end)
            print(f"akshare数据源成功，获取到 {len(df)} 条数据")
            return df
        except Exception as e:
            print(f"akshare数据源失败: {e}")

        # 尝试baostock数据源
        try:
            df = self._get_stock_data_baostock(symbol, start, end)
            print(f"baostock数据源成功，获取到 {len(df)} 条数据")
            return df
        except Exception as e:
            print(f"baostock数据源失败: {e}")
            raise Exception("所有数据源均失败")

    def _get_stock_data_akshare(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        """
        使用akshare获取A股数据
        """
        # 转换日期格式：YYYY-MM-DD -> YYYYMMDD
        start_date = start.replace("-", "")
        end_date = end.replace("-", "")

        # 获取A股历史数据（前复权）
        df = ak.stock_zh_a_hist(
            symbol=symbol,
            period="daily",
            start_date=start_date,
            end_date=end_date,
            adjust="qfq"  # 前复权
        )

        # 转换为时间戳（毫秒）- 修复类型转换问题
        df["timestamp"] = pd.to_datetime(df.iloc[:, 0]).astype('int64') // 10**6

        # akshare返回的列顺序：日期、股票代码、开盘、收盘、最高、最低、成交量...
        # 使用索引而不是列名，避免中文编码问题
        df["open"] = df.iloc[:, 2].astype(float)
        df["close"] = df.iloc[:, 3].astype(float)
        df["high"] = df.iloc[:, 4].astype(float)
        df["low"] = df.iloc[:, 5].astype(float)
        df["volume"] = df.iloc[:, 6].astype(float)

        # 选择需要的列
        result_df = df[["timestamp", "open", "high", "low", "close", "volume"]].copy()

        print(f"处理后数据样例: open={result_df.iloc[0]['open']}, close={result_df.iloc[0]['close']}")

        return result_df

    def _get_stock_data_baostock(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        """
        使用baostock获取A股数据（备用数据源）
        """
        # 登录baostock
        lg = bs.login()
        if lg.error_code != '0':
            raise Exception(f"baostock登录失败: {lg.error_msg}")

        # 转换股票代码格式：600000 -> sh.600000, 000001 -> sz.000001
        if symbol.startswith('6'):
            bs_code = f"sh.{symbol}"
        elif symbol.startswith('0') or symbol.startswith('3'):
            bs_code = f"sz.{symbol}"
        else:
            raise Exception(f"不支持的股票代码: {symbol}")

        # 获取历史数据
        rs = bs.query_history_k_data_plus(
            bs_code,
            "date,open,high,low,close,volume",
            start_date=start,
            end_date=end,
            frequency="d",
            adjustflag="2"  # 2表示前复权
        )

        if rs.error_code != '0':
            bs.logout()
            raise Exception(f"baostock查询失败: {rs.error_msg}")

        # 转换为DataFrame
        data_list = []
        while (rs.error_code == '0') & rs.next():
            data_list.append(rs.get_row_data())

        bs.logout()

        if not data_list:
            raise Exception("baostock返回数据为空")

        df = pd.DataFrame(data_list, columns=rs.fields)

        # 数据转换
        df["timestamp"] = pd.to_datetime(df["date"]).astype('int64') // 10**6
        df["open"] = df["open"].astype(float)
        df["high"] = df["high"].astype(float)
        df["low"] = df["low"].astype(float)
        df["close"] = df["close"].astype(float)
        df["volume"] = df["volume"].astype(float)

        # 选择需要的列
        result_df = df[["timestamp", "open", "high", "low", "close", "volume"]].copy()

        print(f"baostock数据样例: open={result_df.iloc[0]['open']}, close={result_df.iloc[0]['close']}")

        return result_df

    def _get_gold_data(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        """
        获取黄金/白银数据（上海黄金交易所）
        """
        # 转换日期格式
        start_date = start.replace("-", "")
        end_date = end.replace("-", "")

        # 获取现货黄金数据
        df = ak.spot_hist_sge(
            symbol=symbol,
            start_date=start_date,
            end_date=end_date
        )

        # 重命名列（根据实际返回的列名调整）
        df = df.rename(columns={
            "日期": "date",
            "开盘价": "open",
            "最高价": "high",
            "最低价": "low",
            "收盘价": "close",
            "成交量": "volume"
        })

        # 转换为时间戳
        df["timestamp"] = pd.to_datetime(df["date"]).astype(int) // 10**6

        # 选择需要的列
        df = df[["timestamp", "open", "high", "low", "close", "volume"]]

        return df

    def _get_futures_data(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        """
        获取期货数据
        """
        # 期货数据获取（这里简化处理）
        # 实际需要根据具体的期货品种和接口调整
        return self._get_mock_data(symbol, "1d", start, end)

    def _get_mock_data(self, symbol: str, timeframe: str, start: str, end: str) -> pd.DataFrame:
        """
        生成模拟数据（备用方案）
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

        # 根据symbol设置基础价格
        if symbol.isdigit() and len(symbol) == 6:
            # A股价格范围
            base_price = 20.0
            volatility = 0.03
        elif "AU" in symbol.upper() or "GOLD" in symbol.upper():
            # 黄金价格范围
            base_price = 450.0
            volatility = 0.02
        else:
            # 默认（加密货币）
            base_price = 50000.0
            volatility = 0.02

        # 生成模拟价格数据（使用随机游走模型）
        prices = [base_price]
        for i in range(1, len(timestamps)):
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
            volume = np.random.uniform(1000000, 10000000)

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
        获取实时价格
        """
        try:
            asset_type = self._identify_asset_type(symbol)

            if asset_type == "stock":
                # A股实时行情
                df = ak.stock_zh_a_spot_em()
                stock = df[df["代码"] == symbol]
                if not stock.empty:
                    return float(stock.iloc[0]["最新价"])

            # 其他类型暂用模拟价格
            return 50000.0 + np.random.uniform(-500, 500)
        except:
            return 50000.0 + np.random.uniform(-500, 500)
