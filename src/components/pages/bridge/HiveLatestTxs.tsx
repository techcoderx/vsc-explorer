import { Heading, Text } from '@chakra-ui/react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  const offset = (pageNumber - 1) * count
  const { data: deposits } = useQuery({
    queryKey: ['vsc-list-deposits-hive', offset, count],
    queryFn: async () => getDeposits(offset, count, { byTypes: ['deposit'] })
  })
  return (
    <>
      <PageTitle title={t('bridge.hiveMaps')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('bridge.hiveMaps')}</Heading>
      <hr />
      <br />
      <Text>{t('bridge.totalMaps', { count: tally.deposits })}</Text>
      <LedgerDeposits txs={deposits?.deposits || []} />
      <Pagination
        path={'/nam/hive/maps'}
        currentPageNum={pageNumber}
        maxPageNum={Math.min(maxPage, Math.ceil(tally.deposits / count))}
      />
    </>
  )
}

export const HiveWithdrawals = ({ tally, pageNumber }: Commons) => {
  const { t } = useTranslation('pages')
  const offset = (pageNumber - 1) * count
  const { data: withdrawals } = useQuery({
    queryKey: ['vsc-list-withdrawals-hive', offset, count],
    queryFn: async () => getWithdrawals(offset, count, { byTypes: ['withdraw'] })
  })
  return (
    <>
      <PageTitle title={t('bridge.hiveUnmaps')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('bridge.hiveUnmaps')}</Heading>
      <hr />
      <br />
      <Text>{t('bridge.totalUnmaps', { count: tally.withdrawals })}</Text>
      <LedgerWithdrawals actions={withdrawals?.withdrawals || []} />
      <Pagination
        path={'/nam/hive/unmaps'}
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
