import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams } from 'react-router'
import { Dispatch, SetStateAction } from 'react'
import { getDeposits, useHistoryStats } from '../../../requests'
import { LedgerDeposits, LedgerTxsTbl } from '../../tables/Ledgers'
import Pagination from '../../Pagination'
import { LedgerFilterBar } from '../../LedgerFilterBar'
import { LedgerFilterState, emptyLedgerFilters, buildLedgerGqlOpts, buildLedgerStatOpts } from '../../../ledgerFilterHelpers'
import { useBlockRange } from '../../../txFilterHelpers'

const count = 100

export const AddressLedgers = () => {
  const { addr, filtersOpen, ledgerFilters, setLedgerFilters } = useOutletContext<{
    addr: string
    filtersOpen: boolean
    ledgerFilters: LedgerFilterState
    setLedgerFilters: Dispatch<SetStateAction<LedgerFilterState>>
  }>()
  const { page } = useParams()
  const blockRange = useBlockRange(ledgerFilters)
  const gqlOpts = buildLedgerGqlOpts(ledgerFilters, blockRange, { byToFrom: addr })
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data } = useQuery({
    queryKey: ['vsc-list-ledgers-hive', offset, count, addr, gqlOpts],
    queryFn: async () => getDeposits(offset, count, gqlOpts)
  })
  const stats = useHistoryStats('ledger_txs', buildLedgerStatOpts(ledgerFilters, blockRange, { user: addr }))
  return (
    <>
      <LedgerFilterBar
        open={filtersOpen}
        variant="ledger_txs"
        onApply={setLedgerFilters}
        onReset={() => setLedgerFilters(emptyLedgerFilters)}
      />
      <LedgerTxsTbl txs={data?.deposits || []} />
      <Pagination
        path={`/address/${addr}/ledger`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.count || 0) / count))}
      />
    </>
  )
}

export const AddressDeposits = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data } = useQuery({
    queryKey: ['vsc-list-deposits-hive', offset, count, addr],
    queryFn: async () => getDeposits(offset, count, { byToFrom: addr, byTypes: ['deposit'] })
  })
  const stats = useHistoryStats('ledger_txs', { user: addr, op_types: 'deposit' })
  return (
    <>
      <LedgerDeposits txs={data?.deposits || []} />
      <Pagination
        path={`/address/${addr}/deposits`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.count || 0) / count))}
      />
    </>
  )
}
