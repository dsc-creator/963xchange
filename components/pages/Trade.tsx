'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useCoins } from '@/hooks/useCoins'

interface TradeProps {
  navigate: (page: 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc') => void
}

export default function Trade({ navigate }: TradeProps) {
  const { user } = useAuth()
  const { balance } = usePortfolio()
  const { coins } = useCoins()

  const [selectedCoin, setSelectedCoin] = useState('ETH')
  const [orderType, setOrderType] = useState('market')
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')

  const coin = coins.find(c => c.sym === selectedCoin) || coins[0]
  const currentMarketPrice = coin?.price || 0

  const suggestedBuyPrice = Math.round(currentMarketPrice * 0.95)
  const suggestedSellPrice = Math.round(currentMarketPrice * 1.05)

  const effectivePrice = orderType === 'limit'
    ? parseFloat(limitPrice || String(side === 'buy' ? suggestedBuyPrice : suggestedSellPrice))
    : currentMarketPrice

  if (!user) return null

  const handlePlaceOrder = () => {
    if (!amount) {
      alert('Please enter amount')
      return
    }
    alert(
      `✅ Order Placed!\n\n` +
      `Type: ${side.toUpperCase()} ${orderType.toUpperCase()}\n` +
      `Coin: ${selectedCoin}\n` +
      `Amount: ${amount} ${selectedCoin}\n` +
      `Price: $${effectivePrice.toLocaleString()}\n` +
      `Total: ~$${(parseFloat(amount) * effectivePrice).toFixed(2)}`
    )
  }

  return (
    <>
      <style>{`
        .trade-page { margin-top: 68px; min-height: calc(100vh - 68px); background: var(--bg-base); }
        .trade-balance-bar {
          padding: 12px 24px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .trade-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .trade-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .trade-layout { grid-template-columns: 1fr; gap: 24px; }
          .trade-inner { padding: 20px 16px; }
          .trade-order-panel { position: static !important; }
        }
        .market-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: 12px 20px;
          background: var(--bg-surface);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .market-table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          align-items: center;
          text-align: left;
          transition: background 0.2s;
        }
        @media (max-width: 600px) {
          .market-table-header { grid-template-columns: 2fr 1fr 1fr; padding: 10px 14px; }
          .market-table-row { grid-template-columns: 2fr 1fr 1fr; padding: 14px; }
          .col-volume { display: none; }
        }
        @media (max-width: 400px) {
          .market-table-header { grid-template-columns: 2fr 1fr; }
          .market-table-row { grid-template-columns: 2fr 1fr; }
          .col-change { display: none; }
        }
      `}</style>

      <div className="trade-page">
        <div className="trade-balance-bar">
          <strong style={{ color: 'var(--text-primary)' }}>Balance: ${balance.toLocaleString()}</strong>
          <button
            onClick={() => navigate('dashboard')}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Deposit Funds
          </button>
        </div>

        <div className="trade-inner">
          <div className="trade-layout">

            {/* Market Overview */}
            <div>
              <h2 style={{ marginBottom: 24 }}>Markets</h2>
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                overflow: 'hidden',
              }}>
                <div className="market-table-header">
                  <div>Asset</div>
                  <div style={{ textAlign: 'right' }}>Market Price</div>
                  <div style={{ textAlign: 'right' }} className="col-change">24h Change</div>
                  <div style={{ textAlign: 'right' }} className="col-volume">Volume</div>
                </div>

                {coins.slice(0, 8).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCoin(c.sym)}
                    className="market-table-row"
                    style={{
                      width: '100%',
                      background: selectedCoin === c.sym ? 'rgba(0,212,255,0.08)' : 'transparent',
                      border: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `${c.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: c.color, flexShrink: 0,
                      }}>
                        {c.icon}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.sym}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>
                      {c.priceStr}
                    </div>
                    <div className="col-change" style={{
                      textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13,
                      color: c.up ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                      {c.changeStr}
                    </div>
                    <div className="col-volume" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: 13 }}>
                      {c.volume}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Panel */}
            <div
              className="trade-order-panel"
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 16,
                border: '1px solid var(--border)',
                padding: 24,
                position: 'sticky',
                top: 88,
              }}
            >
              <h3 style={{ marginBottom: 20, textAlign: 'center' }}>
                Trade {coin?.name || selectedCoin}
              </h3>

              {/* Buy/Sell Toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['buy', 'sell'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    style={{
                      flex: 1, padding: 12,
                      background: side === s
                        ? (s === 'buy' ? 'var(--accent-green)' : 'var(--accent-red)')
                        : 'var(--bg-surface)',
                      color: side === s ? (s === 'buy' ? '#000' : '#fff') : 'var(--text-primary)',
                      border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Order Type */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  ORDER TYPE
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['market', 'limit'].map(type => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      style={{
                        flex: 1, padding: 10,
                        background: orderType === type ? 'rgba(0,212,255,0.15)' : 'var(--bg-surface)',
                        color: orderType === type ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        border: orderType === type ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
                        borderRadius: 8, fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', textTransform: 'uppercase',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  AMOUNT ({selectedCoin})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%', padding: 14,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-primary)',
                    fontSize: 16, fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Limit Price */}
              {orderType === 'limit' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, display: 'block' }}>
                    LIMIT PRICE (USD) — Suggested: ${side === 'buy' ? suggestedBuyPrice.toLocaleString() : suggestedSellPrice.toLocaleString()}
                  </label>
                  <input
                    type="number"
                    value={limitPrice || (side === 'buy' ? suggestedBuyPrice : suggestedSellPrice)}
                    onChange={e => setLimitPrice(e.target.value)}
                    style={{
                      width: '100%', padding: 14,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, color: 'var(--text-primary)',
                      fontSize: 16, fontFamily: 'var(--font-mono)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <small style={{ color: side === 'buy' ? 'var(--accent-green)' : 'var(--accent-cyan)', fontSize: 12 }}>
                    {side === 'buy'
                      ? `Buying below market price`
                      : `Selling above market price`
                    }
                  </small>
                </div>
              )}

              {/* Order Summary */}
              <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Market Price</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    ${currentMarketPrice.toLocaleString()}
                  </span>
                </div>
                {orderType === 'limit' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Limit Price</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      ${effectivePrice.toLocaleString()}
                    </span>
                  </div>
                )}
                {amount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ~${(parseFloat(amount) * effectivePrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!amount}
                style={{
                  width: '100%', padding: 18,
                  background: side === 'buy'
                    ? (amount ? 'var(--accent-green)' : '#334155')
                    : (amount ? 'var(--accent-red)' : '#334155'),
                  color: amount ? (side === 'buy' ? '#000' : '#fff') : '#666',
                  border: 'none', borderRadius: 12,
                  fontSize: 16, fontWeight: 700,
                  cursor: amount ? 'pointer' : 'not-allowed',
                }}
              >
                {side === 'buy' ? 'BUY' : 'SELL'} {selectedCoin}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
