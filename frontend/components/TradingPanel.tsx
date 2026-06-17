'use client'

/**
 * 模拟交易面板
 * 允许用户进行模拟开仓和平仓操作
 */
import { useState } from 'react'
import { paperTrade } from '@/lib/api'

interface TradingPanelProps {
  symbol: string
  onTradeComplete: () => void
}

export default function TradingPanel({ symbol, onTradeComplete }: TradingPanelProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState(0.01)
  const [price, setPrice] = useState(50000)
  const [isLoading, setIsLoading] = useState(false)

  const handleTrade = async (action: 'open' | 'close') => {
    if (quantity <= 0) {
      alert('请输入有效的交易数量')
      return
    }

    setIsLoading(true)
    try {
      const response: any = await paperTrade({
        symbol,
        side,
        action,
        quantity,
        price,
      })

      if (response.success) {
        alert(`${action === 'open' ? '开仓' : '平仓'}成功！`)
        onTradeComplete()
      }
    } catch (error: any) {
      console.error('交易失败:', error)
      alert(`交易失败: ${error.response?.data?.detail || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
      <div className="px-4 py-3 bg-dark-bg border-b border-dark-border">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">💱</span>
          模拟交易
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* 方向选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            交易方向
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide('buy')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                side === 'buy'
                  ? 'bg-neon-green text-white shadow-neon-green'
                  : 'bg-dark-bg text-gray-400 border border-dark-border hover:border-neon-green'
              }`}
            >
              做多 ↑
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                side === 'sell'
                  ? 'bg-neon-red text-white shadow-neon-pink'
                  : 'bg-dark-bg text-gray-400 border border-dark-border hover:border-neon-red'
              }`}
            >
              做空 ↓
            </button>
          </div>
        </div>

        {/* 交易数量 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            数量
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            step="0.001"
            min="0.001"
            className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors"
            placeholder="0.01"
          />
        </div>

        {/* 价格 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            价格（市价单）
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            step="1"
            className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors"
            placeholder="50000"
          />
        </div>

        {/* 预计成本 */}
        <div className="bg-dark-bg rounded-lg p-3 border border-dark-border">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">预计成本</span>
            <span className="text-white font-semibold">
              ${(quantity * price).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">手续费 (0.1%)</span>
            <span className="text-neon-yellow">
              ${(quantity * price * 0.001).toFixed(2)}
            </span>
          </div>
        </div>

        {/* 开仓按钮 */}
        <button
          onClick={() => handleTrade('open')}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold btn-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            side === 'buy'
              ? 'bg-gradient-to-r from-neon-green to-green-600 text-white hover:shadow-neon-green'
              : 'bg-gradient-to-r from-neon-red to-red-600 text-white hover:shadow-neon-pink'
          }`}
        >
          {isLoading ? '处理中...' : `开仓 ${side === 'buy' ? '做多' : '做空'}`}
        </button>

        {/* 平仓按钮 */}
        <button
          onClick={() => handleTrade('close')}
          disabled={isLoading}
          className="w-full bg-dark-bg border border-neon-purple text-neon-purple py-3 rounded-lg font-semibold hover:bg-neon-purple hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '处理中...' : '平仓'}
        </button>

        {/* 风险提示 */}
        <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-3">
          <p className="text-xs text-neon-yellow leading-relaxed">
            ⚠️ 这是模拟交易环境，所有交易均为虚拟操作，不涉及真实资金。
          </p>
        </div>
      </div>
    </div>
  )
}
