'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePortfolio } from '@/hooks/usePortfolio'
import { getUserDeposits, DepositRecord, DepositStatus } from '@/lib/deposits'

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc' | 'deposit' | 'withdraw'
interface DashboardProps { navigate: (page: Page) => void }

const STATUS_META: Record<DepositStatus, { label: string; color: string; bg: string }> = {
  pending_payment:       { label: 'Pending Payment',       color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  awaiting_confirmation: { label: 'Awaiting Confirmation', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  confirmed:             { label: 'Confirmed',             color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  rejected:              { label: 'Rejected',              color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  expired:               { label: 'Expired',               color: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
}

function StatusBadge({ status }: { status: DepositStatus }) {
  const m = STATUS_META[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      color: m.color, background: m.bg, border: `1px solid ${m.color}40`,
      textTransform: 'uppercase', letterSpacing: 0.4,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: m.color }} />
      {m.label}
    </span>
  )
}

const CRYPTO_META: Record<string, { color: string; icon: string; price: number }> = {
  BTC:  { color: '#f7931a', icon: '₿', price: 103000 },
  ETH:  { color: '#627eea', icon: 'Ξ', price: 2200 },
  SOL:  { color: '#9945ff', icon: '◎', price: 133 },
  USDT: { color: '#26a17b', icon: '₮', price: 1 },
}

export default function Dashboard({ navigate }: DashboardProps) {
  const { user, logout } = useAuth()
  const { balance, cryptoHoldings, transactions } = usePortfolio()

  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [deposits, setDeposits] = useState<DepositRecord[]>([])
  const [depositsLoading, setDepositsLoading] = useState(false)

  const kycCompleted = typeof window !== 'undefined' && localStorage.getItem('kyc_completed') === 'true'
  const kycSkipped   = typeof window !== 'undefined' && localStorage.getItem('kyc_skipped') === 'true'
  const showKycBanner = !kycCompleted && kycSkipped && !bannerDismissed

  const loadDeposits = useCallback(async () => {
    if (!user) return
    setDepositsLoading(true)
    try {
      const deps = await getUserDeposits(user.id)
      setDeposits(deps)
    } catch (e) { console.error(e) } finally { setDepositsLoading(false) }
  }, [user])

  useEffect(() => { loadDeposits() }, [loadDeposits])

  const handleLogout = () => { logout(); navigate('home') }

  const pendingDeposits = deposits.filter(d =>
    d.status === 'pending_payment' || d.status === 'awaiting_confirmation'
  )
  const pendingUsd = pendingDeposits.reduce((s, d) => s + d.usdAmount, 0)
  const hasAnyHoldings = cryptoHoldings && Object.values(cryptoHoldings).some(v => v > 0)

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .dash-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; animation: fadeUp .3s ease both; }
        @media (max-width:480px) { .dash-card { padding: 18px !important; } }
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width:700px) { .dash-grid { grid-template-columns: 1fr; } }
        .dep-row:hover { background: rgba(255,255,255,.03) !important; }
        .cta-main { padding:12px 24px;border-radius:999px;border:none;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-green));color:var(--bg-base);font-family:var(--font-display);font-size:14px;font-weight:800;cursor:pointer;transition:transform .15s,box-shadow .2s; }
        .cta-main:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,212,255,.3); }
      `}</style>

      <div style={{ padding: 'clamp(80px,12vw,100px) clamp(16px,4vw,40px) 60px', maxWidth: 1280, margin: '0 auto' }}>

        {/* KYC Banner */}
        {showKycBanner && (
          <div style={{
            marginBottom: 28, padding: '16px 20px',
            background: 'rgba(251,188,5,0.08)', border: '1px solid rgba(251,188,5,0.35)',
            borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 22 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fbbf24', marginBottom: 2 }}>Identity verification required to trade</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Complete KYC to deposit funds, buy, sell, and trade crypto.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('kyc')} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Complete KYC →</button>
              <button onClick={() => setBannerDismissed(true)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: '4px 6px' }}>×</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,38px)', margin: 0 }}>Welcome back, {user.name?.split(' ')[0] || 'Trader'}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => kycCompleted ? navigate('trade') : navigate('kyc')}
              className="cta-main"
              style={!kycCompleted ? { opacity: .55, cursor: 'not-allowed', filter: 'grayscale(0.4)' } : {}}
            >{kycCompleted ? 'Start Trading' : '🔒 Verify to Trade'}</button>
            <button onClick={handleLogout} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14 }}>Logout</button>
          </div>
        </div>

        {/* ── Balance Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {/* Total Balance */}
          <div className="dash-card" style={{ borderTop: '2px solid #00d4ff' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Total Balance</div>
            <div style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: balance > 0 ? 'var(--accent-cyan)' : '#555', letterSpacing: -1 }}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Confirmed holdings</div>
          </div>

          {/* Pending Deposits */}
          <div className="dash-card" style={{ borderTop: `2px solid ${pendingDeposits.length > 0 ? '#fbbf24' : '#1e2937'}` }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Pending Deposits</div>
            <div style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: pendingDeposits.length > 0 ? '#fbbf24' : '#555', letterSpacing: -1 }}>
              ${pendingUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {pendingDeposits.length} pending · awaiting review
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('deposit')}
              style={{ padding: '12px', background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-green))', color: '#000', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
            >+ Deposit</button>
            <button
              onClick={() => navigate('withdraw')}
              style={{ padding: '12px', background: 'transparent', color: '#f7931a', border: '1px solid rgba(247,147,26,0.35)', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >Withdraw</button>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Pending Deposits Section */}
            <div className="dash-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17 }}>Pending Deposits</h3>
                <button onClick={() => navigate('deposit')} style={{ padding: '6px 14px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 7, color: '#fbbf24', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New</button>
              </div>

              {depositsLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #00d4ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
              ) : pendingDeposits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>No pending deposits</div>
                  <div style={{ fontSize: 13 }}>All your deposits have been processed.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingDeposits.map(dep => {
                    const meta = CRYPTO_META[dep.cryptoSymbol] ?? { color: '#94a3b8', icon: '●', price: 0 }
                    return (
                      <div
                        key={dep.id}
                        className="dep-row"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, transition: 'background .2s', flexWrap: 'wrap', gap: 8 }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${meta.color}18`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: meta.color, fontWeight: 800 }}>{meta.icon}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{dep.cryptoAmount} {dep.cryptoSymbol}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(dep.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>${dep.usdAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          <StatusBadge status={dep.status} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Assets */}
            <div className="dash-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17 }}>Your Assets</h3>
                <button onClick={() => navigate('deposit')} style={{ padding: '6px 14px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 7, color: 'var(--accent-cyan)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Deposit</button>
              </div>
              {!hasAnyHoldings ? (
                <div style={{ textAlign: 'center', padding: '44px 0', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💼</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>No confirmed assets yet</div>
                  <div style={{ fontSize: 13, marginBottom: 20 }}>Assets appear here after admin confirms your deposit.</div>
                  <button onClick={() => navigate('deposit')} style={{ padding: '10px 22px', background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-green))', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Make a Deposit →</button>
                </div>
              ) : (
                <div>
                  {(Object.entries(cryptoHoldings) as [string, number][]).filter(([, amt]) => amt > 0).map(([sym, amt]) => {
                    const meta = CRYPTO_META[sym]
                    const usdVal = amt * meta.price
                    return (
                      <div key={sym} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${meta.color}20`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: meta.color, fontWeight: 800 }}>{meta.icon}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{sym}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{amt.toFixed(sym === 'USDT' ? 2 : 6)} {sym}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@ ${meta.price.toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Deposit History */}
            <div className="dash-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 17 }}>Deposit History</h3>
                <button onClick={loadDeposits} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 15 }} title="Refresh">↻</button>
              </div>

              {depositsLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 24, height: 24, border: '3px solid #00d4ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
              ) : deposits.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No deposits yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {deposits.slice(0, 8).map(dep => {
                    const meta = CRYPTO_META[dep.cryptoSymbol] ?? { color: '#94a3b8', icon: '●' }
                    return (
                      <div key={dep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${meta.color}18`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: meta.color, fontWeight: 800, flexShrink: 0 }}>{meta.icon}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dep.cryptoAmount} {dep.cryptoSymbol}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{new Date(dep.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>${dep.usdAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          <StatusBadge status={dep.status} />
                        </div>
                      </div>
                    )
                  })}
                  {deposits.length > 8 && (
                    <button onClick={() => navigate('deposit')} style={{ fontSize: 12, color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}>
                      View all {deposits.length} deposits →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Recent Trades */}
            <div className="dash-card">
              <h3 style={{ marginBottom: 16, fontSize: 17 }}>Recent Activity</h3>
              {transactions.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No activity yet</p>
              ) : (
                transactions.slice(0, 5).map(tx => {
                  const cryptoMeta = tx.crypto ? CRYPTO_META[tx.crypto] : null
                  return (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {cryptoMeta && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${cryptoMeta.color}20`, border: `1px solid ${cryptoMeta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: cryptoMeta.color, fontWeight: 800, flexShrink: 0 }}>{cryptoMeta.icon}</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}{tx.crypto ? ` ${tx.crypto}` : ''}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: tx.type === 'deposit' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {tx.type === 'deposit' ? '+' : '-'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <button onClick={() => navigate('trade')} style={{ padding: '14px 44px', fontSize: 16, fontWeight: 700, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', cursor: 'pointer' }}>
            Go to Trading Terminal →
          </button>
        </div>
      </div>
    </>
  )
}
