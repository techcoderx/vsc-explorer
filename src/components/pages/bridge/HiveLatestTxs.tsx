import { Text } from '@chakra-ui/react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getBridgeTxCounts, getDeposits, getWithdrawals } from '../../../requests'
import { BridgeCounter } from '../../../types/HafApiResult'
import Pagination from '../../Pagination'
import PageNotFound from '../404'
import { LedgerWithdrawals, LedgerDeposits } from '../../tables/Ledgers'
import { PageTitle } from '../../PageTitle'

const count = 100
const maxPage = 100

interface Commons {
  tally: BridgeCounter
  pageNumber: number
}

export const HiveDeposits = ({ tally, pageNumber }: Commons) => {
  const offset = (pageNumber - 1) * count
  const { data: deposits } = useQuery({
    queryKey: ['vsc-list-deposits-hive', offset, count],
    queryFn: async () => getDeposits(offset, count, { byTypes: ['deposit'] })
  })
  return (
    <>
      <PageTitle title="Hive Asset Maps" />
      <Text fontSize={'5xl'}>Hive Asset Maps</Text>
      <hr />
      <br />
      <Text>Total {tally.deposits} maps</Text>
      <LedgerDeposits txs={deposits?.deposits || []} />
      <Pagination
        path={'/bridge/hive/deposits'}
        currentPageNum={pageNumber}
        maxPageNum={Math.min(maxPage, Math.ceil(tally.deposits / count))}
      />
    </>
  )
}

export const HiveWithdrawals = ({ tally, pageNumber }: Commons) => {
  const offset = (pageNumber - 1) * count
  const { data: withdrawals } = useQuery({
    queryKey: ['vsc-list-withdrawals-hive', offset, count],
    queryFn: async () => getWithdrawals(offset, count, { byTypes: ['withdraw'] })
  })
  return (
    <>
      <PageTitle title="Hive Asset Unmaps" />
      <Text fontSize={'5xl'}>Hive Asset Unmaps</Text>
      <hr />
      <br />
      <Text>Total {tally.withdrawals} unmaps</Text>
      <LedgerWithdrawals actions={withdrawals?.withdrawals || []} />
      <Pagination
        path={'/bridge/hive/withdrawals'}
        currentPageNum={pageNumber}
        maxPageNum={Math.min(maxPage, Math.ceil(tally.withdrawals / count))}
      />
    </>
  )
}

export const HiveBridgeLatestTxs = ({ kind }: { kind: 'd' | 'w' }) => {
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data } = useQuery({ queryKey: ['vsc-bridge-tx-count'], queryFn: async () => getBridgeTxCounts() })
  const tally: BridgeCounter = data || {
    deposits: 0,
    withdrawals: 0
  }
  if (invalidPage) return <PageNotFound />
  else if (kind === 'd') return <HiveDeposits tally={tally} pageNumber={pageNumber} />
  else return <HiveWithdrawals tally={tally} pageNumber={pageNumber} />
}
