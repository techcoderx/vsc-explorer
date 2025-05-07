import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams } from 'react-router'
import { getWithdrawals } from '../../../requests'
import { BridgeTxsTable } from '../bridge/HiveLatestTxs'

const count = 100

export const AddressWithdrawals = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ['vsc-list-withdrawals-hive', offset, count, addr],
    queryFn: async () => getWithdrawals(offset, count, { byAccount: addr })
  })
  return (
    <BridgeTxsTable
      type="withdrawals"
      txs={data?.withdrawals || []}
      isLoading={isLoading}
      isSuccess={isSuccess}
      currentPage={pageNum}
      txCount={-1}
    />
  )
}
