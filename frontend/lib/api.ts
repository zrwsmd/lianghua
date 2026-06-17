/**
 * API调用封装
 * 统一管理所有后端接口调用
 */
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// ============== 接口定义 ==============

/**
 * 获取OHLCV数据
 */
export const getOHLCV = async (params: {
  symbol: string
  timeframe: string
  start: string
  end: string
}) => {
  return api.get('/api/ohlcv', { params })
}

/**
 * 运行回测
 */
export const runBacktest = async (data: {
  symbol: string
  timeframe: string
  start: string
  end: string
  strategy_type: string
  params: any
}) => {
  return api.post('/api/backtest', data)
}

/**
 * 模拟交易下单
 */
export const paperTrade = async (data: {
  symbol: string
  side: string
  action: string
  quantity: number
  price?: number
}) => {
  return api.post('/api/paper-trade', data)
}

/**
 * 获取账户信息
 */
export const getAccount = async () => {
  return api.get('/api/account')
}

/**
 * 重置账户
 */
export const resetAccount = async () => {
  return api.post('/api/account/reset')
}

// ============== 类型定义 ==============

export interface OHLCVData {
  timestamp: number
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BacktestResult {
  success: boolean
  equity_curve: Array<{
    timestamp: number
    time: number
    equity: number
  }>
  drawdown_curve: Array<{
    timestamp: number
    time: number
    drawdown: number
  }>
  trades: Array<{
    timestamp: number
    type: string
    price: number
    quantity: number
    pnl?: number
    reason?: string
    stop_price?: number
  }>
  stats: {
    total_return: number
    annual_return: number
    max_drawdown: number
    sharpe_ratio: number
    win_rate: number
    total_trades: number
    final_equity: number
  }
  indicators?: {
    ema_fast: Array<{ time: number; value: number }>
    ema_slow: Array<{ time: number; value: number }>
  }
}

export interface Account {
  balance: number
  equity: number
  available: number
  positions: Array<{
    symbol: string
    side: string
    quantity: number
    entry_price: number
    current_price: number
    pnl: number
    pnl_percent: number
  }>
  orders: Array<{
    timestamp: string
    symbol: string
    side: string
    action: string
    quantity: number
    price: number
    pnl?: number
    fee: number
  }>
  realized_pnl: number
}

export default api
