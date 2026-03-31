import { useQuery } from '@tanstack/react-query'
import { TxFilterState, TX_STATUS_OPTIONS, TX_TYPE_OPTIONS } from './types/TxFilters'
import { Status, TxnTypes } from './types/L2ApiResult'
import { fetchBlockNumByTimestamp } from './requests'

export const parseFiltersFromSearchParams = (sp: URLSearchParams): TxFilterState => {
  const filters: TxFilterState = {}
  const status = sp.get('status')
  if (status && TX_STATUS_OPTIONS.some((o) => o.value === status)) filters.status = status as Status
  const type = sp.get('type')
  if (type && TX_TYPE_OPTIONS.some((o) => o.value === type)) filters.type = type as TxnTypes
  const account = sp.get('account')
  if (account) filters.account = account
  const contract = sp.get('contract')
  if (contract) filters.contract = contract
  const fromDate = sp.get('from')
  if (fromDate) filters.fromDate = fromDate
  const toDate = sp.get('to')
  if (toDate) filters.toDate = toDate
  return filters
}

const dateToTimestamp = (date: string, end?: boolean): string => {
  return end ? `${date} 23:59:59` : `${date} 00:00:00`
}

export const useBlockRange = (filters: TxFilterState) => {
  const { data: fromBlock } = useQuery({
    queryKey: ['block-by-ts', filters.fromDate],
    queryFn: () => fetchBlockNumByTimestamp(dateToTimestamp(filters.fromDate!)),
    enabled: !!filters.fromDate,
    staleTime: 5 * 60 * 1000
  })
  const { data: toBlock } = useQuery({
    queryKey: ['block-by-ts', filters.toDate, 'end'],
    queryFn: () => fetchBlockNumByTimestamp(dateToTimestamp(filters.toDate!, true)),
    enabled: !!filters.toDate,
    staleTime: 5 * 60 * 1000
  })
  return {
    fromBlock: filters.fromDate ? fromBlock ?? undefined : undefined,
    toBlock: filters.toDate ? toBlock ?? undefined : undefined
  }
}

export const buildTxFilterOptions = (
  filters: TxFilterState,
  blockRange: { fromBlock?: number; toBlock?: number },
  base?: object
): object => {
  const opts: Record<string, unknown> = { ...base }
  if (filters.status) opts.byStatus = filters.status
  if (filters.type) opts.byType = [filters.type]
  if (filters.account) opts.byAccount = filters.account
  if (filters.contract) opts.byContract = filters.contract
  if (blockRange.fromBlock) opts.fromBlock = blockRange.fromBlock
  if (blockRange.toBlock) opts.toBlock = blockRange.toBlock
  return opts
}

export const buildHistoryStatOpts = (
  filters: TxFilterState,
  blockRange: { fromBlock?: number; toBlock?: number },
  base?: Record<string, unknown>
): Record<string, unknown> => {
  const opts: Record<string, unknown> = { ...base }
  if (filters.status) opts.status = filters.status
  if (filters.type) opts.op_types = filters.type
  if (filters.account) opts.user = filters.account
  if (filters.contract) opts.contract = filters.contract
  if (blockRange.fromBlock) opts.from_block = blockRange.fromBlock
  if (blockRange.toBlock) opts.to_block = blockRange.toBlock
  return opts
}
