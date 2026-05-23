'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAllDeposits,
  adminConfirmDeposit,
  adminRejectDeposit,
  DepositRecord,
  DepositStatus,
} from '@/lib/deposits'
import { usePortfolio } from '@/hooks/usePortfolio'

// ─── Admin credentials (change these!) ────────────────────────────────────────
const ADMIN_PASSWORD = 'admin369x2024'

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
      padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      color: m.color, background: m.bg, border: `1px solid ${m.color}40`,
      textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color }} />
      {m.label}
    </span>
  )
}

const CRYPTO_ICONS: Record<string, { icon: string; color: string }> = {
  BTC:  { icon: '₿', color: '#f7931a' },
  ETH:  { icon: 'Ξ', color: '#627eea' },
  SOL:  { icon: '◎', color: '#9945ff' },
  USDT: { icon: '₮', color: '#26a17b' },
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DepositModal({
  dep,
  onClose,
  onConfirm,
  onReject,
  processing,
}: {
  dep: DepositRecord
  onClose: () => void
  onConfirm: (id: string, note: string) => void
  onReject:  (id: string, note: string) => void
  processing: boolean
}) {
  const [note, setNote] = useState('')
  const c = CRYPTO_ICONS[dep.cryptoSymbol] ?? { icon: '●', color: '#94a3b8' }
  const canAction = dep.status === 'awaiting_confirmation' || dep.status === 'pending_payment'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }} onClick={onClose}>
      <div
        style={{ background: '#111827', border: '1px solid #1e2937', borderRadius: 18, width: '100%', maxWidth: 520, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'relative' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#00d4ff,#00e5a0,transparent)' }} />
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Deposit Details</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>ID: {dep.id}</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Amount */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${c.color}18`, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: c.color, fontWeight: 800 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{dep.cryptoAmount} {dep.cryptoSymbol}</div>
                <div style={{ fontSize: 14, color: '#64748b', fontFamily: 'monospace' }}>≈ ${dep.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
              </div>
            </div>

            {/* Info rows */}
            {[
              { label: 'User Email',   value: dep.userEmail },
              { label: 'User Name',    value: dep.userName },
              { label: 'Network',      value: dep.network },
              { label: 'Status',       value: <StatusBadge status={dep.status} /> },
              { label: 'Created',      value: new Date(dep.createdAt).toLocaleString() },
              { label: 'Expires',      value: new Date(dep.expiresAt).toLocaleString() },
              ...(dep.confirmedByUserAt ? [{ label: 'User confirmed at', value: new Date(dep.confirmedByUserAt).toLocaleString() }] : []),
              ...(dep.reviewedAt ? [{ label: 'Reviewed at', value: new Date(dep.reviewedAt).toLocaleString() }] : []),
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e2937', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>{row.value as React.ReactNode}</span>
              </div>
            ))}

            {/* Wallet address */}
            <div style={{ margin: '16px 0', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Wallet Address</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', wordBreak: 'break-all', lineHeight: 1.6 }}>{dep.walletAddress}</div>
            </div>

            {dep.adminNote && (
              <div style={{ padding: '10px 14px', background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                💬 Note: {dep.adminNote}
              </div>
            )}

            {/* Admin actions */}
            {canAction && (
              <div style={{ marginTop: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Admin Note (optional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Transaction verified on blockchain explorer"
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155',
                    borderRadius: 8, color: 'white', fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                    outline: 'none', boxSizing: 'border-box', marginBottom: 14,
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    onClick={() => onReject(dep.id, note)}
                    disabled={processing}
                    style={{
                      padding: '12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.4)',
                      borderRadius: 10, color: '#f87171', fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer',
                      opacity: processing ? 0.6 : 1,
                    }}
                  >{processing ? '…' : '✕ Reject'}</button>
                  <button
                    onClick={() => onConfirm(dep.id, note)}
                    disabled={processing}
                    style={{
                      padding: '12px', background: 'linear-gradient(135deg,#059669,#34d399)', border: 'none',
                      borderRadius: 10, color: '#000', fontWeight: 800, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer',
                      opacity: processing ? 0.6 : 1,
                    }}
                  >{processing ? '…' : '✓ Confirm Deposit'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('369x_admin') === 'yes'
  })
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  const [deposits, setDeposits]       = useState<DepositRecord[]>([])
  const [loading, setLoading]         = useState(false)
  const [filterStatus, setFilterStatus] = useState<DepositStatus | 'all'>('all')
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState<DepositRecord | null>(null)
  const [processing, setProcessing]   = useState(false)
  const [toast, setToast]             = useState('')

  // Use portfolio hook to credit balance when confirming (matches the existing system)
  // We call depositCrypto on the targeted user — since we can't import usePortfolio
  // for a different user, we update Firestore + track locally. The user's next
  // dashboard load will reflect updated balance via Firestore-confirmed status.
  // (Balance crediting happens via a listener in a real prod app; here we keep
  //  it consistent with the manual review flow.)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const deps = await getAllDeposits()
      setDeposits(deps)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (authed) load() }, [authed, load])

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('369x_admin', 'yes')
      setAuthed(true)
    } else {
      setPwError('Incorrect password.')
      setTimeout(() => setPwError(''), 3000)
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleConfirm = async (id: string, note: string) => {
    setProcessing(true)
    try {
      await adminConfirmDeposit(id, note)
      setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'confirmed', adminNote: note, reviewedAt: new Date().toISOString() } : d))
      setSelected(null)
      showToast('✅ Deposit confirmed! User balance will be credited.')
    } catch (e) { console.error(e) } finally { setProcessing(false) }
  }

  const handleReject = async (id: string, note: string) => {
    setProcessing(true)
    try {
      await adminRejectDeposit(id, note)
      setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected', adminNote: note, reviewedAt: new Date().toISOString() } : d))
      setSelected(null)
      showToast('❌ Deposit rejected.')
    } catch (e) { console.error(e) } finally { setProcessing(false) }
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = deposits.filter(d => {
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q || d.userEmail.toLowerCase().includes(q) || d.userName.toLowerCase().includes(q) || d.cryptoSymbol.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total:    deposits.length,
    awaiting: deposits.filter(d => d.status === 'awaiting_confirmation').length,
    pending:  deposits.filter(d => d.status === 'pending_payment').length,
    confirmed:deposits.filter(d => d.status === 'confirmed').length,
    rejected: deposits.filter(d => d.status === 'rejected').length,
    totalUsd: deposits.filter(d => d.status === 'confirmed').reduce((s, d) => s + d.usdAmount, 0),
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{
          width: '100%', maxWidth: 400, background: '#111827', border: '1px solid #1e2937',
          borderRadius: 18, padding: 40, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#f87171,#fbbf24,transparent)' }} />
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Admin Panel</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>369xchange · Deposit Management</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Admin Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              style={{
                width: '100%', padding: '13px 16px', background: '#0f172a', border: '1px solid #334155',
                borderRadius: 10, color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
            {pwError && <div style={{ padding: '8px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 7, fontSize: 13, color: '#f87171', marginBottom: 12 }}>{pwError}</div>}
            <button
              onClick={handleLogin}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#f87171,#fbbf24)', color: '#000', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
            >Access Admin Panel →</button>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .adm-row:hover { background: rgba(255,255,255,.03) !important; cursor:pointer; }
        .adm-filter:hover { opacity:.85; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: '#1e2937', border: '1px solid #334155', borderRadius: 10, padding: '12px 24px',
          fontSize: 14, fontWeight: 600, color: '#f1f5f9', zIndex: 2000,
          animation: 'slideIn .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,.4)',
        }}>{toast}</div>
      )}

      {/* Modal */}
      {selected && (
        <DepositModal
          dep={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
          processing={processing}
        />
      )}

      <div style={{ minHeight: '100vh', background: '#070b14', color: 'white', padding: 'clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: 28 }}>🛡️</span>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>Admin Panel</div>
                <div style={{ padding: '2px 10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: 0.5 }}>Restricted</div>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Deposit Management · 369xchange</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={load} disabled={loading} style={{ padding: '9px 18px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8, color: '#00d4ff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? '…' : '↻ Refresh'}
              </button>
              <button
                onClick={() => { sessionStorage.removeItem('369x_admin'); setAuthed(false) }}
                style={{ padding: '9px 18px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Logout</button>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total Deposits',   value: stats.total,     color: '#f1f5f9' },
              { label: 'Awaiting Review',  value: stats.awaiting,  color: '#60a5fa' },
              { label: 'Pending Payment',  value: stats.pending,   color: '#fbbf24' },
              { label: 'Confirmed',        value: stats.confirmed, color: '#34d399' },
              { label: 'Rejected',         value: stats.rejected,  color: '#f87171' },
              { label: 'Total Confirmed',  value: `$${stats.totalUsd.toLocaleString(undefined,{maximumFractionDigits:0})}`, color: '#34d399' },
            ].map(s => (
              <div key={s.label} style={{ background: '#111827', border: '1px solid #1e2937', borderRadius: 12, padding: '18px 16px', animation: 'fadeIn .3s ease both' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email, name, crypto…"
              style={{ flex: 1, minWidth: 220, padding: '9px 14px', background: '#111827', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'awaiting_confirmation', 'pending_payment', 'confirmed', 'rejected', 'expired'] as const).map(s => {
                const active = filterStatus === s
                const meta = s === 'all' ? { color: '#f1f5f9', label: 'All' } : { color: STATUS_META[s].color, label: STATUS_META[s].label }
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className="adm-filter"
                    style={{
                      padding: '7px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: active ? `${meta.color}18` : 'transparent',
                      border: `1px solid ${active ? meta.color + '50' : '#334155'}`,
                      color: active ? meta.color : '#475569',
                      textTransform: 'uppercase', letterSpacing: 0.5, transition: 'all .15s',
                    }}
                  >{meta.label}</button>
                )
              })}
            </div>
          </div>

          {/* Awaiting confirmation highlight */}
          {stats.awaiting > 0 && (
            <div style={{
              padding: '14px 18px', background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.3)',
              borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
              animation: 'fadeIn .3s ease both',
            }}>
              <span style={{ fontSize: 18 }}>🔔</span>
              <span style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600 }}>
                {stats.awaiting} deposit{stats.awaiting !== 1 ? 's' : ''} awaiting your confirmation — click to review.
              </span>
            </div>
          )}

          {/* Table */}
          <div style={{ background: '#111827', border: '1px solid #1e2937', borderRadius: 16, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.2fr 1fr 1.4fr 1fr 1fr',
              padding: '14px 20px',
              borderBottom: '1px solid #1e2937',
              fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8,
            }}>
              {['User', 'Amount', 'Crypto', 'Network', 'Date', 'Status'].map(h => (
                <div key={h}>{h}</div>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: 36, height: 36, border: '4px solid #00d4ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <div style={{ color: '#64748b', fontSize: 14 }}>Loading deposits…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ fontWeight: 600 }}>No deposits found</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters.</div>
              </div>
            ) : (
              filtered.map((dep, i) => {
                const c = CRYPTO_ICONS[dep.cryptoSymbol] ?? { icon: '●', color: '#94a3b8' }
                const isReviewable = dep.status === 'awaiting_confirmation'
                return (
                  <div
                    key={dep.id}
                    className="adm-row"
                    onClick={() => setSelected(dep)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.2fr 1fr 1.4fr 1fr 1fr',
                      padding: '16px 20px',
                      borderBottom: i < filtered.length - 1 ? '1px solid #1e2937' : 'none',
                      alignItems: 'center',
                      background: isReviewable ? 'rgba(96,165,250,0.03)' : 'transparent',
                      transition: 'background .15s',
                      borderLeft: isReviewable ? '3px solid rgba(96,165,250,0.5)' : '3px solid transparent',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{dep.userEmail}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{dep.userName}</div>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#00e5a0' }}>
                      ${dep.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ color: c.color, fontSize: 16, fontWeight: 800 }}>{c.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{dep.cryptoAmount}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{dep.cryptoSymbol}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{dep.network}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      <div>{new Date(dep.createdAt).toLocaleDateString()}</div>
                      <div>{new Date(dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div><StatusBadge status={dep.status} /></div>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#334155' }}>
            Showing {filtered.length} of {deposits.length} deposits · Click any row to review
          </div>
        </div>
      </div>
    </>
  )
}
