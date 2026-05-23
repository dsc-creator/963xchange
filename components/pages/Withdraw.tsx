'use client'

import { useState } from 'react'
import { usePortfolio, CryptoSymbol } from '@/hooks/usePortfolio'

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc' | 'deposit' | 'withdraw'

interface WithdrawProps {
  navigate: (page: Page) => void
}

const CRYPTO_CONFIG: Record<CryptoSymbol, {
  name: string
  network: string
  color: string
  icon: string
  fee: number
  price: number
  decimals: number
  addressPlaceholder: string
}> = {
  BTC: {
    name: 'Bitcoin',
    network: 'Bitcoin Network',
    color: '#f7931a',
    icon: '₿',
    fee: 0.00005,
    price: 76500,
    decimals: 6,
    addressPlaceholder: 'bc1q... or 1... or 3...',
  },
  ETH: {
    name: 'Ethereum',
    network: 'Ethereum (ERC-20)',
    color: '#627eea',
    icon: 'Ξ',
    fee: 0.002,
    price: 2100,
    decimals: 6,
    addressPlaceholder: '0x...',
  },
  SOL: {
    name: 'Solana',
    network: 'Solana Network',
    color: '#9945ff',
    icon: '◎',
    fee: 0.000025,
    price: 180,
    decimals: 4,
    addressPlaceholder: 'Base58 address...',
  },
  USDT: {
    name: 'Tether',
    network: 'TRON (TRC-20)',
    color: '#26a17b',
    icon: '₮',
    fee: 2,
    price: 1,
    decimals: 2,
    addressPlaceholder: 'T...',
  },
}

const SYMBOLS: CryptoSymbol[] = ['BTC', 'ETH', 'SOL', 'USDT']

