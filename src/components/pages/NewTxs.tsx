import { Text, Flex, ButtonGroup, Stack, Box } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useLocation, useParams } from 'react-router'
import { TxCard } from '../TxCard'
import { fetchLatestTxs, fetchL2TxnsBy, fetchProps } from '../../requests'
import { describeL1TxBriefly } from '../../helpers'
import { Txns } from '../tables/Transactions'
import Pagination, { CurrentPageBtn, LinkedBtn } from '../Pagination'
import { PageTitle } from '../PageTitle'

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
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: txs } = useQuery({
    queryKey: ['vsc-latest-tsx', offset, count],
    queryFn: () => fetchL2TxnsBy(offset, count)
  })
  const { data: prop } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  return !!txs && !!txs.txns ? (
    <>
      <Txns txs={txs.txns} />
      <Pagination
        path={'/transactions/magi'}
        currentPageNum={pageNum}
        maxPageNum={Math.min(100, Math.ceil((prop?.transactions || 0) / 100))}
      />
    </>
  ) : null
}

export const NewTxs = () => {
  const location = useLocation()
  return (
    <>
      <PageTitle title="Latest Transactions" />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize={'5xl'}>Latest Transactions</Text>
        <Box my={'auto'} py={'1'}>
          <ButtonGroup size="md" isAttached variant={'outline'} float={'right'}>
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
          </ButtonGroup>
        </Box>
      </Stack>
      <hr />
      <Outlet />
    </>
  )
}
