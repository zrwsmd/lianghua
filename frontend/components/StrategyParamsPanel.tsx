'use client'

/**
 * 策略参数调节面板
 * 允许用户调整策略参数并触发回测
 */
import { useState } from 'react'

interface StrategyParamsPanelProps {
  onRunBacktest: (params: {
    symbol: string
    timeframe: string
    start: string
    end: string
    strategy_type: string
    params: any
  }) => void
  isLoading: boolean
}

// 获取今天日期（YYYY-MM-DD格式）
const getToday = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 获取一个月前的日期（YYYY-MM-DD格式）
const getOneMonthAgo = () => {
  const today = new Date()
  const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))
  return oneMonthAgo.toISOString().split('T')[0]
}

export default function StrategyParamsPanel({ onRunBacktest, isLoading }: StrategyParamsPanelProps) {
  const [symbol, setSymbol] = useState('600519')
  const [timeframe, setTimeframe] = useState('1d')
  // 使用确定存在数据的日期范围（2024年1月到12月）
  const [startDate, setStartDate] = useState('2024-01-01')
  const [endDate, setEndDate] = useState('2024-12-31')
  const [fastPeriod, setFastPeriod] = useState(20)
  const [slowPeriod, setSlowPeriod] = useState(50)
  const [atrPeriod, setAtrPeriod] = useState(14)
  const [atrMultiplier, setAtrMultiplier] = useState(2.0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRunBacktest({
      symbol,
      timeframe,
      start: startDate,
      end: endDate,
      strategy_type: 'ma_crossover',
      params: {
        fast_period: fastPeriod,
        slow_period: slowPeriod,
        atr_period: atrPeriod,
        atr_multiplier: atrMultiplier,
      },
    })
  }

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <span className="mr-2">⚙️</span>
        策略参数设置
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 交易标的 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            交易标的
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors"
            placeholder="BTCUSDT"
          />
        </div>

        {/* 时间周期 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            时间周期
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors"
          >
            <option value="1m">1分钟</option>
            <option value="5m">5分钟</option>
            <option value="15m">15分钟</option>
            <option value="30m">30分钟</option>
            <option value="1h">1小时</option>
            <option value="4h">4小时</option>
            <option value="1d">1天</option>
          </select>
        </div>

        {/* 回测时间范围 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              结束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors"
            />
          </div>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-dark-border pt-4 mt-4">
          <h4 className="text-sm font-semibold text-neon-purple mb-3">
            均线交叉策略参数
          </h4>
        </div>

        {/* 快线周期 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            快线周期 (EMA): {fastPeriod}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={fastPeriod}
            onChange={(e) => setFastPeriod(Number(e.target.value))}
            className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* 慢线周期 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            慢线周期 (EMA): {slowPeriod}
          </label>
          <input
            type="range"
            min="20"
            max="200"
            step="5"
            value={slowPeriod}
            onChange={(e) => setSlowPeriod(Number(e.target.value))}
            className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* ATR周期 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ATR周期: {atrPeriod}
          </label>
          <input
            type="range"
            min="7"
            max="30"
            step="1"
            value={atrPeriod}
            onChange={(e) => setAtrPeriod(Number(e.target.value))}
            className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* ATR倍数 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ATR倍数: {atrMultiplier.toFixed(1)}
          </label>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={atrMultiplier}
            onChange={(e) => setAtrMultiplier(Number(e.target.value))}
            className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* 运行回测按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold py-3 rounded-lg btn-glow hover:shadow-neon-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              运行中...
            </span>
          ) : (
            '🚀 运行回测'
          )}
        </button>
      </form>

      {/* 策略说明 */}
      <div className="mt-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
        <h4 className="text-sm font-semibold text-neon-green mb-2">📝 策略说明</h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          均线交叉策略：当快线（短期EMA）向上穿过慢线（长期EMA）时产生买入信号，向下穿过时产生卖出信号。
          ATR用于动态止损，帮助控制风险。这是一个经典的趋势跟随策略。
        </p>
      </div>
    </div>
  )
}
