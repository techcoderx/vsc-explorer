import { Heading, Card, Stat, Stack, Table, Skeleton, Text, Box } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchBtcBalances, fetchBtcRecentDeposits, fetchBtcRecentTransfers, fetchBtcRecentUnmaps, fetchBtcVolume24h } from '../../../hasuraRequests'
import { thousandSeperator, timeAgo, formatSats, abbreviateHash } from '../../../helpers'
import { PageTitle } from '../../PageTitle'
import { AccountLink, TxLink } from '../../TableLink'
import { Tooltip } from '../../ui/tooltip'
import TransfersTable from '../../tables/Transfers'



const BtcMapping = () => {
  const { t } = useTranslation(['pages', 'tables'])
  const { data: volume24h } = useQuery({
    queryKey: ['hasura-btc-volume-24h'],
    queryFn: fetchBtcVolume24h,
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
      </Stack>

      <Stack direction={{ base: 'column', lg: 'row' }} gap="6">
        <Box flex="1">
          <Text fontSize="xl" fontWeight="bold" mb="3">{t('btc.topBalances', { ns: 'pages' })}</Text>
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
        </Box>

        <Box flex="1">
          <Text fontSize="xl" fontWeight="bold" mb="3">{t('btc.recentMaps', { ns: 'pages' })}</Text>
          <Table.ScrollArea>
            <Table.Root variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>{t('btc.age', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('btc.recipient', { ns: 'tables' })}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('btc.amount', { ns: 'tables' })}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {depositsLoading ? (
                  <Table.Row>
                    {[...Array(3)].map((_, i) => (
                      <Table.Cell key={i}><Skeleton height="20px" /></Table.Cell>
                    ))}
                  </Table.Row>
                ) : deposits?.map((dep, i) => (
                  <Table.Row key={i}>
                    <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                      <Tooltip content={dep.indexer_ts} positioning={{ placement: 'top' }}>
                        {timeAgo(dep.indexer_ts)}
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell><AccountLink val={dep.recipient} truncate={16} /></Table.Cell>
                    <Table.Cell>{formatSats(dep.amount)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      </Stack>

      <Box mt="6">
        <Text fontSize="xl" fontWeight="bold" mb="3">{t('btc.recentTransfers', { ns: 'pages' })}</Text>
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
      </Box>

      <Box mt="6">
        <Text fontSize="xl" fontWeight="bold" mb="3">{t('btc.recentUnmaps', { ns: 'pages' })}</Text>
        <Table.ScrollArea>
          <Table.Root variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('transfers.txId', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.age', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.from', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.btcAddress', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.amount', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.fee', { ns: 'tables' })}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {unmapsLoading ? (
                <Table.Row>
                  {[...Array(6)].map((_, i) => (
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
      </Box>
    </>
  )
}

export default BtcMapping
