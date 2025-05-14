import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams } from 'react-router'
import { getDeposits, useAddrTxStats } from '../../../requests'
import { LedgerDeposits, LedgerTxsTbl } from '../../tables/Ledgers'
import Pagination from '../../Pagination'

const count = 100

export const AddressLedgers = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data } = useQuery({
    queryKey: ['vsc-list-ledgers-hive', offset, count, addr],
    queryFn: async () => getDeposits(offset, count, { byToFrom: addr })
  })
  const stats = useAddrTxStats(addr)
  return (
    <>
      <LedgerTxsTbl txs={data?.deposits || []} />
      <Pagination
        path={`/address/${addr}/ledger`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.ledger_txs || 0) / count))}
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
  const stats = useAddrTxStats(addr)
  return (
    <>
      <LedgerDeposits txs={data?.deposits || []} />
      <Pagination
        path={`/address/${addr}/deposits`}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((stats?.deposits || 0) / count))}
      />
    </>
  )
}
