import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams } from 'react-router'
import { getWithdrawals, useAddrTxStats } from '../../../requests'
import { LedgerActionsTbl, LedgerWithdrawals } from '../../tables/Ledgers'
import Pagination from '../../Pagination'

const count = 100

export const AddressActions = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data } = useQuery({
    queryKey: ['vsc-list-actions-hive', offset, count, addr],
    queryFn: async () => getWithdrawals(offset, count, { byAccount: addr })
  })
  const stats = useAddrTxStats(addr)
  return (
    <>
      <LedgerActionsTbl actions={data?.withdrawals || []} />
      <Pagination
        path={`/address/${addr}/actions`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.ledger_actions || 0) / count))}
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
  const stats = useAddrTxStats(addr)
  return (
    <>
      <LedgerWithdrawals actions={data?.withdrawals || []} />
      <Pagination
        path={`/address/${addr}/withdrawals`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.withdrawals || 0) / count))}
      />
    </>
  )
}
