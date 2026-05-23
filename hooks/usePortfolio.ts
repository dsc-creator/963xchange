'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export type CryptoSymbol = 'BTC' | 'ETH' | 'SOL' | 'USDT'
export type CryptoHoldings = Record<CryptoSymbol, number>

const DEFAULT_HOLDINGS: CryptoHoldings = { BTC: 0, ETH: 0, SOL: 0, USDT: 0 }

export const usePortfolio = () => {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHoldings>(DEFAULT_HOLDINGS)
  const [transactions, setTransactions] = useState<Array<{
    id: number
    type: string
    amount: number
    crypto?: string
    cryptoAmount?: number
    toAddress?: string
    date: string
  }>>([])

  useEffect(() => {
    if (!user) {
      setBalance(0)
      setCryptoHoldings(DEFAULT_HOLDINGS)
      setTransactions([])
      return
    }

    const savedBalance = localStorage.getItem(`balance_${user.id}`)
    const savedHoldings = localStorage.getItem(`holdings_${user.id}`)
    const savedTx = localStorage.getItem(`tx_${user.id}`)

    if (savedBalance) setBalance(parseFloat(savedBalance))
    if (savedHoldings) setCryptoHoldings({ ...DEFAULT_HOLDINGS, ...JSON.parse(savedHoldings) })
    if (savedTx) setTransactions(JSON.parse(savedTx))
  }, [user])

  const deposit = (amount: number | string) => {
    if (!user) return
    const newBalance = balance + Number(amount)

    setBalance(newBalance)
    localStorage.setItem(`balance_${user.id}`, String(newBalance))

    const newTx = {
      id: Date.now(),
      type: 'deposit',
      amount: Number(amount),
      date: new Date().toISOString(),
    }

    const updatedTx = [newTx, ...transactions]
    setTransactions(updatedTx)
    localStorage.setItem(`tx_${user.id}`, JSON.stringify(updatedTx))
  }

  const depositCrypto = (crypto: CryptoSymbol, cryptoAmount: number, usdValue: number) => {
    if (!user) return

    const newBalance = balance + usdValue
    setBalance(newBalance)
    localStorage.setItem(`balance_${user.id}`, String(newBalance))

    const newHoldings: CryptoHoldings = {
      ...cryptoHoldings,
      [crypto]: (cryptoHoldings[crypto] || 0) + cryptoAmount,
    }
    setCryptoHoldings(newHoldings)
    localStorage.setItem(`holdings_${user.id}`, JSON.stringify(newHoldings))

    const newTx = {
      id: Date.now(),
      type: 'deposit',
      amount: usdValue,
      crypto,
      cryptoAmount,
      date: new Date().toISOString(),
    }
    const updatedTx = [newTx, ...transactions]
    setTransactions(updatedTx)
    localStorage.setItem(`tx_${user.id}`, JSON.stringify(updatedTx))
  }

  const withdrawCrypto = (crypto: CryptoSymbol, cryptoAmount: number, usdValue: number, toAddress: string) => {
    if (!user) return
    if ((cryptoHoldings[crypto] || 0) < cryptoAmount) {
      throw new Error(`Insufficient ${crypto} balance`)
    }

    const newBalance = Math.max(0, balance - usdValue)
    setBalance(newBalance)
    localStorage.setItem(`balance_${user.id}`, String(newBalance))

    const newHoldings: CryptoHoldings = {
      ...cryptoHoldings,
      [crypto]: Math.max(0, (cryptoHoldings[crypto] || 0) - cryptoAmount),
    }
    setCryptoHoldings(newHoldings)
    localStorage.setItem(`holdings_${user.id}`, JSON.stringify(newHoldings))

    const newTx = {
      id: Date.now(),
      type: 'withdrawal',
      amount: usdValue,
      crypto,
      cryptoAmount,
      toAddress,
      date: new Date().toISOString(),
    }
    const updatedTx = [newTx, ...transactions]
    setTransactions(updatedTx)
    localStorage.setItem(`tx_${user.id}`, JSON.stringify(updatedTx))
  }

  const resetPortfolio = () => {
    if (!user) return
    setBalance(0)
    setCryptoHoldings(DEFAULT_HOLDINGS)
    setTransactions([])
    localStorage.removeItem(`balance_${user.id}`)
    localStorage.removeItem(`holdings_${user.id}`)
    localStorage.removeItem(`tx_${user.id}`)
  }

  return {
    balance,
    cryptoHoldings,
    portfolioValue: balance,
    transactions,
    deposit,
    depositCrypto,
    withdrawCrypto,
    resetPortfolio,
  }
}
