import { Heading, Text, Grid, Tabs, Box, Stack, Tag } from '@chakra-ui/react'
import { useParams, Outlet, useOutletContext, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { TxFilterBar, TxFilterToggle } from '../../TxFilterBar'
import { LedgerFilterToggle } from '../../LedgerFilterBar'
import { buildTxFilterOptions, buildHistoryStatOpts, useBlockRange } from '../../../txFilterHelpers'
import { L1OpTypeFilter } from '../../L1OpTypeFilter'
import { LedgerFilterState, emptyLedgerFilters, countActiveFilters } from '../../../ledgerFilterHelpers'
import { TxFilterState, emptyTxFilters, countActiveTxFilters } from '../../../types/TxFilters'

const count = 100

export const AddressTxs = () => {
  const { addr, filtersOpen, txFilters, setTxFilters } = useOutletContext<{
    addr: string
    filtersOpen: boolean
    txFilters: TxFilterState
    setTxFilters: Dispatch<SetStateAction<TxFilterState>>
  }>()
  const { page } = useParams()
  const blockRange = useBlockRange(txFilters)
  const filterOpts = buildTxFilterOptions(txFilters, blockRange, { byAccount: addr })
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: txs } = useQuery({
    queryKey: ['vsc-address-history', offset, count, addr, filterOpts],
    queryFn: async () => fetchL2TxnsBy(offset, count, filterOpts),
    staleTime: 60000
  })
  const stats = useHistoryStats('txs', buildHistoryStatOpts(txFilters, blockRange, { user: addr }))
  return (
    <Box>
      <TxFilterBar open={filtersOpen} onApply={setTxFilters} onReset={() => setTxFilters(emptyTxFilters)} />
      <Txns txs={txs?.txns || []} pov={addr} />
      <Pagination
        path={`/address/${addr}/txs`}
        currentPageNum={pageNum || 1}
        maxPageNum={Math.ceil((stats?.count || 0) / count)}
      />
    </Box>
  )
}

const tabNames = ['txs', 'hiveops', 'ledger', 'actions', 'deposits', 'withdrawals', 'witness', 'tokens', 'nfts']

export const Address = () => {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { addr } = useParams()
  const isL1 = addr!.startsWith('hive:') && validateHiveUsername(addr!.replace('hive:', '')) === null
  const validAddr = isL1 || addr!.startsWith('did:') || addr!.startsWith('system:')
  const segments = pathname.split('/')
  const tabValue = segments.length >= 4 ? segments[3] : tabNames[0]
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [txFilters, setTxFilters] = useState<TxFilterState>(emptyTxFilters)
  const [ledgerFilters, setLedgerFilters] = useState<LedgerFilterState>(emptyLedgerFilters)
  const [actionFilters, setActionFilters] = useState<LedgerFilterState>(emptyLedgerFilters)
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
          <Heading as="h1" size="5xl" fontWeight="normal" mb={'4'}>
            {addr!.replace('hive:', '@')}
          </Heading>
        ) : (
          <Box>
            <Heading as="h1" size="5xl" fontWeight="normal">{t('address.title')}</Heading>
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
          <Tabs.Trigger value="txs">{t('address.tabs.transactions')}</Tabs.Trigger>
          <Tabs.Trigger value="hiveops" hidden={!isL1}>{t('address.tabs.l1Ops')}</Tabs.Trigger>
          <Tabs.Trigger value="ledger">{t('address.tabs.ledgerOps')}</Tabs.Trigger>
          <Tabs.Trigger value="actions">{t('address.tabs.actions')}</Tabs.Trigger>
          <Tabs.Trigger value="deposits">{t('address.tabs.maps')}</Tabs.Trigger>
          <Tabs.Trigger value="withdrawals">{t('address.tabs.unmaps')}</Tabs.Trigger>
          <Tabs.Trigger value="witness" hidden={!isL1 || !witness}>{t('address.tabs.witness')}</Tabs.Trigger>
          <Tabs.Trigger value="tokens">{t('address.tabs.tokens')}</Tabs.Trigger>
          <Tabs.Trigger value="nfts">{t('address.tabs.nfts')}</Tabs.Trigger>
          {tabValue === 'txs' && (
            <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
              <TxFilterToggle activeCount={countActiveTxFilters(txFilters)} open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />
            </Box>
          )}
          {tabValue === 'hiveops' && (
            <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
              <L1OpTypeFilter filterKey={`/address/${addr}/hiveops`} />
            </Box>
          )}
          {tabValue === 'ledger' && (
            <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
              <LedgerFilterToggle activeCount={countActiveFilters(ledgerFilters)} open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />
            </Box>
          )}
          {tabValue === 'actions' && (
            <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
              <LedgerFilterToggle activeCount={countActiveFilters(actionFilters)} open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />
            </Box>
          )}
        </Tabs.List>
        <Box pt={'2'}>
          <Outlet context={{ addr, filtersOpen, txFilters, setTxFilters, ledgerFilters, setLedgerFilters, actionFilters, setActionFilters }} />
        </Box>
      </Tabs.Root>
    </>
  )
}
