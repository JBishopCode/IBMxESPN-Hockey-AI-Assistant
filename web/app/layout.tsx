import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ice Intelligence — ESPN Fantasy Hockey AI',
  description: 'AI-powered fantasy hockey analytics powered by IBM watsonx',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
