'use client'

import { useAuth } from './auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

const AUTH_ENABLED = process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true'
const PUBLIC_PATHS = ['/login']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!AUTH_ENABLED) return
    if (loading) return
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  if (!AUTH_ENABLED) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="skeleton w-8 h-8 skeleton-circle mx-auto mb-3" />
          <p className="text-meta">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return null // Will redirect
  }

  return <>{children}</>
}
