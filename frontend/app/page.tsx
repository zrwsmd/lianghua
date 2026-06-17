'use client'

/**
 * 量化交易平台主页面
 * 整合所有组件，提供完整的交易界面
 */
import { useState, useEffect } from 'react'
import PriceChart from '@/components/PriceChart'
import EquityChart from '@/components/EquityChart'
import StatsCards from '@/components/StatsCards'
import StrategyParamsPanel from '@/components/StrategyParamsPanel'
import PositionsPanel from '@/components/PositionsPanel'
import TradingPanel from '@/components/TradingPanel'
import { getOHLCV, runBacktest, getAccount, BacktestResult, OHLCVData, Account } from '@/lib/api'

export default function HomePage() {
  // 数据状态
  const [ohlcvData, setOhlcvData] = useState<OHLCVData[]>([])
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSymbol, setCurrentSymbol] = useState('BTCUSDT')
  const [currentTimeframe, setCurrentTimeframe] = useState('5m')

  // 加载初始数据
  useEffect(() => {
    loadInitialData()
    loadAccount()
  }, [])

  const loadInitialData = async () => {
    try {
      const response: any = await getOHLCV({
        symbol: 'BTCUSDT',
        timeframe: '5m',
        start: '2024-01-01',
        end: '2024-12-31',
      })
      if (response.success && response.data) {
        setOhlcvData(response.data)
      }
    } catch (error) {
      console.error('加载初始数据失败:', error)
    }
  }

  const loadAccount = async () => {
    try {
      const response: any = await getAccount()
      if (response.success && response.account) {
        setAccount(response.account)
      }
    } catch (error) {
      console.error('加载账户信息失败:', error)
    }
  }

  const handleRunBacktest = async (params: any) => {
    setIsLoading(true)
    try {
      // 先获取OHLCV数据
      const ohlcvResponse: any = await getOHLCV({
        symbol: params.symbol,
        timeframe: params.timeframe,
        start: params.start,
        end: params.end,
      })

      if (ohlcvResponse.success && ohlcvResponse.data) {
        setOhlcvData(ohlcvResponse.data)
        setCurrentSymbol(params.symbol)
        setCurrentTimeframe(params.timeframe)
      }

      // 运行回测
      const backtestResponse: any = await runBacktest(params)
      if (backtestResponse.success) {
        setBacktestResult(backtestResponse)
      }
    } catch (error) {
      console.error('回测失败:', error)
      alert('回测失败，请检查参数后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTradeComplete = () => {
    // 交易完成后刷新账户信息
    loadAccount()
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* 顶部导航栏 */}
      <header className="bg-dark-card border-b border-dark-border shadow-lg">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center shadow-neon-blue">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">量化交易平台</h1>
                <p className="text-sm text-gray-400">专业回测与模拟交易系统</p>
              </div>
            </div>

            {/* 当前交易信息 */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">当前标的</div>
                <div className="text-lg font-semibold text-neon-blue">{currentSymbol}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">时间周期</div>
                <div className="text-lg font-semibold text-neon-purple">{currentTimeframe}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">账户净值</div>
                <div className="text-lg font-semibold text-neon-green">
                  ${account?.equity.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧：策略参数面板 */}
          <div className="col-span-3">
            <StrategyParamsPanel onRunBacktest={handleRunBacktest} isLoading={isLoading} />
          </div>

          {/* 中间：图表区域 */}
          <div className="col-span-6 space-y-6">
            {/* K线图 */}
            <PriceChart
              data={ohlcvData}
              indicators={backtestResult?.indicators}
            />

            {/* 权益曲线 */}
            {backtestResult && (
              <EquityChart
                data={backtestResult.equity_curve}
                drawdownData={backtestResult.drawdown_curve}
              />
            )}

            {/* 统计指标卡片 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                回测统计
              </h3>
              <StatsCards stats={backtestResult?.stats || null} />
            </div>
          </div>

          {/* 右侧：交易和持仓面板 */}
          <div className="col-span-3 space-y-6">
            {/* 模拟交易面板 */}
            <TradingPanel
              symbol={currentSymbol}
              onTradeComplete={handleTradeComplete}
            />

            {/* 持仓和订单 */}
            <PositionsPanel
              positions={account?.positions || []}
              orders={account?.orders || []}
            />
          </div>
        </div>
      </main>

      {/* 底部信息栏 */}
      <footer className="bg-dark-card border-t border-dark-border mt-12">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2024 量化交易平台 - 仅供学习和演示使用
            </div>
            <div className="flex items-center space-x-4">
              <span>📈 实时数据</span>
              <span>🔒 模拟环境</span>
              <span>⚡ 高性能回测</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
