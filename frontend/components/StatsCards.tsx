'use client'

/**
 * 统计指标卡片组件
 * 显示回测的关键绩效指标
 */
interface StatsCardsProps {
  stats: {
    total_return: number
    annual_return: number
    max_drawdown: number
    sharpe_ratio: number
    win_rate: number
    total_trades: number
    final_equity: number
  } | null
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-dark-card rounded-lg border border-dark-border p-4 animate-pulse"
          >
            <div className="h-4 bg-dark-border rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-dark-border rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      label: '总收益率',
      value: `${stats.total_return >= 0 ? '+' : ''}${stats.total_return.toFixed(2)}%`,
      color: stats.total_return >= 0 ? 'text-neon-green' : 'text-neon-red',
      icon: '📈',
    },
    {
      label: '年化收益率',
      value: `${stats.annual_return >= 0 ? '+' : ''}${stats.annual_return.toFixed(2)}%`,
      color: stats.annual_return >= 0 ? 'text-neon-green' : 'text-neon-red',
      icon: '📊',
    },
    {
      label: '最大回撤',
      value: `${stats.max_drawdown.toFixed(2)}%`,
      color: 'text-neon-red',
      icon: '📉',
    },
    {
      label: '夏普比率',
      value: stats.sharpe_ratio.toFixed(2),
      color: stats.sharpe_ratio >= 1 ? 'text-neon-green' : stats.sharpe_ratio >= 0 ? 'text-neon-yellow' : 'text-neon-red',
      icon: '⚡',
    },
    {
      label: '胜率',
      value: `${stats.win_rate.toFixed(2)}%`,
      color: stats.win_rate >= 50 ? 'text-neon-green' : 'text-neon-yellow',
      icon: '🎯',
    },
    {
      label: '交易次数',
      value: stats.total_trades.toString(),
      color: 'text-neon-blue',
      icon: '🔄',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-dark-card rounded-lg border border-dark-border p-4 card-hover neon-border transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{item.label}</span>
            <span className="text-xl">{item.icon}</span>
          </div>
          <div className={`text-2xl font-bold ${item.color}`}>
            {item.value}
          </div>
        </div>
      ))}

      {/* 最终净值卡片 - 占两列 */}
      <div className="col-span-2 bg-gradient-to-br from-dark-card to-dark-border rounded-lg border border-neon-blue p-4 card-hover shadow-neon-blue">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">最终净值</span>
          <span className="text-xl">💰</span>
        </div>
        <div className="text-3xl font-bold text-neon-blue">
          ${stats.final_equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  )
}
