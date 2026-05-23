'use client'

import { useState, useEffect } from 'react'

const COIN_IDS = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,tether,polkadot,avalanche-2'

export const COIN_META: Record<string, { sym: string; name: string; icon: string; color: string }> = {
  bitcoin:       { sym: 'BTC',  name: 'Bitcoin',    icon: '₿', color: '#f7931a' },
  ethereum:      { sym: 'ETH',  name: 'Ethereum',   icon: 'Ξ', color: '#627eea' },
  solana:        { sym: 'SOL',  name: 'Solana',     icon: '◎', color: '#9945ff' },
  binancecoin:   { sym: 'BNB',  name: 'BNB',        icon: 'B', color: '#f3ba2f' },
  ripple:        { sym: 'XRP',  name: 'XRP',        icon: '✕', color: '#00aae4' },
  cardano:       { sym: 'ADA',  name: 'Cardano',    icon: '₳', color: '#0066cc' },
  dogecoin:      { sym: 'DOGE', name: 'Dogecoin',   icon: 'Ð', color: '#c2a633' },
  tether:        { sym: 'USDT', name: 'Tether',     icon: '₮', color: '#26a17b' },
  polkadot:      { sym: 'DOT',  name: 'Polkadot',   icon: '●', color: '#e6007a' },
  'avalanche-2': { sym: 'AVAX', name: 'Avalanche',  icon: 'A', color: '#e84142' },
}

// Price offsets applied on top of the live market price
const PRICE_OFFSETS: Record<string, number> = {
  ethereum: 100,
  solana: 50,
}

// Fallback prices in case API fails (already include offsets)
const FALLBACKS: Record<string, number> = {
  bitcoin: 103247, ethereum: 2200, solana: 133, binancecoin: 612,
  ripple: 0.62, cardano: 0.44, dogecoin: 0.17, tether: 1.00,
  polkadot: 8.2, 'avalanche-2': 38.5,
}

function formatPrice(price: number) {
  if (price >= 1000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (price >= 1)    return '$' + price.toFixed(3)
  return '$' + price.toFixed(5)
}

export interface Coin {
  id: string
  sym: string
  name: string
  icon: string
  color: string
  price: number
  change: number
  up: boolean
  priceStr: string
  changeStr: string
  volume: string
  marketCap: string
  sparkline: number[]
}

export function useCoins() {
  const [coins, setCoins] = useState<Coin[]>(() =>
    Object.entries(COIN_META).map(([id, meta]) => ({
      id, ...meta,
      price: FALLBACKS[id] ?? 0,
      change: (Math.random() - 0.45) * 8,
      up: Math.random() > 0.45,
      priceStr: formatPrice(FALLBACKS[id] ?? 0),
      changeStr: '+0.00%',
      volume: '$' + (Math.random() * 5 + 0.5).toFixed(2) + 'B',
      marketCap: '$' + (Math.random() * 500 + 10).toFixed(0) + 'B',
      sparkline: Array.from({ length: 20 }, () => Math.random()),
    }))
  )
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      )
      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      setCoins(prev => prev.map(coin => {
        const d = data[coin.id]
        if (!d) return coin
        const change = d.usd_24h_change ?? coin.change
        // Apply per-coin price offset (ETH +$100, SOL +$50)
        const offset = PRICE_OFFSETS[coin.id] ?? 0
        const price  = (d.usd ?? coin.price) + offset
        return {
          ...coin,
          price,
          change,
          up: change >= 0,
          priceStr: formatPrice(price),
          changeStr: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
          volume: d.usd_24h_vol
            ? '$' + (d.usd_24h_vol / 1e9).toFixed(2) + 'B'
            : coin.volume,
          marketCap: d.usd_market_cap
            ? '$' + (d.usd_market_cap / 1e9).toFixed(0) + 'B'
            : coin.marketCap,
        }
      }))
      setLastUpdated(new Date())
      setLoading(false)
    } catch {
      setLoading(false)
      // keep previous state
    }
  }

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, 30_000)
    return () => clearInterval(id)
  }, [])

  return { coins, lastUpdated, loading, refetch: fetchPrices }
}
