'use client'

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Poppins:wght@700;900&family=Bebas+Neue&display=swap" rel="stylesheet" />
        </head>
        <body>
          {!isAdminPage && <Header />}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
