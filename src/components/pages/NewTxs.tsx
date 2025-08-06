import { Text, Flex, ButtonGroup, Stack, Box } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useLocation } from 'react-router'
import { TxCard } from '../TxCard'
import { fetchLatestTxs, fetchLatestL2Txns } from '../../requests'
import { describeL1TxBriefly } from '../../helpers'
import { Txns } from '../tables/Transactions'
import { CurrentPageBtn, LinkedBtn } from '../Pagination'
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

export const NewVscTxs = () => {
  const { data: txs } = useQuery({
    queryKey: ['vsc-latest-tsx'],
    queryFn: fetchLatestL2Txns
  })
  return txs ? <Txns txs={txs.txns} /> : null
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
            {location.pathname !== '/transactions' ? (
              <LinkedBtn to={'/transactions'}>VSC</LinkedBtn>
            ) : (
              <CurrentPageBtn>VSC</CurrentPageBtn>
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
