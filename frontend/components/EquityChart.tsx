'use client'

/**
 * 权益曲线图组件
 * 显示回测的账户净值变化
 */
import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, LineData } from 'lightweight-charts'

interface EquityChartProps {
  data: Array<{
    time: number
    equity: number
  }>
  drawdownData?: Array<{
    time: number
    drawdown: number
  }>
}

export default function EquityChart({ data, drawdownData }: EquityChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const drawdownSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#141b2d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e2a47' },
        horzLines: { color: '#1e2a47' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1e2a47',
      },
      timeScale: {
        borderColor: '#1e2a47',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // 创建权益曲线系列
    const equitySeries = chart.addLineSeries({
      color: '#00d4ff',
      lineWidth: 2,
      title: '账户净值',
      priceScaleId: 'equity',
    })
    equitySeriesRef.current = equitySeries

    // 创建回撤曲线系列
    const drawdownSeries = chart.addLineSeries({
      color: '#ef4444',
      lineWidth: 2,
      title: '回撤 %',
      priceScaleId: 'drawdown',
    })
    chart.priceScale('drawdown').applyOptions({
      scaleMargins: {
        top: 0.6,
        bottom: 0,
      },
    })
    drawdownSeriesRef.current = drawdownSeries

    // 响应式调整
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // 更新权益数据
  useEffect(() => {
    if (!equitySeriesRef.current || !data || data.length === 0) return

    const lineData: LineData[] = data.map((item) => ({
      time: item.time as any,
      value: item.equity,
    }))
    equitySeriesRef.current.setData(lineData)

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [data])

  // 更新回撤数据
  useEffect(() => {
    if (!drawdownSeriesRef.current || !drawdownData || drawdownData.length === 0) return

    const lineData: LineData[] = drawdownData.map((item) => ({
      time: item.time as any,
      value: item.drawdown,
    }))
    drawdownSeriesRef.current.setData(lineData)
  }, [drawdownData])

  return (
    <div className="w-full bg-dark-card rounded-lg border border-dark-border overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-border">
        <h3 className="text-lg font-semibold text-white">权益曲线</h3>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  )
}
