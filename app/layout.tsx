import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KAP Intelligence Terminal',
  description: 'Key Account Plan intelligence platform by Campfire',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-page min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
