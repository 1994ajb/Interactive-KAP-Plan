import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { AuthGuard } from '@/lib/auth-guard'

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
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
