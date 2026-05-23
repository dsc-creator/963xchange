'use client'

import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Home from '@/components/pages/Home'
import Login from '@/components/pages/Login'
import Signup from '@/components/pages/Signup'
import Dashboard from '@/components/pages/Dashboard'
import Trade from '@/components/pages/Trade'
import KYC from '@/components/pages/KYC'
import Deposit from '@/components/pages/Deposit'
import Withdraw from '@/components/pages/Withdraw'
import Admin from '@/components/pages/Admin'

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc' | 'deposit' | 'withdraw' | 'admin'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const navigate = (page: Page) => {
    setCurrentPage(page)
    window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`)
  }

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || 'home'
      setCurrentPage(path as Page)
    }
    window.addEventListener('popstate', handlePopState)

    const path = window.location.pathname.slice(1) || 'home'
    const validPages: Page[] = ['home', 'login', 'signup', 'dashboard', 'trade', 'kyc', 'deposit', 'withdraw', 'admin']
    if (validPages.includes(path as Page)) {
      setCurrentPage(path as Page)
    }

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (loading) return

    // Admin page is always accessible (has its own auth)
    if (currentPage === 'admin') return

    if (user && (currentPage === 'login' || currentPage === 'signup')) {
      navigate('dashboard'); return
    }

    if (!user && ['dashboard', 'trade', 'deposit', 'withdraw'].includes(currentPage)) {
      navigate('login'); return
    }

    if (user && ['dashboard', 'trade'].includes(currentPage)) {
      const kycCompleted = localStorage.getItem('kyc_completed') === 'true'
      const kycSkipped   = localStorage.getItem('kyc_skipped') === 'true'
      if (!kycCompleted && !kycSkipped) { navigate('kyc'); return }
      if (currentPage === 'trade' && !kycCompleted) { navigate('dashboard'); return }
    }
  }, [user, loading, currentPage])

  const hideNavOn: Page[] = ['login', 'signup', 'kyc', 'deposit', 'withdraw', 'admin']
  const showNav = !hideNavOn.includes(currentPage)

  if (loading && currentPage !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14' }}>
        <div style={{ width: 50, height: 50, border: '5px solid #00d4ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // Admin panel: completely standalone, no auth dependency
  if (currentPage === 'admin') return <Admin />

  return (
    <>
      {showNav && <Navbar user={user} navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'home'      && <Home      navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'login'     && <Login     navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'signup'    && <Signup    navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'kyc'       && <KYC       navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'deposit'   && <Deposit   navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'withdraw'  && <Withdraw  navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'dashboard' && <Dashboard navigate={(p) => navigate(p as Page)} />}
      {currentPage === 'trade'     && <Trade     navigate={(p) => navigate(p as Page)} />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
