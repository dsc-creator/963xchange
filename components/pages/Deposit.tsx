'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCoins } from '@/hooks/useCoins'
import {
  createDepositRequest,
  markUserDeposited,
  markDepositExpired,
  getUserDeposits,
  DepositRecord,
  DepositStatus,
} from '@/lib/deposits'

// ─── Constants ────────────────────────────────────────────────────────────────

type CryptoSymbol = 'BTC' | 'ETH' | 'SOL' | 'USDT'

const CRYPTOS = [
  {
    symbol: 'BTC' as CryptoSymbol,
    coinId: 'bitcoin',
    name: 'Bitcoin',
    network: 'Bitcoin Network',
    address: 'bc1q9ccum5jf5l5gpsvnze3nx29zz4zaljguvzq69z',
    color: '#f7931a',
    icon: '₿',
    warning: 'Only send BTC via the Bitcoin network.',
  },
  {
    symbol: 'ETH' as CryptoSymbol,
    coinId: 'ethereum',
    name: 'Ethereum',
    network: 'Ethereum (ERC-20)',
    address: '0x7bf9050572f99adc9ec72faf2a13160efe7b65fd',
    color: '#627eea',
    icon: 'Ξ',
    warning: 'Only send ETH on the Ethereum network.',
  },
  {
    symbol: 'SOL' as CryptoSymbol,
    coinId: 'solana',
    name: 'Solana',
    network: 'Solana Network',
    address: '8serwSZefVHvVLyDTbZ6EE8KdefuP7sTE4NZDfjmLbCL',
    color: '#9945ff',
    icon: '◎',
    warning: 'Only send SOL on the Solana network.',
  },
  {
    symbol: 'USDT' as CryptoSymbol,
    coinId: 'tether',
    name: 'Tether',
    network: 'TRON (TRC-20)',
    address: 'TPjbMwzdGbXgqPJWgXAr75bMSWWr7L4zut',
    color: '#26a17b',
    icon: '₮',
    warning: 'Only send USDT via the TRON (TRC-20) network.',
  },
]

const TIMER_MS = 30 * 60 * 1000 // 30 minutes

