import { Flex, Heading, Stack, ButtonGroup } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useLocation, useOutletContext, useParams } from 'react-router'
import { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TxCard } from '../TxCard'
import { fetchLatestTxs, fetchL2TxnsBy, useHistoryStats } from '../../requests'
import { describeL1TxBriefly } from '../../helpers'
import { Txns } from '../tables/Transactions'
import Pagination, { CurrentPageBtn, LinkedBtn } from '../Pagination'
import { PageTitle } from '../PageTitle'
import { TxFilterBar, TxFilterToggle } from '../TxFilterBar'
import { buildTxFilterOptions, buildHistoryStatOpts, useBlockRange } from '../../txFilterHelpers'
import { TxFilterState, emptyTxFilters, countActiveTxFilters } from '../../types/TxFilters'
import { useL1OpsFilter } from '../../l1OpTypes'
import { L1OpTypeFilter } from '../L1OpTypeFilter'

const HIVE_TXS_FILTER_KEY = '/transactions/hive'

export const NewHiveTxs = () => {
  const bitmask = useL1OpsFilter(HIVE_TXS_FILTER_KEY)
  const { data: txs } = useQuery({
    queryKey: ['vsc-latest-txs-hive', bitmask],
    queryFn: () => fetchLatestTxs(bitmask || undefined)
  })
  return (
    <Flex direction={'column'} gap={'3'} marginTop={'15px'}>
      {Array.isArray(txs) ? (
        txs.map((tx, i) => (
          <TxCard key={i} id={tx.id} ts={tx.ts} txid={tx.l1_tx}>
            {describeL1TxBriefly(tx)}
          </TxCard>
        ))
      ) : (
        <></>
      )}
    </Flex>
  )
}

const count = 100

export const NewVscTxs = () => {
  const { filtersOpen, txFilters, setTxFilters } = useOutletContext<{
    filtersOpen: boolean
    txFilters: TxFilterState
    setTxFilters: Dispatch<SetStateAction<TxFilterState>>
  }>()
  const { page } = useParams()
  const blockRange = useBlockRange(txFilters)
  const filterOpts = buildTxFilterOptions(txFilters, blockRange)
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: txs } = useQuery({
    queryKey: ['vsc-latest-tsx', offset, count, filterOpts],
    queryFn: () => fetchL2TxnsBy(offset, count, filterOpts)
  })
  const stats = useHistoryStats('txs', buildHistoryStatOpts(txFilters, blockRange))
  return (
    <>
      <TxFilterBar open={filtersOpen} onApply={setTxFilters} onReset={() => setTxFilters(emptyTxFilters)} />
      {!!txs && !!txs.txns ? (
        <>
          <Txns txs={txs.txns} />
          <Pagination
            path={'/transactions/magi'}
            currentPageNum={pageNum}
            maxPageNum={Math.min(100, Math.ceil((stats?.count || 0) / count))}
          />
        </>
      ) : null}
    </>
  )
}

export const NewTxs = () => {
  const { t } = useTranslation('pages')
  const location = useLocation()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [txFilters, setTxFilters] = useState<TxFilterState>(emptyTxFilters)
  const isMagi = location.pathname === '/transactions' || location.pathname.startsWith('/transactions/magi')
  const isHive = location.pathname === '/transactions/hive'
  return (
    <>
      <PageTitle title={t('transactions.title')} />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Heading as="h1" size="5xl" fontWeight="normal">{t('transactions.title')}</Heading>
        <Flex my={'auto'} py={'1'} gap={'3'} align={'center'}>
          {isMagi && <TxFilterToggle activeCount={countActiveTxFilters(txFilters)} open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />}
          {isHive && <L1OpTypeFilter filterKey={HIVE_TXS_FILTER_KEY} />}
          <ButtonGroup variant="outline" size="md" attached>
            {!isMagi ? <LinkedBtn to={'/transactions'}>{t('transactions.magi')}</LinkedBtn> : <CurrentPageBtn>{t('transactions.magi')}</CurrentPageBtn>}
            {!isHive ? (
              <LinkedBtn to={'/transactions/hive'}>{t('transactions.hive')}</LinkedBtn>
            ) : (
              <CurrentPageBtn>{t('transactions.hive')}</CurrentPageBtn>
            )}
          </ButtonGroup>
        </Flex>
      </Stack>
      <hr />
      <Outlet context={{ filtersOpen, txFilters, setTxFilters }} />
    </>
  )
}
