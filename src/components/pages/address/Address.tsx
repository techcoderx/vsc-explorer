import { Text, Grid, Tabs, Box, Stack, Tag } from '@chakra-ui/react'
import { useParams, Outlet, useOutletContext, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import PageNotFound from '../404'
import { Flairs } from '../../../flairs'
import { fetchL2TxnsBy, getWitness, useHistoryStats } from '../../../requests'
import { abbreviateHash, getNextTabRoute, validateHiveUsername } from '../../../helpers'
import { AddressBalanceCard } from './Balances'
import { AddressRcInfo } from './RcInfo'
import { Txns } from '../../tables/Transactions'
import { getConf, themeColorScheme } from '../../../settings'
import Pagination from '../../Pagination'
import { PageTitle } from '../../PageTitle'

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
  const stats = useHistoryStats('txs', { user: addr })
  return (
    <Box>
      <Txns txs={txs?.txns || []} pov={addr} />
      <Pagination
        path={`/address/${addr}/txs`}
        currentPageNum={pageNum || 1}
        maxPageNum={Math.ceil((stats?.count || 0) / count)}
      />
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
  const tabValue = segments.length >= 4 ? segments[3] : tabNames[0]
  const { data: witness } = useQuery({
    queryKey: ['vsc-witness', addr!.replace('hive:', '')],
    queryFn: async () => getWitness(addr!.replace('hive:', '')),
    enabled: isL1
  })
  if (!addr || !validAddr) return <PageNotFound />
  return (
    <>
      <PageTitle title={`${abbreviateHash(addr, 26, 0)}`} />
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
          <Tag.Root colorPalette={themeColorScheme} size={'lg'} variant={'outline'} alignSelf={'end'} mb={'3'}>
            {Flairs[addr]}
          </Tag.Root>
        )}
      </Stack>
      <hr />
      {addr !== 'hive:' + getConf().msAccount && (
        <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={'5'} mt={'4'}>
          <AddressBalanceCard addr={addr!} />
          <AddressRcInfo addr={addr!} />
        </Grid>
      )}
      <Tabs.Root
        mt={'7'}
        colorPalette={themeColorScheme}
        variant={'enclosed'}
        value={tabValue}
        onValueChange={(details) => {
          const newIdx = tabNames.indexOf(details.value)
          navigate(getNextTabRoute(tabNames, segments, newIdx), { preventScrollReset: true })
        }}
      >
        <Tabs.List overflowX={'auto'} whiteSpace={'nowrap'} maxW={'100%'} display={'flex'} css={{ '& > button': { flexShrink: 0 } }}>
          <Tabs.Trigger value="txs">Transactions</Tabs.Trigger>
          <Tabs.Trigger value="hiveops" hidden={!isL1}>L1 Ops</Tabs.Trigger>
          <Tabs.Trigger value="ledger">Ledger Ops</Tabs.Trigger>
          <Tabs.Trigger value="actions">Actions</Tabs.Trigger>
          <Tabs.Trigger value="deposits">Maps</Tabs.Trigger>
          <Tabs.Trigger value="withdrawals">Unmaps</Tabs.Trigger>
          <Tabs.Trigger value="witness" hidden={!isL1 || !witness}>Witness</Tabs.Trigger>
        </Tabs.List>
        <Box pt={'2'}>
          <Outlet context={{ addr }} />
        </Box>
      </Tabs.Root>
    </>
  )
}
