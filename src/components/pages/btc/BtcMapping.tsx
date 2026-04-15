import { Heading, Card, Stat, Stack, Table, Skeleton, Tabs } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchBtcBalances, fetchBtcRecentDeposits, fetchBtcRecentTransfers, fetchBtcRecentUnmaps, fetchBtcTvl, fetchBtcUnmaps24h, fetchBtcVolume24h } from '../../../hasuraRequests'
import { thousandSeperator, timeAgo, formatSats, abbreviateHash } from '../../../helpers'
import { themeColorScheme } from '../../../settings'
import { PageTitle } from '../../PageTitle'
import { AccountLink, TxLink } from '../../TableLink'
import { ToIcon } from '../../CheckXIcon'
import { Tooltip } from '../../ui/tooltip'
import TransfersTable from '../../tables/Transfers'



const BtcMapping = () => {
  const { t } = useTranslation(['pages', 'tables'])
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

      <Tabs.Root mt="4" colorPalette={themeColorScheme} variant="enclosed" defaultValue="0">
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
          <Table.ScrollArea>
            <Table.Root variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>{t('transfers.txId', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.age', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.from', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.to', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.amount', { ns: 'tables' })}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {depositsLoading ? (
                  <Table.Row>
                    {[...Array(6)].map((_, i) => (
                      <Table.Cell key={i}><Skeleton height="20px" /></Table.Cell>
                    ))}
                  </Table.Row>
                ) : deposits?.map((dep, i) => (
                  <Table.Row key={i}>
                    <Table.Cell><TxLink val={dep.indexer_tx_hash.split('-')[0]} /></Table.Cell>
                    <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                      <Tooltip content={dep.indexer_ts} positioning={{ placement: 'top' }}>
                        {timeAgo(dep.indexer_ts)}
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell>
                      {dep.sender ? (
                        <Tooltip content={dep.sender} positioning={{ placement: 'top' }}>
                          {abbreviateHash(dep.sender, 10, 10)}
                        </Tooltip>
                      ) : 'N/A'}
                    </Table.Cell>
                    <Table.Cell><ToIcon /></Table.Cell>
                    <Table.Cell><AccountLink val={dep.recipient} truncate={16} /></Table.Cell>
                    <Table.Cell>{formatSats(dep.amount)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Tabs.Content>

        <Tabs.Content value="2" mt="2" pt="1">
          <Table.ScrollArea>
            <Table.Root variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>{t('transfers.txId', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.age', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.from', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.to', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('transfers.amount', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('btc.fee', { ns: 'tables' })}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {unmapsLoading ? (
                  <Table.Row>
                    {[...Array(7)].map((_, i) => (
                      <Table.Cell key={i}><Skeleton height="20px" /></Table.Cell>
                    ))}
                  </Table.Row>
                ) : unmaps?.map((unmap, i) => (
                  <Table.Row key={i}>
                    <Table.Cell><TxLink val={unmap.indexer_tx_hash.split('-')[0]} /></Table.Cell>
                    <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                      <Tooltip content={unmap.indexer_ts} positioning={{ placement: 'top' }}>
                        {timeAgo(unmap.indexer_ts)}
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell><AccountLink val={unmap.from_addr} truncate={16} /></Table.Cell>
                    <Table.Cell><ToIcon /></Table.Cell>
                    <Table.Cell>
                      {unmap.to_addr ? (
                        <Tooltip content={unmap.to_addr} positioning={{ placement: 'top' }}>
                          {abbreviateHash(unmap.to_addr, 10, 10)}
                        </Tooltip>
                      ) : 'N/A'}
                    </Table.Cell>
                    <Table.Cell>{formatSats(unmap.deducted)}</Table.Cell>
                    <Table.Cell>{formatSats((BigInt(unmap.deducted) - BigInt(unmap.sent)).toString())}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
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

export default BtcMapping
