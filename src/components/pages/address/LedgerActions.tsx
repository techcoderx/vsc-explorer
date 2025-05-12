import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams } from 'react-router'
import { getWithdrawals } from '../../../requests'
import { LedgerActionsTbl, LedgerWithdrawals } from '../../tables/Ledgers'

const count = 100

export const AddressActions = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data } = useQuery({
    queryKey: ['vsc-list-withdrawals-hive', offset, count, addr],
    queryFn: async () => getWithdrawals(offset, count, { byAccount: addr })
  })
  return (
    <>
      <LedgerActionsTbl actions={data?.withdrawals || []} />
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
  return (
    <>
      <LedgerWithdrawals actions={data?.withdrawals || []} />
    </>
  )
}
