import { Text, Flex, Stack, Box } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useLocation, useParams, useSearchParams } from 'react-router'
import { TxCard } from '../TxCard'
import { fetchLatestTxs, fetchL2TxnsBy, useHistoryStats } from '../../requests'
import { describeL1TxBriefly } from '../../helpers'
import { Txns } from '../tables/Transactions'
import Pagination, { CurrentPageBtn, LinkedBtn } from '../Pagination'
import { PageTitle } from '../PageTitle'
import { btnGroupCss } from '../../styles/btnGroup'
import { TxFilterBar } from '../TxFilterBar'
import { parseFiltersFromSearchParams, buildTxFilterOptions, buildHistoryStatOpts, useBlockRange } from '../../txFilterHelpers'

export const NewHiveTxs = () => {
  const { data: txs } = useQuery({
    queryKey: ['vsc-latest-txs-hive'],
    queryFn: fetchLatestTxs
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
  const { page } = useParams()
  const [searchParams] = useSearchParams()
  const filters = parseFiltersFromSearchParams(searchParams)
  const blockRange = useBlockRange(filters)
  const filterOpts = buildTxFilterOptions(filters, blockRange)
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: txs } = useQuery({
    queryKey: ['vsc-latest-tsx', offset, count, filterOpts],
    queryFn: () => fetchL2TxnsBy(offset, count, filterOpts)
  })
  const stats = useHistoryStats('txs', buildHistoryStatOpts(filters, blockRange))
  return (
    <>
      <TxFilterBar basePath="/transactions/magi" />
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
  const location = useLocation()
  return (
    <>
      <PageTitle title="Latest Transactions" />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize={'5xl'}>Latest Transactions</Text>
        <Box my={'auto'} py={'1'}>
          <Box css={btnGroupCss} float={'right'}>
            {location.pathname !== '/transactions' && !location.pathname.startsWith('/transactions/magi') ? (
              <LinkedBtn to={'/transactions'}>Magi</LinkedBtn>
            ) : (
              <CurrentPageBtn>Magi</CurrentPageBtn>
            )}
            {location.pathname !== '/transactions/hive' ? (
              <LinkedBtn to={'/transactions/hive'}>Hive</LinkedBtn>
            ) : (
              <CurrentPageBtn>Hive</CurrentPageBtn>
            )}
          </Box>
        </Box>
      </Stack>
      <hr />
      <Outlet />
    </>
  )
}
