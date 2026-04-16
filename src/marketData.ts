import { useQuery } from '@tanstack/react-query'
import { useCurrency } from './hooks/useCurrency'
import { getConf } from './settings'

export const SUPPORTED_CURRENCIES = [
  'usd', 'eur', 'gbp', 'jpy', 'cny', 'krw', 'inr', 'cad', 'aud',
  'chf', 'brl', 'mxn', 'hive', 'btc', 'eth', 'sol'
] as const

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  usd: 'USD - US Dollar',
  eur: 'EUR - Euro',
  gbp: 'GBP - British Pound',
  jpy: 'JPY - Japanese Yen',
  cny: 'CNY - Chinese Yuan',
  krw: 'KRW - South Korean Won',
  inr: 'INR - Indian Rupee',
  cad: 'CAD - Canadian Dollar',
  aud: 'AUD - Australian Dollar',
  chf: 'CHF - Swiss Franc',
  brl: 'BRL - Brazilian Real',
  mxn: 'MXN - Mexican Peso',
  hive: 'HIVE - Hive',
  btc: 'BTC - Bitcoin',
  eth: 'ETH - Ethereum',
  sol: 'SOL - Solana'
}

const CRYPTO_CURRENCIES: SupportedCurrency[] = ['hive', 'btc', 'eth', 'sol']

const CRYPTO_SYMBOLS: Partial<Record<SupportedCurrency, string>> = {
  hive: ' HIVE',
  btc: '\u20BF',
  eth: '\u039E',
  sol: ' SOL'
}

const CRYPTO_SYMBOL_AFTER: Partial<Record<SupportedCurrency, boolean>> = {
  hive: true,
  sol: true
}

const CRYPTO_DECIMALS: Partial<Record<SupportedCurrency, number>> = {
  hive: 3,
  btc: 8,
  eth: 6,
  sol: 4
}

interface CoinGeckoResponse {
  hive?: Record<string, number>
  bitcoin?: Record<string, number>
}

interface HiveTickerResult {
  result: {
    latest: string
    lowest_ask: string
    highest_bid: string
    percent_change: string
    hive_volume: string
    hbd_volume: string
  }
}

async function fetchCoinGeckoPrices(currency: SupportedCurrency): Promise<CoinGeckoResponse> {
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=hive,bitcoin&vs_currencies=${currency}`
  )
  return resp.json()
}

async function fetchHiveTicker(): Promise<number> {
  const conf = getConf()
  const resp = await fetch(conf.hiveApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'market_history_api.get_ticker',
      params: {},
      id: 1
    })
  })
  const data: HiveTickerResult = await resp.json()
  return parseFloat(data.result.latest)
}

export interface MarketPrices {
  hive?: number
  hbd?: number
  btc?: number
}

export function useMarketPrices() {
  const { currency } = useCurrency()
  const isMainnet = getConf().netId === 'vsc-mainnet'
  // When display currency is HIVE, fetch USD as base to derive HIVE-denominated prices
  const cgCurrency = currency === 'hive' ? 'usd' : currency

  const { data: cgData, isLoading: cgLoading } = useQuery({
    queryKey: ['coingecko-prices', cgCurrency],
    queryFn: () => fetchCoinGeckoPrices(cgCurrency as SupportedCurrency),
    staleTime: 60000,
    retry: 2,
    enabled: isMainnet
  })

  const { data: hbdHiveRate, isLoading: tickerLoading } = useQuery({
    queryKey: ['hive-ticker'],
    queryFn: fetchHiveTicker,
    staleTime: 60000,
    retry: 2,
    enabled: isMainnet
  })

  let hivePrice: number | undefined
  let btcPrice: number | undefined
  let hbdPrice: number | undefined

  if (currency === 'hive') {
    const hiveUsd = cgData?.hive?.['usd']
    const btcUsd = cgData?.bitcoin?.['usd']
    hivePrice = 1
    btcPrice = hiveUsd && btcUsd ? btcUsd / hiveUsd : undefined
    // 1 HBD = (1/ticker.latest) HIVE directly from the internal market
    hbdPrice = hbdHiveRate !== undefined && hbdHiveRate > 0 ? 1 / hbdHiveRate : undefined
  } else {
    hivePrice = cgData?.hive?.[currency]
    btcPrice = cgData?.bitcoin?.[currency]
    // ticker.latest = HBD per 1 HIVE, so 1 HBD = (1/latest) HIVE * hivePrice
    hbdPrice = hivePrice !== undefined && hbdHiveRate !== undefined && hbdHiveRate > 0
      ? hivePrice / hbdHiveRate
      : undefined
  }

  return {
    prices: { hive: hivePrice, hbd: hbdPrice, btc: btcPrice } as MarketPrices,
    currency,
    isLoading: cgLoading || tickerLoading
  }
}

export function formatCurrencyValue(amount: number | undefined, currency: SupportedCurrency): string {
  if (amount === undefined || isNaN(amount)) return ''

  if (CRYPTO_CURRENCIES.includes(currency)) {
    const decimals = CRYPTO_DECIMALS[currency] ?? 4
    const symbol = CRYPTO_SYMBOLS[currency] ?? currency.toUpperCase() + ' '
    const formatted = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    })
    return CRYPTO_SYMBOL_AFTER[currency] ? `${formatted}${symbol}` : `${symbol}${formatted}`
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}
