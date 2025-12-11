import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Odd One Out - Multiplayer Party Game',
    template: '%s | Odd One Out',
  },
  description:
    'A real-time multiplayer guessing game for remote teams. Find the odd one out in this fun 10-15 minute energizer!',
  keywords: [
    'multiplayer game',
    'party game',
    'remote teams',
    'guessing game',
    'team building',
    'icebreaker',
  ],
  authors: [{ name: 'Odd One Out' }],
  openGraph: {
    title: 'Odd One Out - Multiplayer Party Game',
    description: 'A real-time multiplayer guessing game for remote teams. Find the odd one out!',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Odd One Out - Multiplayer Party Game',
    description: 'A real-time multiplayer guessing game for remote teams.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
