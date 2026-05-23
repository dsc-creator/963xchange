import type { Metadata } from 'next'
import { Syne, DM_Sans, Space_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap'
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap'
})

const spaceMono = Space_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: '369xchange — Trade Crypto Built for 2026',
  description: 'The fastest, most secure platform to buy, sell, trade and earn crypto.',
  icons: {
    icon: [
      {
        url: '/favicon-x.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/favicon-x.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased" style={{ background: 'var(--bg-base)' }}>
        {children}
      </body>
    </html>
  )
}