export default function Withdraw({ navigate }: WithdrawProps) {
  const { cryptoHoldings, withdrawCrypto } = usePortfolio()
  const [selectedSym, setSelectedSym] = useState<CryptoSymbol>('BTC')
  const [address, setAddress] = useState('')
  const [rawAmount, setRawAmount] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [error, setError] = useState('')

  const cfg = CRYPTO_CONFIG[selectedSym]
  const available = cryptoHoldings?.[selectedSym] ?? 0
  const cryptoAmount = parseFloat(rawAmount) || 0
  const fee = cfg.fee
  const netAmount = Math.max(0, cryptoAmount - fee)
  const netUsd = netAmount * cfg.price
  const feeUsd = fee * cfg.price

  const maxWithdraw = Math.max(0, available - fee)

  const handleMax = () => {
    setRawAmount(maxWithdraw > 0 ? maxWithdraw.toFixed(cfg.decimals) : '0')
  }

  const isAddressValid = address.trim().length >= 10
  const isAmountValid = cryptoAmount > 0 && cryptoAmount <= available && netAmount > 0
  const canProceed = isAddressValid && isAmountValid

  const handleConfirm = () => {
    if (!canProceed) return
    setError('')
    try {
      withdrawCrypto(selectedSym, cryptoAmount, cryptoAmount * cfg.price, address.trim())
      setStep('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Withdrawal failed')
      setStep('form')
    }
  }

  const handleTabChange = (sym: CryptoSymbol) => {
    setSelectedSym(sym)
    setRawAmount('')
    setAddress('')
    setError('')
    setStep('form')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070b14',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button
            onClick={() => navigate('dashboard')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid #334155',
              borderRadius: 10,
              color: '#94a3b8',
              padding: '9px 16px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
            <span style={{ color: '#f1f5f9' }}>369</span>
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #00e5a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>x</span>
            <span style={{ color: '#f1f5f9' }}>change</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#111827',
          border: '1px solid #1e2937',
          borderRadius: 18,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #f7931a, #627eea, transparent)' }} />

          <div style={{ padding: '32px 32px 0' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Withdraw Crypto</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
              Send crypto from your wallet to an external address.
            </p>
          </div>

          {/* Crypto tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e2937', padding: '0 32px' }}>
            {SYMBOLS.map(sym => {
              const c = CRYPTO_CONFIG[sym]
              const bal = cryptoHoldings?.[sym] ?? 0
              const isEmpty = bal <= 0
              return (
                <button
                  key={sym}
                  onClick={() => handleTabChange(sym)}
                  style={{
                    flex: 1,
                    padding: '12px 4px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: selectedSym === sym ? `2px solid ${c.color}` : '2px solid transparent',
                    color: selectedSym === sym ? c.color : isEmpty ? '#334155' : '#475569',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    opacity: isEmpty ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span>{sym}</span>
                </button>
              )
            })}
          </div>

          <div style={{ padding: '28px 32px 32px' }}>

            {/* Available balance */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              background: '#0f172a',
              border: `1px solid ${cfg.color}30`,
              borderRadius: 10,
              marginBottom: 24,
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>
                  Available to Withdraw
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: available > 0 ? cfg.color : '#475569' }}>
                  {available.toFixed(cfg.decimals)} {selectedSym}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>≈ USD</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
                  ${(available * cfg.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {available <= 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>No {selectedSym} balance</div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
                  Deposit {selectedSym} first before withdrawing.
                </div>
                <button
                  onClick={() => navigate('deposit')}
                  style={{
                    padding: '10px 22px',
                    background: 'linear-gradient(135deg, #00d4ff, #00e5a0)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Deposit {selectedSym} →
                </button>
              </div>
            ) : step === 'success' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#00e5a0', marginBottom: 8 }}>
                  Withdrawal Submitted!
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>
                  {cryptoAmount} {selectedSym} sent to
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#64748b',
                  wordBreak: 'break-all',
                  padding: '8px 12px',
                  background: '#0f172a',
                  borderRadius: 8,
                  margin: '8px 0 20px',
                }}>
                  {address}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 24 }}>
                  Net received: <strong style={{ color: '#f1f5f9' }}>{netAmount.toFixed(cfg.decimals)} {selectedSym}</strong>{' '}
                  (after {fee} {selectedSym} network fee)
                </div>
                <button
                  onClick={() => navigate('dashboard')}
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #00d4ff, #00e5a0)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            ) : step === 'confirm' ? (
              <>
                {/* Confirmation view */}
                <div style={{
                  padding: '20px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Confirm Withdrawal
                  </div>

                  {[
                    { label: 'You send', value: `${cryptoAmount} ${selectedSym}`, sub: `$${(cryptoAmount * cfg.price).toFixed(2)}` },
                    { label: 'Network fee', value: `${fee} ${selectedSym}`, sub: `$${feeUsd.toFixed(2)}` },
                    { label: 'Recipient receives', value: `${netAmount.toFixed(cfg.decimals)} ${selectedSym}`, sub: `$${netUsd.toFixed(2)}`, highlight: true },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 12,
                      marginBottom: 12,
                      borderBottom: '1px solid #1e2937',
                    }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{row.label}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: row.highlight ? '#00e5a0' : '#f1f5f9', fontSize: 14 }}>
                          {row.value}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{row.sub}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>To address</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', wordBreak: 'break-all', lineHeight: 1.5 }}>
                      {address}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#fca5a5',
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}>
                  ⚠️ Withdrawals are irreversible. Double-check the address — sending to the wrong address will result in permanent loss of funds.
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setStep('form')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'transparent',
                      border: '1px solid #334155',
                      borderRadius: 10,
                      color: '#94a3b8',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    ← Edit
                  </button>
                  <button
                    onClick={handleConfirm}
                    style={{
                      flex: 2,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #f7931a, #ff6b35)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm Withdrawal →
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Destination address */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}>
                    Destination Wallet Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder={cfg.addressPlaceholder}
                    spellCheck={false}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      background: '#0f172a',
                      border: `1px solid ${address.length > 0 && !isAddressValid ? '#ef4444' : '#334155'}`,
                      borderRadius: 10,
                      color: 'white',
                      fontSize: 14,
                      fontFamily: 'monospace',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = cfg.color }}
                    onBlur={e => { e.target.style.borderColor = address.length > 0 && !isAddressValid ? '#ef4444' : '#334155' }}
                  />
                  {address.length > 0 && !isAddressValid && (
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>
                      Enter a valid {selectedSym} wallet address
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                    }}>
                      Amount
                    </label>
                    <button
                      onClick={handleMax}
                      style={{
                        padding: '3px 10px',
                        background: `${cfg.color}18`,
                        border: `1px solid ${cfg.color}40`,
                        borderRadius: 6,
                        color: cfg.color,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      MAX
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={rawAmount}
                      onChange={e => setRawAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="any"
                      style={{
                        width: '100%',
                        padding: '13px 72px 13px 16px',
                        background: '#0f172a',
                        border: `1px solid ${rawAmount && !isAmountValid ? '#ef4444' : '#334155'}`,
                        borderRadius: 10,
                        color: 'white',
                        fontSize: 20,
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = cfg.color }}
                      onBlur={e => { e.target.style.borderColor = rawAmount && !isAmountValid ? '#ef4444' : '#334155' }}
                    />
                    <span style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 800,
                      fontSize: 14,
                      color: cfg.color,
                      pointerEvents: 'none',
                    }}>
                      {selectedSym}
                    </span>
                  </div>
                  {rawAmount && cryptoAmount > available && (
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>
                      Exceeds available balance ({available.toFixed(cfg.decimals)} {selectedSym})
                    </div>
                  )}
                </div>

                {/* Fee breakdown */}
                {cryptoAmount > 0 && (
                  <div style={{
                    padding: '14px 16px',
                    background: '#0f172a',
                    border: '1px solid #1e2937',
                    borderRadius: 10,
                    marginBottom: 20,
                    fontSize: 13,
                  }}>
                    {[
                      { label: 'You send', val: `${cryptoAmount} ${selectedSym}`, usd: `$${(cryptoAmount * cfg.price).toFixed(2)}` },
                      { label: 'Network fee', val: `− ${fee} ${selectedSym}`, usd: `$${feeUsd.toFixed(2)}` },
                      { label: 'Recipient gets', val: `${netAmount.toFixed(cfg.decimals)} ${selectedSym}`, usd: `$${netUsd.toFixed(2)}`, green: true },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#475569' }}>{row.label}</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'monospace', color: row.green ? '#00e5a0' : '#f1f5f9', fontWeight: 600 }}>{row.val}</span>
                          <span style={{ color: '#334155', fontSize: 11, marginLeft: 6 }}>{row.usd}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!cryptoAmount && <div style={{ marginBottom: 20 }} />}

                {error && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#fca5a5',
                    marginBottom: 16,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={() => setStep('confirm')}
                  disabled={!canProceed}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: canProceed
                      ? 'linear-gradient(135deg, #f7931a, #ff6b35)'
                      : '#1e2937',
                    color: canProceed ? '#fff' : '#475569',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: canProceed ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                >
                  {!isAddressValid && !rawAmount
                    ? 'Enter address and amount'
                    : !isAddressValid
                    ? 'Enter a valid address'
                    : !isAmountValid
                    ? 'Enter a valid amount'
                    : `Review Withdrawal →`}
                </button>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 16 }}>
          🔒 Withdrawals are processed on-chain and cannot be reversed
        </p>
      </div>
    </div>
  )
}
