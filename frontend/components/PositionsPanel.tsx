'use client'

/**
 * 持仓和订单面板
 * 显示当前持仓和历史订单
 */
interface Position {
  symbol: string
  side: string
  quantity: number
  entry_price: number
  current_price: number
  pnl: number
  pnl_percent: number
}

interface Order {
  timestamp: string
  symbol: string
  side: string
  action: string
  quantity: number
  price: number
  pnl?: number
  fee: number
}

interface PositionsPanelProps {
  positions: Position[]
  orders: Order[]
}

export default function PositionsPanel({ positions, orders }: PositionsPanelProps) {
  return (
    <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
      {/* 当前持仓 */}
      <div className="border-b border-dark-border">
        <div className="px-4 py-3 bg-dark-bg">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            当前持仓
          </h3>
        </div>
        <div className="p-4">
          {positions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无持仓
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((pos, index) => (
                <div
                  key={index}
                  className="bg-dark-bg rounded-lg p-3 border border-dark-border card-hover"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-white font-semibold">{pos.symbol}</span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                          pos.side === 'buy'
                            ? 'bg-neon-green/20 text-neon-green'
                            : 'bg-neon-red/20 text-neon-red'
                        }`}
                      >
                        {pos.side === 'buy' ? '做多' : '做空'}
                      </span>
                    </div>
                    <div className={`font-semibold ${pos.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} ({pos.pnl_percent >= 0 ? '+' : ''}{pos.pnl_percent.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">数量</span>
                      <div className="text-white">{pos.quantity.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">开仓价</span>
                      <div className="text-white">${pos.entry_price.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">当前价</span>
                      <div className="text-white">${pos.current_price.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 历史订单 */}
      <div>
        <div className="px-4 py-3 bg-dark-bg">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📜</span>
            历史订单
          </h3>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无订单
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice().reverse().map((order, index) => (
                <div
                  key={index}
                  className="bg-dark-bg rounded p-2 border border-dark-border text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{order.symbol}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          order.action === 'open'
                            ? 'bg-neon-blue/20 text-neon-blue'
                            : 'bg-neon-purple/20 text-neon-purple'
                        }`}
                      >
                        {order.action === 'open' ? '开仓' : '平仓'}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          order.side === 'buy'
                            ? 'bg-neon-green/20 text-neon-green'
                            : 'bg-neon-red/20 text-neon-red'
                        }`}
                      >
                        {order.side === 'buy' ? '多' : '空'}
                      </span>
                    </div>
                    {order.pnl !== undefined && (
                      <span className={`font-semibold ${order.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                        {order.pnl >= 0 ? '+' : ''}{order.pnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-gray-500 text-xs">
                    <span>数量: {order.quantity.toFixed(4)} @ ${order.price.toFixed(2)}</span>
                    <span>{new Date(order.timestamp).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
