import { Text, Grid, Tab, Tabs, TabList, Box } from '@chakra-ui/react'
import { useParams, Outlet, useOutletContext, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import PageNotFound from '../404'
import { fetchL2TxnsBy } from '../../../requests'
import { getNextTabRoute } from '../../../helpers'
import { AddressBalanceCard } from './Balances'
import { AddressRcInfo } from './RcInfo'
import { Txns } from '../../Transactions'

const count = 100

export const AddressTxs = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: txs } = useQuery({
    queryKey: ['vsc-address-history', offset, count, addr],
    queryFn: async () => fetchL2TxnsBy(offset, count, { byAccount: addr }),
    staleTime: 60000
  })
  return (
    <Box>
      <Txns txs={txs?.txns || []} />
      {/* <Pagination
        path={`/address/${addr}/txs`}
        currentPageNum={pageNum || 1}
        maxPageNum={Math.ceil((activity?.tx_count || 0) / count)}
      /> */}
    </Box>
  )
}

const tabNames = ['txs', 'deposits', 'withdrawals']

export const Address = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { addr } = useParams()
  const isL1 = addr!.startsWith('hive:')
  const validAddr = isL1 || addr!.startsWith('did:')
  const segments = pathname.split('/')
  const tabIndex = tabNames.indexOf(segments.length >= 4 ? segments[3] : tabNames[0])
  if (!validAddr) return <PageNotFound />
  return (
    <>
      {isL1 ? (
        <Text fontSize={'5xl'} mb={'4'}>
          {addr!.replace('hive:', '@')}
        </Text>
      ) : (
        <Box>
          <Text fontSize={'5xl'}>Address</Text>
          <Text fontSize={'2xl'} opacity={'0.7'} mb={'4'}>
            {addr}
          </Text>
        </Box>
      )}
      <hr />
      <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={'5'} mt={'4'}>
        <AddressBalanceCard addr={addr!} />
        <AddressRcInfo addr={addr!} />
      </Grid>
      <Tabs
        mt={'7'}
        variant={'solid-rounded'}
        index={tabIndex}
        onChange={(newIdx: number) => navigate(getNextTabRoute(tabNames, segments, newIdx), { preventScrollReset: true })}
      >
        <TabList overflow={'scroll'} whiteSpace={'nowrap'}>
          <Tab>Transactions</Tab>
          <Tab>Deposits</Tab>
          <Tab>Withdrawals</Tab>
        </TabList>
        <Box pt={'2'}>
          <Outlet context={{ addr }} />
        </Box>
      </Tabs>
    </>
  )
}
