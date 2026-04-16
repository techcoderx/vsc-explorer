import { useCallback, useEffect, useState } from 'react'
import { SupportedCurrency, SUPPORTED_CURRENCIES } from '../marketData'

const STORAGE_KEY = 'magi-currency'
const CURRENCY_EVENT = 'magi-currency-change'

function getStoredCurrency(): SupportedCurrency {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && (SUPPORTED_CURRENCIES as readonly string[]).includes(stored)) return stored as SupportedCurrency
  return 'usd'
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(getStoredCurrency)

  const setCurrency = useCallback((value: SupportedCurrency) => {
    localStorage.setItem(STORAGE_KEY, value)
    setCurrencyState(value)
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: value }))
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const value = (e as CustomEvent<SupportedCurrency>).detail
      setCurrencyState(value)
    }
    window.addEventListener(CURRENCY_EVENT, handler)
    return () => window.removeEventListener(CURRENCY_EVENT, handler)
  }, [])

  return { currency, setCurrency }
}
