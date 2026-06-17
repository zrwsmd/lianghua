'use client'

/**
 * K线图表组件
 * 使用TradingView lightweight-charts库
 * 显示K线、成交量和技术指标
 */
import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData } from 'lightweight-charts'

interface PriceChartProps {
  data: Array<{
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  indicators?: {
    ema_fast?: Array<{ time: number; value: number }>
    ema_slow?: Array<{ time: number; value: number }>
  }
}

export default function PriceChart({ data, indicators }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const emaFastSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const emaSlowSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
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

    // 创建K线系列
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })
    candlestickSeriesRef.current = candlestickSeries

    // 创建成交量系列
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })
    volumeSeriesRef.current = volumeSeries

    // 创建快线EMA系列
    const emaFastSeries = chart.addLineSeries({
      color: '#00d4ff',
      lineWidth: 2,
      title: 'EMA快线',
    })
    emaFastSeriesRef.current = emaFastSeries

    // 创建慢线EMA系列
    const emaSlowSeries = chart.addLineSeries({
      color: '#a855f7',
      lineWidth: 2,
      title: 'EMA慢线',
    })
    emaSlowSeriesRef.current = emaSlowSeries

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

  // 更新数据
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !data || data.length === 0) return

    // 更新K线数据
    const candleData: CandlestickData[] = data.map((item) => ({
      time: item.time as any,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }))
    candlestickSeriesRef.current.setData(candleData)

    // 更新成交量数据
    const volumeData: HistogramData[] = data.map((item) => ({
      time: item.time as any,
      value: item.volume,
      color: item.close >= item.open ? '#10b98166' : '#ef444466',
    }))
    volumeSeriesRef.current.setData(volumeData)

    // 自动缩放
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [data])

  // 更新指标数据
  useEffect(() => {
    if (!indicators) return

    if (indicators.ema_fast && emaFastSeriesRef.current) {
      emaFastSeriesRef.current.setData(indicators.ema_fast as any)
    }

    if (indicators.ema_slow && emaSlowSeriesRef.current) {
      emaSlowSeriesRef.current.setData(indicators.ema_slow as any)
    }
  }, [indicators])

  return (
    <div className="w-full bg-dark-card rounded-lg border border-dark-border overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-border">
        <h3 className="text-lg font-semibold text-white">价格走势</h3>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  )
}
