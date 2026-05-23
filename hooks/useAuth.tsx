'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface User {
  id: string
  email: string
  name: string
  photoURL?: string | null
  kyc: string
  createdAt: string
  portfolio: Record<string, { amount: number; avgBuy: number }>
  transactions: unknown[]
  isGoogleUser?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: () => Promise<User>
  signup: (email: string, password: string, name: string) => Promise<User>
  logout: () => void
  loading: boolean
  googleEnabled: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

function googleUserToAppUser(
  uid: string,
  email: string,
  displayName: string | null,
  photoURL: string | null,
  existingUsers: Record<string, User & { password?: string }>
): User {
  const key = (email || uid).toLowerCase()

  if (existingUsers[key]) {
    const { password: _, ...safe } = existingUsers[key]
    return { ...safe, name: safe.name || displayName || 'Google User', photoURL }
  }

  return {
    id: uid,
    email,
    name: displayName || 'Google User',
    photoURL,
    kyc: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
    portfolio: { USDT: { amount: 0, avgBuy: 1 } },
    transactions: [],
    isGoogleUser: true,
  }
}

function persistUser(
  appUser: User,
  existingUsers: Record<string, User & { password?: string }>,
  setUser: (u: User) => void
) {
  const key = (appUser.email || appUser.id).toLowerCase()
  existingUsers[key] = appUser
  localStorage.setItem('369x_users', JSON.stringify(existingUsers))
  setUser(appUser)
  localStorage.setItem('369x_user', JSON.stringify(appUser))
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const s = localStorage.getItem('369x_user')
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // On mount: restore session + check for Google redirect result
  useEffect(() => {
    let mounted = true

    async function init() {
      // Restore from localStorage
      try {
        const s = localStorage.getItem('369x_user')
        if (s && mounted) setUser(JSON.parse(s))
      } catch {
        // ignore
      }

      // Check if we're returning from a signInWithRedirect flow
      if (auth) {
        try {
          const result = await getRedirectResult(auth)
          if (result && mounted) {
            const fu = result.user
            const existingUsers: Record<string, User & { password?: string }> = JSON.parse(
              localStorage.getItem('369x_users') || '{}'
            )
            const appUser = googleUserToAppUser(
              fu.uid,
              fu.email ?? '',
              fu.displayName,
              fu.photoURL,
              existingUsers
            )
            persistUser(appUser, existingUsers, setUser)
          }
        } catch (err) {
          console.warn('getRedirectResult error (safe to ignore if no redirect was in progress):', err)
        }
      }

      if (mounted) setLoading(false)
    }

    init()
    return () => { mounted = false }
  }, [])

  const hasFirebase = auth !== null
  const googleEnabled = hasFirebase

  const loginWithGoogle = async (): Promise<User> => {
    if (!hasFirebase) {
      throw new Error('Google sign-in is not configured. Please contact support.')
    }

    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })

    // Use redirect on mobile (more reliable), popup on desktop
    if (isMobile()) {
      await signInWithRedirect(auth!, provider)
      // This line is never reached — the page will reload after redirect
      return {} as User
    }

    // Desktop: popup flow
    try {
      const result = await signInWithPopup(auth!, provider)
      const fu = result.user
      const existingUsers: Record<string, User & { password?: string }> = JSON.parse(
        localStorage.getItem('369x_users') || '{}'
      )
      const appUser = googleUserToAppUser(
        fu.uid,
        fu.email ?? '',
        fu.displayName,
        fu.photoURL,
        existingUsers
      )
      persistUser(appUser, existingUsers, setUser)
      return appUser
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''

      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        throw new Error('Sign-in cancelled. Please try again.')
      }
      if (code === 'auth/popup-blocked') {
        // Fall back to redirect when popup is blocked
        await signInWithRedirect(auth!, provider)
        return {} as User
      }
      if (code === 'auth/unauthorized-domain') {
        throw new Error(
          'This domain is not authorised for Google sign-in. ' +
          'Add it in Firebase Console → Authentication → Settings → Authorised domains.'
        )
      }
      if (code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.')
      }
      if (code === 'auth/operation-not-allowed') {
        throw new Error(
          'Google sign-in is not enabled. ' +
          'Enable it in Firebase Console → Authentication → Sign-in method → Google.'
        )
      }
      throw new Error((err as Error)?.message ?? 'Google sign-in failed. Please try again.')
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    const existingUsers = JSON.parse(localStorage.getItem('369x_users') || '{}')
    if (existingUsers[email.toLowerCase()]) {
      throw new Error('Account already exists with this email')
    }

    const newUser: User & { password?: string } = {
      id: 'usr_' + Date.now(),
      email,
      name,
      kyc: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      portfolio: { USDT: { amount: 0, avgBuy: 1 } },
      transactions: [],
    }

    existingUsers[email.toLowerCase()] = { ...newUser, password }
    localStorage.setItem('369x_users', JSON.stringify(existingUsers))
    setUser(newUser)
    localStorage.setItem('369x_user', JSON.stringify(newUser))
    return newUser
  }

  const login = async (email: string, password: string): Promise<User> => {
    const existingUsers = JSON.parse(localStorage.getItem('369x_users') || '{}')
    const found = existingUsers[email.toLowerCase()]

    if (!found || found.password !== password) {
      throw new Error('Invalid email or password')
    }

    const { password: _, ...safeUser } = found
    setUser(safeUser)
    localStorage.setItem('369x_user', JSON.stringify(safeUser))
    return safeUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('369x_user')
    localStorage.removeItem('kyc_completed')
    if (auth) {
      import('firebase/auth').then(({ signOut }) => signOut(auth!).catch(() => {}))
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, signup, logout, loading, googleEnabled }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
