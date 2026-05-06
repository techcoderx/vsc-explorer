import { Heading, Card, Stat, Stack, Table, Skeleton, Tabs, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import {
  fetchBtcBalances,
  fetchBtcDepositsByAccount,
  fetchBtcDepositsCountByAccount,
  fetchBtcRecentDeposits,
  fetchBtcRecentTransfers,
  fetchBtcRecentUnmaps,
  fetchBtcTransfersByAccount,
  fetchBtcTransfersCountByAccount,
  fetchBtcTvl,
  fetchBtcUnmaps24h,
  fetchBtcUnmapsByAccount,
  fetchBtcUnmapsCountByAccount,
  fetchBtcVolume24h,
  useBtcBalanceByAccount
} from '../../../hasuraRequests'
import { thousandSeperator, formatSats, abbreviateHash } from '../../../helpers'
import { useMarketPrices, formatCurrencyValue } from '../../../marketData'
import { themeColorScheme } from '../../../settings'
import { PageTitle } from '../../PageTitle'
import { AccountLink } from '../../TableLink'
import TransfersTable from '../../tables/Transfers'
import BtcMapsTable from '../../tables/BtcMaps'
import BtcUnmapsTable from '../../tables/BtcUnmaps'

const PAGE_SIZE = 20
const MAX_PAGES = 100

const ALLOWED_TABS = ['transfers', 'maps', 'unmaps'] as const
type AddressTab = (typeof ALLOWED_TABS)[number]

const BtcGlobalView = () => {
  const { t } = useTranslation(['pages', 'tables'])
  const { prices, currency } = useMarketPrices()
  const { data: tvl } = useQuery({
    queryKey: ['hasura-btc-tvl'],
    queryFn: fetchBtcTvl,
    staleTime: 60000
  })
  const { data: volume24h } = useQuery({
    queryKey: ['hasura-btc-volume-24h'],
    queryFn: fetchBtcVolume24h,
    staleTime: 60000
  })
  const { data: unmaps24h } = useQuery({
    queryKey: ['hasura-btc-unmaps-24h'],
    queryFn: fetchBtcUnmaps24h,
    staleTime: 60000
  })
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['hasura-btc-balances'],
    queryFn: () => fetchBtcBalances(20, 0),
    staleTime: 60000
  })
  const { data: deposits, isLoading: depositsLoading } = useQuery({
    queryKey: ['hasura-btc-recent-deposits'],
    queryFn: () => fetchBtcRecentDeposits(20),
    staleTime: 60000
  })
  const { data: transfers, isLoading: transfersLoading } = useQuery({
    queryKey: ['hasura-btc-recent-transfers'],
    queryFn: () => fetchBtcRecentTransfers(20),
    staleTime: 60000
  })
  const { data: unmaps, isLoading: unmapsLoading } = useQuery({
    queryKey: ['hasura-btc-recent-unmaps'],
    queryFn: () => fetchBtcRecentUnmaps(20),
    staleTime: 60000
  })

  return (
    <>
      <PageTitle title={t('btc.title', { ns: 'pages' })} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('btc.title', { ns: 'pages' })}</Heading>
      <hr />
      <Stack direction={{ base: 'column', md: 'row' }} gap="4" mt="4" mb="6">
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.tvl', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {tvl ? formatSats(tvl) : <Skeleton height="24px" width="120px" />}
              </Stat.ValueText>
              {tvl && prices.btc !== undefined && (
                <Text fontSize="sm" opacity={0.7}>
                  ≈ {formatCurrencyValue(parseInt(tvl) / 1e8 * prices.btc, currency)}
                </Text>
              )}
            </Stat.Root>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.volume24h', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {volume24h ? formatSats(volume24h.total_sats) : <Skeleton height="24px" width="120px" />}
              </Stat.ValueText>
              {volume24h && prices.btc !== undefined && (
                <Text fontSize="sm" opacity={0.7}>
                  ≈ {formatCurrencyValue(parseInt(volume24h.total_sats) / 1e8 * prices.btc, currency)}
                </Text>
              )}
            </Stat.Root>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.maps24h', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {volume24h ? thousandSeperator(volume24h.deposit_count) : <Skeleton height="24px" width="80px" />}
              </Stat.ValueText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.unmaps24h', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {unmaps24h !== undefined ? thousandSeperator(unmaps24h) : <Skeleton height="24px" width="80px" />}
              </Stat.ValueText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
      </Stack>

      <Tabs.Root lazyMount mt="4" colorPalette={themeColorScheme} variant="enclosed" defaultValue="0">
        <Tabs.List overflowX="auto" whiteSpace="nowrap" maxW="100%" display="flex" css={{ '& > button': { flexShrink: 0 } }}>
          <Tabs.Trigger value="0">{t('btc.tabs.transfers', { ns: 'pages' })}</Tabs.Trigger>
          <Tabs.Trigger value="1">{t('btc.tabs.maps', { ns: 'pages' })}</Tabs.Trigger>
          <Tabs.Trigger value="2">{t('btc.tabs.unmaps', { ns: 'pages' })}</Tabs.Trigger>
          <Tabs.Trigger value="3">{t('btc.tabs.topHolders', { ns: 'pages' })}</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="0" mt="2" pt="1">
          <TransfersTable
            transfers={transfers?.map((tx) => ({
              txId: tx.indexer_tx_hash.split('-')[0],
              ts: tx.indexer_ts,
              from: tx.from_addr,
              to: tx.to_addr,
              formattedAmount: formatSats(tx.amount)
            }))}
            isLoading={transfersLoading}
          />
        </Tabs.Content>

        <Tabs.Content value="1" mt="2" pt="1">
          <BtcMapsTable deposits={deposits} isLoading={depositsLoading} />
        </Tabs.Content>

        <Tabs.Content value="2" mt="2" pt="1">
          <BtcUnmapsTable unmaps={unmaps} isLoading={unmapsLoading} />
        </Tabs.Content>

        <Tabs.Content value="3" mt="2" pt="1">
          <Table.ScrollArea>
            <Table.Root variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>#</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('btc.account', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('btc.balance', { ns: 'tables' })}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {balancesLoading ? (
                  <Table.Row>
                    {[...Array(3)].map((_, i) => (
                      <Table.Cell key={i}><Skeleton height="20px" /></Table.Cell>
                    ))}
                  </Table.Row>
                ) : balances?.map((bal, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell><AccountLink val={bal.account} /></Table.Cell>
                    <Table.Cell>{formatSats(bal.balance_sats)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}

const BtcAddressView = ({ addr, tab, page }: { addr: string; tab: AddressTab; page: number }) => {
  const { t } = useTranslation(['pages'])
  const { prices, currency } = useMarketPrices()
  const navigate = useNavigate()
  const offset = (page - 1) * PAGE_SIZE

  const { data: balance } = useBtcBalanceByAccount(addr)
  const { data: depositsCount } = useQuery({
    queryKey: ['hasura-btc-deposits-count', addr],
    queryFn: () => fetchBtcDepositsCountByAccount(addr),
    staleTime: 60000
  })
  const { data: transfersCount } = useQuery({
    queryKey: ['hasura-btc-transfers-count', addr],
    queryFn: () => fetchBtcTransfersCountByAccount(addr),
    staleTime: 60000
  })
  const { data: unmapsCount } = useQuery({
    queryKey: ['hasura-btc-unmaps-count', addr],
    queryFn: () => fetchBtcUnmapsCountByAccount(addr),
    staleTime: 60000
  })

  const { data: transfers, isLoading: transfersLoading } = useQuery({
    queryKey: ['hasura-btc-transfers-by-account', addr, offset],
    queryFn: () => fetchBtcTransfersByAccount(addr, PAGE_SIZE, offset),
    staleTime: 60000,
    enabled: tab === 'transfers'
  })
  const { data: deposits, isLoading: depositsLoading } = useQuery({
    queryKey: ['hasura-btc-deposits-by-account', addr, offset],
    queryFn: () => fetchBtcDepositsByAccount(addr, PAGE_SIZE, offset),
    staleTime: 60000,
    enabled: tab === 'maps'
  })
  const { data: unmaps, isLoading: unmapsLoading } = useQuery({
    queryKey: ['hasura-btc-unmaps-by-account', addr, offset],
    queryFn: () => fetchBtcUnmapsByAccount(addr, PAGE_SIZE, offset),
    staleTime: 60000,
    enabled: tab === 'unmaps'
  })

  const balanceSats = balance?.balance_sats
  const totalCount = (transfersCount ?? 0) + (depositsCount ?? 0) + (unmapsCount ?? 0)

  const tabPath = (t: AddressTab) => `/nam/btc/${addr}/${t}`
  const maxPagesFor = (count: number | undefined) =>
    count === undefined ? 1 : Math.min(MAX_PAGES, Math.max(1, Math.ceil(count / PAGE_SIZE)))

  return (
    <>
      <PageTitle title={t('btc.activityFor', { ns: 'pages', addr })} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('btc.title', { ns: 'pages' })}</Heading>
      <Text fontSize="2xl" opacity={0.7} mb="4">{abbreviateHash(addr, 26, 0)}</Text>
      <hr />
      <Stack direction={{ base: 'column', md: 'row' }} gap="4" mt="4" mb="6">
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.balance', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {balance !== undefined ? (
                  formatSats(balanceSats ?? '0')
                ) : (
                  <Skeleton height="24px" width="120px" />
                )}
              </Stat.ValueText>
              {balanceSats && prices.btc !== undefined && (
                <Text fontSize="sm" opacity={0.7}>
                  ≈ {formatCurrencyValue(parseInt(balanceSats) / 1e8 * prices.btc, currency)}
                </Text>
              )}
            </Stat.Root>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.totalMaps', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {depositsCount !== undefined ? thousandSeperator(depositsCount) : <Skeleton height="24px" width="80px" />}
              </Stat.ValueText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.totalTransfers', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {transfersCount !== undefined ? thousandSeperator(transfersCount) : <Skeleton height="24px" width="80px" />}
              </Stat.ValueText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Stat.Root>
              <Stat.Label>{t('btc.totalUnmaps', { ns: 'pages' })}</Stat.Label>
              <Stat.ValueText>
                {unmapsCount !== undefined ? thousandSeperator(unmapsCount) : <Skeleton height="24px" width="80px" />}
              </Stat.ValueText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
      </Stack>

      <Tabs.Root
        lazyMount
        mt="4"
        colorPalette={themeColorScheme}
        variant="enclosed"
        value={tab}
        onValueChange={(details) => {
          if (ALLOWED_TABS.includes(details.value as AddressTab)) {
            navigate(tabPath(details.value as AddressTab))
          }
        }}
      >
        <Tabs.List overflowX="auto" whiteSpace="nowrap" maxW="100%" display="flex" css={{ '& > button': { flexShrink: 0 } }}>
          <Tabs.Trigger value="transfers">{t('btc.tabs.transfers', { ns: 'pages' })}</Tabs.Trigger>
          <Tabs.Trigger value="maps">{t('btc.tabs.maps', { ns: 'pages' })}</Tabs.Trigger>
          <Tabs.Trigger value="unmaps">{t('btc.tabs.unmaps', { ns: 'pages' })}</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="transfers" mt="2" pt="1">
          <TransfersTable
            transfers={transfers?.map((tx) => ({
              txId: tx.indexer_tx_hash.split('-')[0],
              ts: tx.indexer_ts,
              from: tx.from_addr,
              to: tx.to_addr,
              formattedAmount: formatSats(tx.amount)
            }))}
            isLoading={transfersLoading}
            pagination={{
              path: tabPath('transfers'),
              currentPageNum: page,
              maxPageNum: maxPagesFor(transfersCount)
            }}
          />
        </Tabs.Content>

        <Tabs.Content value="maps" mt="2" pt="1">
          <BtcMapsTable
            deposits={deposits}
            isLoading={depositsLoading}
            pagination={{
              path: tabPath('maps'),
              currentPageNum: page,
              maxPageNum: maxPagesFor(depositsCount)
            }}
          />
        </Tabs.Content>

        <Tabs.Content value="unmaps" mt="2" pt="1">
          <BtcUnmapsTable
            unmaps={unmaps}
            isLoading={unmapsLoading}
            pagination={{
              path: tabPath('unmaps'),
              currentPageNum: page,
              maxPageNum: maxPagesFor(unmapsCount)
            }}
          />
        </Tabs.Content>
      </Tabs.Root>
      {totalCount === 0 && transfersCount !== undefined && depositsCount !== undefined && unmapsCount !== undefined && (
        <Text mt="4" opacity={0.7}>{t('btc.noActivity', { ns: 'pages' })}</Text>
      )}
    </>
  )
}

const BtcMapping = () => {
  const { addr, tab, page } = useParams()
  if (addr) {
    const safeTab: AddressTab = ALLOWED_TABS.includes(tab as AddressTab) ? (tab as AddressTab) : 'transfers'
    const parsedPage = page ? parseInt(page) : 1
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
    return <BtcAddressView addr={addr} tab={safeTab} page={safePage} />
  }
  return <BtcGlobalView />
}

export default BtcMapping
