'use client'

import { useState, useEffect } from 'react'
import { useCoins } from '@/hooks/useCoins'
import MiniChart from '@/components/MiniChart'

interface HomeProps {
  navigate: (page: 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc') => void
}

const STEPS = [
  { n: '01', icon: '👤', title: 'Create Account',  desc: 'Sign up in under 2 minutes with just your email.' },
  { n: '02', icon: '✅', title: 'Verify Identity',  desc: 'Fast AI-powered KYC — most done in under 5 minutes.' },
  { n: '03', icon: '💳', title: 'Deposit Funds',    desc: 'Fund via card, bank transfer, SEPA, SWIFT, or crypto.' },
  { n: '04', icon: '🚀', title: 'Start Trading',    desc: 'Access 300+ markets, earn rewards, or go leveraged.' },
]

export default function Home({ navigate }: HomeProps) {
  const { coins, lastUpdated } = useCoins()
  const [marketTab, setMarketTab] = useState('gainers')
  const [payAmt, setPayAmt] = useState('500')
  const [getAmt, setGetAmt] = useState('0.004838')
  const [countdown, setCountdown] = useState(30)

  const btcPrice = coins.find(c => c.sym === 'BTC')?.price ?? 103_247

  useEffect(() => {
    const id = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (lastUpdated) setCountdown(30)
  }, [lastUpdated])

  const handlePay = (v: string) => {
    setPayAmt(v)
    setGetAmt(((parseFloat(v) || 0) / btcPrice).toFixed(6))
  }

  const tickerCoins = [...coins, ...coins]

  const displayCoins = marketTab === 'gainers'
    ? [...coins].sort((a, b) => b.change - a.change)
    : marketTab === 'decliners'
    ? [...coins].sort((a, b) => a.change - b.change)
    : [...coins].sort(() => Math.random() - 0.5)

  return (
    <>
      <style>{`
        .home-page { animation: fadeUp .5s ease both; }
        .ticker-track { animation: ticker 45s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        .widget-float { animation: floatY 7s ease-in-out infinite; }
        .market-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          cursor: pointer;
          transition: transform .2s, border-color .2s, box-shadow .2s;
        }
        .market-card:hover {
          transform: translateY(-3px);
          border-color: var(--border-accent);
          box-shadow: var(--glow-cyan);
        }
        .step-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          padding: 32px 24px;
          transition: background .2s, border-color .2s;
        }
        .step-card:hover { background: rgba(0,212,255,0.04); border-color: var(--border-accent); }
        .widget-cta {
          width: 100%; padding: 15px; margin-top: 14px; border: none;
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-green) 100%);
          color: var(--bg-base);
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          font-size: 15px; font-weight: 800;
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
        }
        .widget-cta:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,212,255,0.3); }
        .cta-main {
          padding: 16px 44px; border-radius: 999px; border: none;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
          color: var(--bg-base);
          font-family: var(--font-display); font-size: 15px; font-weight: 800;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: transform .15s, box-shadow .2s;
        }
        .cta-main:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,212,255,0.35); }
        .cta-outline {
          padding: 16px 44px; border-radius: 999px;
          border: 1px solid var(--border); background: transparent;
          color: var(--text-primary);
          font-family: var(--font-display); font-size: 15px; font-weight: 600;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: border-color .2s, background .2s;
        }
        .cta-outline:hover { border-color: var(--border-accent); background: rgba(0,212,255,0.06); }
        .pulse-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent-cyan);
          animation: pulse 2s ease-in-out infinite;
          display: inline-block;
        }
        .home-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 768px) {
          .home-container { padding: 0 20px; }
        }
        .hero-section {
          display: flex;
          align-items: center;
          padding: 100px 0 80px;
          gap: 60px;
          min-height: calc(100vh - 104px);
          position: relative;
        }
        @media (max-width: 1024px) {
          .hero-section {
            flex-direction: column;
            padding: 60px 0;
            gap: 40px;
            min-height: auto;
          }
        }
        .hero-content { flex: 1; }
        @media (max-width: 1024px) {
          .hero-content { text-align: center; }
        }
        .hero-cta-buttons {
          display: flex;
          gap: 16px;
          margin-bottom: 56px;
        }
        @media (max-width: 1024px) {
          .hero-cta-buttons { justify-content: center; margin-bottom: 40px; }
        }
        @media (max-width: 480px) {
          .hero-cta-buttons { flex-direction: column; gap: 12px; }
          .cta-main, .cta-outline { padding: 14px 32px; text-align: center; width: 100%; }
        }
        .hero-stats {
          display: flex;
          gap: 48px;
        }
        @media (max-width: 1024px) {
          .hero-stats { justify-content: center; }
        }
        @media (max-width: 480px) {
          .hero-stats { gap: 24px; flex-wrap: wrap; }
        }
        .trade-widget {
          flex-shrink: 0;
          width: 400px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          backdrop-filter: blur(30px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), var(--glow-cyan);
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 1024px) {
          .trade-widget { width: 100%; max-width: 420px; animation: none !important; }
        }
        @media (max-width: 480px) {
          .trade-widget { padding: 24px; }
        }
        .market-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .market-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .market-grid { grid-template-columns: 1fr; }
        }
        .market-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
        }
        @media (max-width: 768px) {
          .market-header { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
        .market-tabs {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.04);
          border-radius: var(--radius-sm);
          padding: 4px;
        }
        @media (max-width: 480px) {
          .market-tabs { width: 100%; }
          .market-tabs button { flex: 1; padding: 7px 10px !important; font-size: 11px !important; }
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        @media (max-width: 900px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr; }
          .step-card { border-radius: var(--radius-sm) !important; }
        }
        .final-cta {
          border-radius: 28px;
          padding: 80px 60px;
          text-align: center;
          background: linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(245,166,35,0.05) 100%);
          border: 1px solid var(--border-accent);
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .final-cta { padding: 60px 24px; border-radius: 20px; }
        }
        @media (max-width: 480px) {
          .final-cta { padding: 48px 20px; }
        }
        .final-cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          position: relative;
        }
        @media (max-width: 480px) {
          .final-cta-buttons { flex-direction: column; gap: 12px; }
        }
      `}</style>

      <div className="home-page" style={{ paddingTop: 68 }}>

        {/* ── PRICE TICKER ── */}
        <div style={{
          background: 'rgba(8,12,20,0.95)',
          borderBottom: '1px solid var(--border)',
          height: 36, overflow: 'hidden',
          display: 'flex', alignItems: 'center',
        }}>
          <div className="ticker-track" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
            {tickerCoins.map((c, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0 28px', fontSize: 12, fontWeight: 500,
                borderRight: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
              }}>
                <span style={{ color: c.color, fontSize: 14 }}>{c.icon}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.sym}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.priceStr}</span>
                <span style={{ color: c.up ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 11 }}>
                  {c.changeStr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <div className="home-container">
          <div style={{
            position: 'absolute', top: 68, left: '50%', transform: 'translateX(-50%)',
            width: 800, height: 600, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="hero-section">
            <div className="hero-content">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 999,
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.2)',
                fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)',
                marginBottom: 28, letterSpacing: 1, textTransform: 'uppercase',
              }}>
                <span className="pulse-dot" />
                Live on 185+ Countries
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 72px)',
                fontWeight: 800, lineHeight: 1.02,
                letterSpacing: '-3px', marginBottom: 24,
              }}>
                Trade{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-green) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Crypto</span>
                <br />
                Built for{' '}
                <span style={{ color: 'var(--accent-amber)' }}>2026</span>
              </h1>

              <p style={{
                fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8,
                maxWidth: 460, marginBottom: 44,
              }}>
                369xchange gives you the fastest, most secure platform to buy, sell,
                trade and earn crypto — with up to 20x leverage and real-time markets.
              </p>

              <div className="hero-cta-buttons">
                <button onClick={() => navigate('signup')} className="cta-main">Start Trading Free</button>
                <button onClick={() => navigate('trade')} className="cta-outline">Live Markets</button>
              </div>

              <div className="hero-stats">
                {[['$7.5B+', 'Total Volume'], ['15M+', 'Users'], ['300+', 'Markets']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700,
                      color: 'var(--text-primary)', letterSpacing: '-1px',
                    }}>{val}</div>
                    <div style={{
                      fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600,
                      marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase',
                    }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade Widget */}
            <div className="trade-widget widget-float">
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-green), transparent)',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Buy Bitcoin</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {countdown}s refresh
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', letterSpacing: 0.5 }}>
                  YOU PAY
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                  <input
                    type="text"
                    value={payAmt}
                    onChange={e => handlePay(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>USD</span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', letterSpacing: 0.5 }}>
                  YOU GET
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                  <input
                    type="text"
                    value={getAmt}
                    readOnly
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>BTC</span>
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span>Rate</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>1 BTC ≈ ${btcPrice.toLocaleString()}</span>
              </div>

              <button className="widget-cta" onClick={() => navigate('signup')}>
                Buy BTC →
              </button>
            </div>
          </div>
        </div>

        {/* ── MARKETS ── */}
        <section id="markets" style={{ padding: '100px 0' }}>
          <div className="home-container">
            <div className="market-header">
              <div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 8 }}>
                  Live Markets
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time prices from global exchanges</p>
              </div>

              <div className="market-tabs">
                {['gainers', 'decliners', 'trending'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setMarketTab(tab)}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
                      background: marketTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
                      color: marketTab === tab ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                    }}
                  >
                    {tab === 'gainers' ? '📈 ' : tab === 'decliners' ? '📉 ' : '🔥 '}{tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="market-grid">
              {displayCoins.slice(0, 8).map(c => (
                <button key={c.id} className="market-card" onClick={() => navigate('trade')} style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 22, color: c.color }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.sym}</div>
                    </div>
                  </div>
                  <MiniChart up={c.up} />
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.priceStr}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: c.up ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {c.changeStr}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '80px 0' }}>
          <div className="home-container">
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 12 }}>
                Start in 4 Simple Steps
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                From signup to first trade in under 10 minutes
              </p>
            </div>

            <div className="steps-grid">
              {STEPS.map((s, i) => (
                <div key={i} className="step-card" style={{
                  borderRadius: i === 0 ? '20px 0 0 20px' : i === 3 ? '0 20px 20px 0' : 0,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 16, letterSpacing: 2 }}>
                    STEP {s.n}
                  </div>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: '40px 0 100px' }}>
          <div className="home-container">
            <div className="final-cta">
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 20 }}>
                Ready to Trade?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
                Join millions of traders on the platform built for 2026 and beyond.
              </p>
              <div className="final-cta-buttons">
                <button onClick={() => navigate('signup')} className="cta-main">Create Free Account</button>
                <button onClick={() => navigate('trade')} className="cta-outline">Explore Markets</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '60px 0 40px' }}>
          <div className="home-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
                <span style={{ color: 'var(--text-primary)' }}>369</span>
                <span style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>x</span>
                <span style={{ color: 'var(--text-primary)' }}>change</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                © 2026 369xchange. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