// ─── Status badge ─────────────────────────────────────────────────────────────

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
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      color: m.color, background: m.bg, border: `1px solid ${m.color}40`,
      textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
      {m.label}
    </span>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [ms, setMs] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()))
  const expiredRef = useRef(false)

  useEffect(() => {
    if (ms === 0 && !expiredRef.current) { expiredRef.current = true; onExpire(); return }
    const id = setInterval(() => {
      setMs(prev => {
        const next = Math.max(0, new Date(expiresAt).getTime() - Date.now())
        if (next === 0 && !expiredRef.current) { expiredRef.current = true; clearInterval(id); onExpire() }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  const pct = ms / TIMER_MS
  const urgent = ms < 60000

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
        Session expires in
      </div>
      <div style={{
        fontSize: 42, fontFamily: 'monospace', fontWeight: 800,
        color: urgent ? '#f87171' : '#00e5a0',
        animation: urgent ? 'pulse 1s ease-in-out infinite' : 'none',
      }}>
        {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
      </div>
      {/* progress bar */}
      <div style={{ height: 4, background: '#1e2937', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct * 100}%`,
          background: urgent
            ? 'linear-gradient(90deg,#f87171,#ef4444)'
            : 'linear-gradient(90deg,#00d4ff,#00e5a0)',
          transition: 'width 1s linear, background 0.5s',
        }} />
      </div>
    </div>
  )
}

// ─── QR Code ─────────────────────────────────────────────────────────────────

function QRCode({ address }: { address: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 14, display: 'inline-flex', margin: '0 auto' }}>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(address)}&bgcolor=ffffff&color=000000&margin=1`}
        alt="Wallet QR"
        width={160} height={160}
        style={{ borderRadius: 6, display: 'block' }}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc' | 'deposit' | 'withdraw'

type View = 'form' | 'session' | 'done' | 'history'

interface DepositProps {
  navigate: (page: Page) => void
}

export default function Deposit({ navigate }: DepositProps) {
  const { user } = useAuth()
  const { coins } = useCoins()

  // ── Form state ──────────────────────────────────────────────────────────────
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // ── Active session ──────────────────────────────────────────────────────────
  const [activeDeposit, setActiveDeposit] = useState<DepositRecord | null>(null)
  const [view, setView] = useState<View>('form')
  const [copied, setCopied] = useState(false)
  const [deposited, setDeposited] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)

  // ── History ─────────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<DepositRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => { if (!user) navigate('login') }, [user])
  if (!user) return null

  const crypto = CRYPTOS[selectedIdx]
  const liveCoin = coins.find(c => c.id === crypto.coinId)
  const livePrice = liveCoin?.price ?? (
    crypto.symbol === 'BTC' ? 103000 : crypto.symbol === 'ETH' ? 2200
    : crypto.symbol === 'SOL' ? 133 : 1
  )
  const cryptoAmount = parseFloat(amount) || 0
  const usdValue = cryptoAmount * livePrice

  // ── Load history ────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const deps = await getUserDeposits(user.id)
      setHistory(deps)
    } catch (e) {
      console.error(e)
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  // ── Start deposit session ───────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!cryptoAmount || cryptoAmount <= 0) { setFormError('Enter a valid amount.'); return }
    setFormError('')
    setSubmitting(true)
    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + TIMER_MS)

      const record: Omit<DepositRecord, 'id'> = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        cryptoSymbol: crypto.symbol,
        cryptoAmount,
        usdAmount: usdValue,
        network: crypto.network,
        walletAddress: crypto.address,
        status: 'pending_payment',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }

      const id = await createDepositRequest(record)
      setActiveDeposit({ id, ...record })
      setView('session')
      setDeposited(false)
    } catch (e) {
      setFormError('Failed to create deposit. Check your connection and try again.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  // ── User confirms they sent ─────────────────────────────────────────────────
  const handleIHaveDeposited = async () => {
    if (!activeDeposit) return
    setSessionLoading(true)
    try {
      await markUserDeposited(activeDeposit.id)
      setActiveDeposit(prev => prev ? { ...prev, status: 'awaiting_confirmation' } : prev)
      setDeposited(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSessionLoading(false)
    }
  }

  // ── Timer expired ───────────────────────────────────────────────────────────
  const handleExpired = useCallback(async () => {
    if (!activeDeposit || deposited) return
    try {
      await markDepositExpired(activeDeposit.id)
      setActiveDeposit(prev => prev ? { ...prev, status: 'expired' } : prev)
    } catch (e) { console.error(e) }
  }, [activeDeposit, deposited])

  // ── Copy address ────────────────────────────────────────────────────────────
  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .dep-tab { transition: all .2s; }
        .dep-tab:hover { opacity:.8 !important; }
        .dep-btn-primary { transition: transform .15s, box-shadow .2s, opacity .2s; }
        .dep-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,212,255,.3); }
        .dep-history-row:hover { background: rgba(255,255,255,.03) !important; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#070b14', color: 'white',
        padding: '24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 560, paddingTop: 12 }}>

          {/* ── Top Bar ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => navigate('dashboard')}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid #334155',
                  borderRadius: 10, color: '#94a3b8', padding: '9px 16px',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >← Back</button>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
                <span style={{ color: '#f1f5f9' }}>369</span>
                <span style={{ background: 'linear-gradient(135deg,#00d4ff,#00e5a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>x</span>
                <span style={{ color: '#f1f5f9' }}>change</span>
              </div>
            </div>
            <button
              onClick={async () => { setView('history'); loadHistory() }}
              style={{
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
                borderRadius: 8, color: '#00d4ff', padding: '8px 16px',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >📋 Deposit History</button>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: FORM                                                 */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'form' && (
            <div style={{
              background: '#111827', border: '1px solid #1e2937', borderRadius: 18,
              overflow: 'hidden', position: 'relative', animation: 'fadeUp .35s ease both',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#00d4ff,#00e5a0,transparent)' }} />

              <div style={{ padding: '32px 32px 0' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Deposit Crypto</h1>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                  Select your coin, enter the amount you plan to send, and follow the instructions.
                </p>
              </div>

              {/* Network tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #1e2937', padding: '0 32px' }}>
                {CRYPTOS.map((c, i) => (
                  <button
                    key={c.symbol}
                    onClick={() => { setSelectedIdx(i); setAmount(''); setFormError('') }}
                    className="dep-tab"
                    style={{
                      flex: 1, padding: '12px 4px', background: 'transparent', border: 'none',
                      borderBottom: selectedIdx === i ? `2px solid ${c.color}` : '2px solid transparent',
                      color: selectedIdx === i ? c.color : '#475569',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span>{c.symbol}</span>
                  </button>
                ))}
              </div>

              <div style={{ padding: '28px 32px 32px' }}>
                {/* Network badge + price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                    background: `${crypto.color}18`, border: `1px solid ${crypto.color}40`,
                    borderRadius: 999, fontSize: 12, fontWeight: 600, color: crypto.color,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: crypto.color, display: 'inline-block' }} />
                    {crypto.network}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    1 {crypto.symbol} = <span style={{ color: '#00e5a0', fontWeight: 700, fontFamily: 'monospace' }}>${livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Amount input */}
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Amount to deposit
                </label>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setFormError('') }}
                    placeholder="0.00"
                    min="0" step="any"
                    style={{
                      width: '100%', padding: '14px 72px 14px 16px',
                      background: '#0f172a', border: '1px solid #334155', borderRadius: 10,
                      color: 'white', fontSize: 20, fontFamily: 'monospace',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = crypto.color }}
                    onBlur={e => { e.target.style.borderColor = '#334155' }}
                  />
                  <span style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    fontWeight: 800, fontSize: 14, color: crypto.color, pointerEvents: 'none',
                  }}>{crypto.symbol}</span>
                </div>

                {/* USD preview */}
                {cryptoAmount > 0 && (
                  <div style={{
                    padding: '12px 14px', background: 'rgba(0,229,160,0.06)',
                    border: '1px solid rgba(0,229,160,0.2)', borderRadius: 8, marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>USD equivalent</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#00e5a0', fontFamily: 'monospace' }}>
                        ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {formError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 13, color: '#f87171', marginBottom: 14 }}>
                    {formError}
                  </div>
                )}

                {/* Warning */}
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: '#fca5a5', lineHeight: 1.6, marginBottom: 22 }}>
                  ⚠️ {crypto.warning}
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!cryptoAmount || cryptoAmount <= 0 || submitting}
                  className="dep-btn-primary"
                  style={{
                    width: '100%', padding: '15px', border: 'none', borderRadius: 12,
                    background: cryptoAmount > 0 ? 'linear-gradient(135deg,#00d4ff,#00e5a0)' : '#1e2937',
                    color: cryptoAmount > 0 ? '#000' : '#475569',
                    fontWeight: 800, fontSize: 15,
                    cursor: cryptoAmount > 0 && !submitting ? 'pointer' : 'not-allowed',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Creating session…' : cryptoAmount > 0 ? `Continue — Deposit ${cryptoAmount} ${crypto.symbol} →` : 'Enter an amount to continue'}
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: SESSION                                              */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'session' && activeDeposit && (() => {
            const dep = activeDeposit
            const isExpiredState = dep.status === 'expired'
            const isAwaitingConf = dep.status === 'awaiting_confirmation'
            const c = CRYPTOS.find(x => x.symbol === dep.cryptoSymbol) ?? CRYPTOS[0]

            return (
              <div style={{ animation: 'fadeUp .35s ease both' }}>
                {/* Header card */}
                <div style={{
                  background: '#111827', border: '1px solid #1e2937', borderRadius: 18,
                  padding: '28px 28px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#00d4ff,#00e5a0,transparent)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Deposit Amount</div>
                      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>
                        {dep.cryptoAmount} {dep.cryptoSymbol}
                      </div>
                      <div style={{ fontSize: 14, color: '#64748b', fontFamily: 'monospace' }}>
                        ≈ ${dep.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </div>
                    </div>
                    <StatusBadge status={dep.status} />
                  </div>

                  <div style={{
                    display: 'flex', gap: 20, fontSize: 13, color: '#64748b',
                    borderTop: '1px solid #1e2937', paddingTop: 14, flexWrap: 'wrap',
                  }}>
                    <span>Network: <span style={{ color: c.color, fontWeight: 600 }}>{dep.network}</span></span>
                    <span>Ref: <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{dep.id.slice(0, 12)}…</span></span>
                  </div>
                </div>

                {/* Expired state */}
                {isExpiredState && (
                  <div style={{
                    background: '#111827', border: '1px solid #1e2937', borderRadius: 18,
                    padding: '36px 28px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>⏰</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#94a3b8', marginBottom: 10 }}>Session Expired</div>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                      Your deposit window has expired. Please start a new deposit if you still want to send funds.
                    </div>
                    <button
                      onClick={() => { setView('form'); setActiveDeposit(null); setAmount('') }}
                      style={{
                        padding: '12px 28px', background: 'linear-gradient(135deg,#00d4ff,#00e5a0)',
                        color: '#000', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer',
                      }}
                    >Start New Deposit</button>
                  </div>
                )}

                {/* Awaiting confirmation state */}
                {isAwaitingConf && (
                  <div style={{
                    background: '#111827', border: '1px solid #1e2937', borderRadius: 18,
                    padding: '36px 28px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#60a5fa', marginBottom: 10 }}>Awaiting Confirmation</div>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 1.7 }}>
                      Your deposit has been submitted. Our team will review and confirm it shortly.
                      <br />Funds will reflect in your balance once confirmed.
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => { loadHistory(); setView('history') }}
                        style={{
                          padding: '11px 24px', background: 'rgba(96,165,250,0.1)',
                          border: '1px solid rgba(96,165,250,0.3)', borderRadius: 10,
                          color: '#60a5fa', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        }}
                      >📋 View Deposit History</button>
                      <button
                        onClick={() => navigate('dashboard')}
                        style={{
                          padding: '11px 24px', background: 'rgba(0,229,160,0.1)',
                          border: '1px solid rgba(0,229,160,0.3)', borderRadius: 10,
                          color: '#00e5a0', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        }}
                      >← Dashboard</button>
                    </div>
                  </div>
                )}

                {/* Active payment window */}
                {!isExpiredState && !isAwaitingConf && (
                  <div style={{
                    background: '#111827', border: '1px solid #1e2937', borderRadius: 18,
                    overflow: 'hidden',
                  }}>
                    {/* Timer */}
                    <div style={{ padding: '0 28px', borderBottom: '1px solid #1e2937' }}>
                      <Countdown expiresAt={dep.expiresAt} onExpire={handleExpired} />
                    </div>

                    <div style={{ padding: '24px 28px 28px' }}>
                      {/* QR + Address */}
                      <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ marginBottom: 16 }}>
                          <QRCode address={dep.walletAddress} />
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                          Send exactly {dep.cryptoAmount} {dep.cryptoSymbol} to
                        </div>
                        <div style={{
                          background: '#0f172a', border: '1px solid #334155', borderRadius: 10,
                          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, color: '#cbd5e1', wordBreak: 'break-all', textAlign: 'left' }}>
                            {dep.walletAddress}
                          </div>
                          <button
                            onClick={() => handleCopy(dep.walletAddress)}
                            style={{
                              flexShrink: 0, padding: '7px 13px',
                              background: copied ? 'rgba(0,229,160,0.15)' : 'rgba(0,212,255,0.12)',
                              border: `1px solid ${copied ? '#00e5a0' : '#00d4ff'}44`,
                              borderRadius: 7, color: copied ? '#00e5a0' : '#00d4ff',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >{copied ? '✓ Copied' : 'Copy'}</button>
                        </div>
                      </div>

                      {/* Steps */}
                      {[
                        { n: '1', text: 'Open your wallet or exchange app' },
                        { n: '2', text: `Send exactly ${dep.cryptoAmount} ${dep.cryptoSymbol} to the address above` },
                        { n: '3', text: 'Click "I Have Deposited" after sending' },
                      ].map(step => (
                        <div key={step.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color: '#00d4ff',
                          }}>{step.n}</div>
                          <div style={{ fontSize: 13, color: '#94a3b8', paddingTop: 3, lineHeight: 1.5 }}>{step.text}</div>
                        </div>
                      ))}

                      <div style={{ marginTop: 22 }}>
                        <button
                          onClick={handleIHaveDeposited}
                          disabled={sessionLoading}
                          className="dep-btn-primary"
                          style={{
                            width: '100%', padding: '15px', border: 'none', borderRadius: 12,
                            background: 'linear-gradient(135deg,#00d4ff,#00e5a0)',
                            color: '#000', fontWeight: 800, fontSize: 16,
                            cursor: sessionLoading ? 'not-allowed' : 'pointer',
                            opacity: sessionLoading ? 0.7 : 1,
                          }}
                        >
                          {sessionLoading ? 'Submitting…' : '✅ I Have Deposited'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#475569' }}>
                          Only click after you have sent the funds
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: HISTORY                                              */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'history' && (
            <div style={{ animation: 'fadeUp .35s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Deposit History</h2>
                <button
                  onClick={() => setView('form')}
                  style={{
                    padding: '9px 18px', background: 'linear-gradient(135deg,#00d4ff,#00e5a0)',
                    color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >+ New Deposit</button>
              </div>

              {/* Summary cards */}
              {history.length > 0 && (() => {
                const pending = history.filter(d => d.status === 'pending_payment' || d.status === 'awaiting_confirmation')
                const pendingUsd = pending.reduce((s, d) => s + d.usdAmount, 0)
                const confirmed = history.filter(d => d.status === 'confirmed')
                const confirmedUsd = confirmed.reduce((s, d) => s + d.usdAmount, 0)

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Total Deposits', value: history.length, sub: 'all time' },
                      { label: 'Pending', value: `$${pendingUsd.toLocaleString(undefined,{maximumFractionDigits:2})}`, sub: `${pending.length} deposit${pending.length !== 1 ? 's' : ''}`, color: '#fbbf24' },
                      { label: 'Confirmed', value: `$${confirmedUsd.toLocaleString(undefined,{maximumFractionDigits:2})}`, sub: `${confirmed.length} deposit${confirmed.length !== 1 ? 's' : ''}`, color: '#34d399' },
                    ].map(card => (
                      <div key={card.label} style={{ background: '#111827', border: '1px solid #1e2937', borderRadius: 12, padding: '16px 14px' }}>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{card.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: card.color ?? '#f1f5f9' }}>{card.value}</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{card.sub}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ width: 36, height: 36, border: '4px solid #00d4ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
              ) : history.length === 0 ? (
                <div style={{ background: '#111827', border: '1px solid #1e2937', borderRadius: 18, padding: '60px 28px', textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No deposits yet</div>
                  <div style={{ fontSize: 14, color: '#64748b' }}>Make your first deposit to get started.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {history.map(dep => {
                    const c = CRYPTOS.find(x => x.symbol === dep.cryptoSymbol) ?? CRYPTOS[0]
                    return (
                      <div
                        key={dep.id}
                        className="dep-history-row"
                        style={{
                          background: '#111827', border: '1px solid #1e2937', borderRadius: 14,
                          padding: '18px 20px', transition: 'background .2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: '50%',
                              background: `${c.color}18`, border: `1px solid ${c.color}40`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 18, color: c.color, fontWeight: 800, flexShrink: 0,
                            }}>{c.icon}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>
                                {dep.cryptoAmount} {dep.cryptoSymbol}
                              </div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{dep.network}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: '#00e5a0' }}>
                              ${dep.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <StatusBadge status={dep.status} />
                          </div>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', flexWrap: 'wrap', gap: 6 }}>
                          <span>{new Date(dep.createdAt).toLocaleString()}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>ID: {dep.id.slice(0, 16)}…</span>
                        </div>
                        {dep.adminNote && (
                          <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(148,163,184,0.07)', borderRadius: 7, fontSize: 12, color: '#94a3b8' }}>
                            💬 {dep.adminNote}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: '#1e2937', marginTop: 20 }}>
            🔒 All deposits are manually reviewed before funds are credited
          </p>
        </div>
      </div>
    </>
  )
}
