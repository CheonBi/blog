import './tailwind.css'
import type {Metadata} from 'next'
import type {ReactNode} from 'react'

export const metadata: Metadata = {
  title: 'Kinetograph — Video Journal',
  description: '직접 촬영한 짧은 영상을 모아둔 개인 영상 기록.',
}

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
