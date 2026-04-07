import { CoinLower } from './types/Payloads'

export type LedgerFilterVariant = 'ledger_txs' | 'ledger_actions'

export interface LedgerFilterState {
  opType: string
  asset: string
  fromDate: string
  toDate: string
}

export const emptyLedgerFilters: LedgerFilterState = { opType: '', asset: '', fromDate: '', toDate: '' }

export const countActiveFilters = (filters: LedgerFilterState): number =>
  (filters.opType ? 1 : 0) + (filters.asset ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0)

export const buildLedgerGqlOpts = (
  filters: LedgerFilterState,
  blockRange: { fromBlock?: number; toBlock?: number },
  base: Record<string, unknown>
): Record<string, unknown> => {
  const opts: Record<string, unknown> = { ...base }
  if (filters.opType) opts.byTypes = [filters.opType]
  if (blockRange.fromBlock) opts.fromBlock = blockRange.fromBlock
  if (blockRange.toBlock) opts.toBlock = blockRange.toBlock
  return opts
}

export const buildLedgerStatOpts = (
  filters: LedgerFilterState,
  blockRange: { fromBlock?: number; toBlock?: number },
  base: Record<string, string | undefined>
): Record<string, string | undefined> => {
  const opts: Record<string, string | undefined> = { ...base }
  if (filters.opType) opts.op_types = filters.opType
  if (filters.asset) opts.asset = filters.asset as CoinLower
  if (blockRange.fromBlock) opts.from_block = String(blockRange.fromBlock)
  if (blockRange.toBlock) opts.to_block = String(blockRange.toBlock)
  return opts
}
