import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams } from 'react-router'
import { Dispatch, SetStateAction } from 'react'
import { getWithdrawals, useHistoryStats } from '../../../requests'
import { LedgerActionsTbl, LedgerWithdrawals } from '../../tables/Ledgers'
import Pagination from '../../Pagination'
import { LedgerFilterBar } from '../../LedgerFilterBar'
import { LedgerFilterState, emptyLedgerFilters, buildLedgerGqlOpts, buildLedgerStatOpts } from '../../../ledgerFilterHelpers'
import { useBlockRange } from '../../../txFilterHelpers'

const count = 100

export const AddressActions = () => {
  const { addr, filtersOpen, actionFilters, setActionFilters } = useOutletContext<{
    addr: string
    filtersOpen: boolean
    actionFilters: LedgerFilterState
    setActionFilters: Dispatch<SetStateAction<LedgerFilterState>>
  }>()
  const { page } = useParams()
  const blockRange = useBlockRange(actionFilters)
  const gqlOpts = buildLedgerGqlOpts(actionFilters, blockRange, { byAccount: addr })
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data } = useQuery({
    queryKey: ['vsc-list-actions-hive', offset, count, addr, gqlOpts],
    queryFn: async () => getWithdrawals(offset, count, gqlOpts)
  })
  const stats = useHistoryStats('ledger_actions', buildLedgerStatOpts(actionFilters, blockRange, { user: addr }))
  return (
    <>
      <LedgerFilterBar
        open={filtersOpen}
        variant="ledger_actions"
        onApply={setActionFilters}
        onReset={() => setActionFilters(emptyLedgerFilters)}
      />
      <LedgerActionsTbl actions={data?.withdrawals || []} />
      <Pagination
        path={`/address/${addr}/actions`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.count || 0) / count))}
      />
    </>
  )
}

export const AddressWithdrawals = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data } = useQuery({
    queryKey: ['vsc-list-withdrawals-hive', offset, count, addr],
    queryFn: async () => getWithdrawals(offset, count, { byAccount: addr, byTypes: ['withdraw'] })
  })
  const stats = useHistoryStats('ledger_actions', { user: addr, op_types: 'withdraw' })
  return (
    <>
      <LedgerWithdrawals actions={data?.withdrawals || []} />
      <Pagination
        path={`/address/${addr}/withdrawals`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.count || 0) / count))}
      />
    </>
  )
}
