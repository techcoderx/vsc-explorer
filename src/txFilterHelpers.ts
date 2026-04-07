import { useQuery } from '@tanstack/react-query'
import { TxFilterState } from './types/TxFilters'
import { fetchBlockNumByTimestamp } from './requests'

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
