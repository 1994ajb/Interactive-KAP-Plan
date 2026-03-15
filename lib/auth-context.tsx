'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabaseBrowser } from './supabase-browser'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ALLOWED_DOMAIN = 'campfire.co.uk'

function validateDomain(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase()
  if (domain !== ALLOWED_DOMAIN) {
    return `Only @${ALLOWED_DOMAIN} email addresses are allowed.`
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const domainError = validateDomain(email)
    if (domainError) return { error: domainError }

    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const domainError = validateDomain(email)
    if (domainError) return { error: domainError }

    const { error } = await supabaseBrowser.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }

  const signInWithMagicLink = async (email: string) => {
    const domainError = validateDomain(email)
    if (domainError) return { error: domainError }

    const { error } = await supabaseBrowser.auth.signInWithOtp({ email })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signUpWithEmail, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
