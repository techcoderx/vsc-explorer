import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams } from 'react-router'
import { getDeposits } from '../../../requests'
import { LedgerDeposits, LedgerTxsTbl } from '../../tables/Ledgers'

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
  return (
    <>
      <LedgerTxsTbl txs={data?.deposits || []} />
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
  return (
    <>
      <LedgerDeposits txs={data?.deposits || []} />
    </>
  )
}
