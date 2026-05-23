'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  user: {
    email?: string
    name?: string
  } | null
  navigate: (page: 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc') => void
}

export default function Navbar({ user, navigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('home')
  }

  return (
    <>
      <style>{`
        .nav-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 68px;
          transition: all 0.35s ease;
        }
        .nav-container.scrolled {
          background: rgba(7,11,20,0.92);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
        }
        .nav-container:not(.scrolled) {
          background: transparent;
          backdrop-filter: none;
          border-bottom: 1px solid transparent;
        }
        .nav-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 40px;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 40px;
        }
        @media (max-width: 768px) {
          .nav-inner {
            padding: 0 20px;
            gap: 16px;
          }
        }
        .nav-links-desktop {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        @media (max-width: 900px) {
          .nav-links-desktop {
            display: none;
          }
        }
        .nav-right-desktop {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .nav-right-desktop {
            display: none;
          }
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          margin-left: auto;
        }
        @media (max-width: 900px) {
          .mobile-menu-btn {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
        }
        .mobile-menu-btn span {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
        }
        .mobile-menu-btn.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .mobile-menu-btn.open span:nth-child(2) {
          opacity: 0;
        }
        .mobile-menu-btn.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        .mobile-menu {
          display: none;
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(7,11,20,0.98);
          backdrop-filter: blur(24px);
          padding: 24px 20px;
          z-index: 999;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }
        @media (max-width: 900px) {
          .mobile-menu.open {
            display: flex;
          }
        }
        .mobile-nav-link {
          display: block;
          padding: 14px 16px;
          border-radius: var(--radius-sm);
          font-size: 16px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          background: transparent;
          border: none;
          text-align: left;
          width: 100%;
        }
        .mobile-nav-link:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }
        .mobile-menu-divider {
          height: 1px;
          background: var(--border);
          margin: 16px 0;
        }
        .mobile-auth-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
          padding-top: 20px;
        }
      `}</style>

      <nav className={`nav-container ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          {/* Logo */}
          <button onClick={() => navigate('home')} style={{ textDecoration: 'none', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
              letterSpacing: '-0.5px',
            }}>
              <span style={{ color: 'var(--text-primary)' }}>369</span>
              <span style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>x</span>
              <span style={{ color: 'var(--text-primary)' }}>change</span>
            </div>
          </button>

          {/* Desktop Nav links */}
          <div className="nav-links-desktop">
            <button onClick={() => navigate('home')} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all .2s',
            }}>Markets</button>
            <button onClick={() => navigate('trade')} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all .2s',
            }}>Trade</button>
          </div>

          {/* Desktop Right side */}
          <div className="nav-right-desktop">
            {user ? (
              <>
                <button onClick={() => navigate('dashboard')} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: 'var(--bg-base)',
                  }}>
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  Dashboard
                </button>
                <button onClick={handleLogout} style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all .2s',
                }}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('login')} style={{
                  padding: '7px 18px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}>Log In</button>
                <button onClick={() => navigate('signup')} style={{
                  padding: '8px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                  color: 'var(--bg-base)', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                }}>Get Started</button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-nav-link" onClick={() => { navigate('home'); setMenuOpen(false); }}>
          Markets
        </button>
        <button className="mobile-nav-link" onClick={() => { navigate('trade'); setMenuOpen(false); }}>
          Trade
        </button>

        <div className="mobile-menu-divider" />

        <div className="mobile-auth-section">
          {user ? (
            <>
              <button onClick={() => { navigate('dashboard'); setMenuOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.04)',
                fontSize: 15, fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: 'var(--bg-base)',
                }}>
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                Dashboard
              </button>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{
                padding: '14px 16px', borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-secondary)', 
                fontSize: 15, fontWeight: 500,
                cursor: 'pointer', width: '100%',
              }}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { navigate('login'); setMenuOpen(false); }} style={{
                display: 'block', textAlign: 'center',
                padding: '14px 20px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-primary)', fontSize: 15, fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}>Log In</button>
              <button onClick={() => { navigate('signup'); setMenuOpen(false); }} style={{
                display: 'block', textAlign: 'center',
                padding: '14px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                color: 'var(--bg-base)', fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
