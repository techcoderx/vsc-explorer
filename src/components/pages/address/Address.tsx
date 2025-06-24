import { Text, Grid, Tab, Tabs, TabList, Box, Stack, Tag } from '@chakra-ui/react'
import { useParams, Outlet, useOutletContext, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import PageNotFound from '../404'
import { Flairs } from '../../../flairs'
import { fetchL2TxnsBy, getWitness, useAddrTxStats } from '../../../requests'
import { getNextTabRoute, validateHiveUsername } from '../../../helpers'
import { AddressBalanceCard } from './Balances'
import { AddressRcInfo } from './RcInfo'
import { Txns } from '../../tables/Transactions'
import { multisigAccount, themeColorScheme } from '../../../settings'
import Pagination from '../../Pagination'

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
  const stats = useAddrTxStats(addr)
  return (
    <Box>
      <Txns txs={txs?.txns || []} />
      <Pagination path={`/address/${addr}/txs`} currentPageNum={pageNum || 1} maxPageNum={Math.ceil((stats?.txs || 0) / count)} />
    </Box>
  )
}

const tabNames = ['txs', 'hiveops', 'ledger', 'actions', 'deposits', 'withdrawals', 'witness']

export const Address = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { addr } = useParams()
  const isL1 = addr!.startsWith('hive:') && validateHiveUsername(addr!.replace('hive:', '')) === null
  const validAddr = isL1 || addr!.startsWith('did:')
  const segments = pathname.split('/')
  const tabIndex = tabNames.indexOf(segments.length >= 4 ? segments[3] : tabNames[0])
  const { data: witness } = useQuery({
    queryKey: ['vsc-witness', addr!.replace('hive:', '')],
    queryFn: async () => getWitness(addr!.replace('hive:', '')),
    enabled: isL1
  })
  if (!addr || !validAddr) return <PageNotFound />
  return (
    <>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
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
        {/* Note: Wrap with another HStack when there are more than one flair */}
        {Flairs[addr] && (
          <Tag colorScheme={themeColorScheme} size={'lg'} variant={'outline'} alignSelf={'end'} mb={'3'}>
            {Flairs[addr]}
          </Tag>
        )}
      </Stack>
      <hr />
      {addr !== 'hive:' + multisigAccount && (
        <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={'5'} mt={'4'}>
          <AddressBalanceCard addr={addr!} />
          <AddressRcInfo addr={addr!} />
        </Grid>
      )}
      <Tabs
        mt={'7'}
        variant={'solid-rounded'}
        index={tabIndex}
        onChange={(newIdx: number) => navigate(getNextTabRoute(tabNames, segments, newIdx), { preventScrollReset: true })}
      >
        <TabList overflow={'scroll'} whiteSpace={'nowrap'}>
          <Tab>Transactions</Tab>
          <Tab hidden={!isL1}>L1 Ops</Tab>
          <Tab>Ledger Ops</Tab>
          <Tab>Actions</Tab>
          <Tab>Maps</Tab>
          <Tab>Unmaps</Tab>
          <Tab hidden={!isL1 || !witness}>Witness</Tab>
        </TabList>
        <Box pt={'2'}>
          <Outlet context={{ addr }} />
        </Box>
      </Tabs>
    </>
  )
}
