'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithMagicLink, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // If already logged in, redirect
  if (user) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'magic') {
        const { error } = await signInWithMagicLink(email)
        if (error) {
          setError(error)
        } else {
          setMagicLinkSent(true)
        }
      } else if (mode === 'signup') {
        const { error } = await signUpWithEmail(email, password)
        if (error) {
          setError(error)
        } else {
          setMagicLinkSent(true) // Confirm email
        }
      } else {
        const { error } = await signInWithEmail(email, password)
        if (error) {
          setError(error)
        } else {
          router.push('/')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="card max-w-sm w-full text-center py-8">
          <div className="text-4xl mb-4">✉</div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Check your email</h2>
          <p className="text-sm text-text-secondary mb-6">
            We sent a {mode === 'magic' ? 'magic link' : 'confirmation email'} to <strong>{email}</strong>
          </p>
          <button onClick={() => { setMagicLinkSent(false); setMode('signin') }} className="text-sm text-accent hover:underline">
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="card max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">KAP Intelligence</h1>
          <p className="text-meta mt-1">Sign in with your @campfire.co.uk email</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@campfire.co.uk"
              required
              className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent transition-colors"
            />
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-xs rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border space-y-2 text-center">
          {mode === 'signin' && (
            <>
              <button onClick={() => setMode('magic')} className="block w-full text-xs text-accent hover:underline">
                Sign in with magic link instead
              </button>
              <button onClick={() => setMode('signup')} className="block w-full text-xs text-text-secondary hover:text-text-primary">
                Need an account? Sign up
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => setMode('signin')} className="block w-full text-xs text-text-secondary hover:text-text-primary">
              Already have an account? Sign in
            </button>
          )}
          {mode === 'magic' && (
            <button onClick={() => setMode('signin')} className="block w-full text-xs text-text-secondary hover:text-text-primary">
              Sign in with password instead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
