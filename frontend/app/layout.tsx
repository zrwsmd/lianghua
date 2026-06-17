import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '量化交易平台',
  description: '专业的量化交易回测与模拟交易系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
