import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Origin — Dashboard',
  description: 'Sign in to access the Origin dashboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link
          rel="icon"
          href="https://raw.githubusercontent.com/tryorigin/origin-stuffz/refs/heads/main/favicon.ico"
        />
      </head>
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  )
}