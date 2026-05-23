'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

interface LoginProps {
  navigate: (page: 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc') => void
}

export default function Login({ navigate }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, loginWithGoogle, googleEnabled } = useAuth()

  const afterAuth = () => {
    const kycCompleted = localStorage.getItem('kyc_completed') === 'true'
    navigate(kycCompleted ? 'dashboard' : 'kyc')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      afterAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!googleEnabled) return
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      afterAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(24px, 5vw, 40px)',
        position: 'relative', overflow: 'hidden',
        animation: 'fadeUp .4s ease both',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)' }} />

        <button onClick={() => navigate('home')} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 32, background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
            <span style={{ color: 'var(--text-primary)' }}>369</span>
            <span style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>x</span>
            <span style={{ color: 'var(--text-primary)' }}>change</span>
          </div>
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
          Log in to access your portfolio and trade.
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={!googleEnabled || googleLoading}
          title={!googleEnabled ? 'Google sign-in is not configured' : undefined}
          style={{
            width: '100%',
            padding: '13px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: googleEnabled ? '#fff' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${googleEnabled ? 'rgba(0,0,0,0.1)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: googleEnabled ? '#3c4043' : 'var(--text-tertiary)',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            fontWeight: 500,
            cursor: googleEnabled ? (googleLoading ? 'not-allowed' : 'pointer') : 'not-allowed',
            opacity: (!googleEnabled || googleLoading) ? 0.5 : 1,
            transition: 'background .2s, box-shadow .2s',
            marginBottom: googleEnabled ? 20 : 8,
          }}
        >
          <GoogleIcon />
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {!googleEnabled && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 16 }}>
            Google sign-in requires Firebase configuration. Use email below.
          </p>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 0.5 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: 15,
                outline: 'none', transition: 'border-color .2s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 0.5 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: 15,
                outline: 'none', transition: 'border-color .2s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.3)',
              fontSize: 13, color: 'var(--accent-red)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px', border: 'none', borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
              color: 'var(--bg-base)',
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity .2s, transform .15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Logging in...' : 'Log In →'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 24 }}>
          {"Don't have an account? "}
          <button onClick={() => navigate('signup')} style={{ color: 'var(--accent-cyan)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Sign Up</button>
        </p>
      </div>
    </div>
  )
}
