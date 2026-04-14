import { Heading, Card, Stat, Stack, Table, Skeleton, Text, Box, Icon } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { FaCircleArrowRight } from 'react-icons/fa6'
import { useTranslation } from 'react-i18next'
import { fetchBtcBalances, fetchBtcRecentDeposits, fetchBtcRecentTransfers, fetchBtcVolume24h } from '../../../hasuraRequests'
import { thousandSeperator, timeAgo } from '../../../helpers'
import { themeColorScheme } from '../../../settings'
import { PageTitle } from '../../PageTitle'
import { AccountLink, TxLink } from '../../TableLink'
import { Tooltip } from '../../ui/tooltip'

const formatSats = (sats: string): string => {
  const num = parseInt(sats, 10)
  if (isNaN(num)) return sats
  const btc = num / 1e8
  return btc.toFixed(8) + ' BTC'
}

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
        <Table.ScrollArea>
          <Table.Root variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('btc.txId', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.age', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.from', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader></Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.to', { ns: 'tables' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('btc.amount', { ns: 'tables' })}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {transfersLoading ? (
                <Table.Row>
                  {[...Array(6)].map((_, i) => (
                    <Table.Cell key={i}><Skeleton height="20px" /></Table.Cell>
                  ))}
                </Table.Row>
              ) : transfers?.map((tx, i) => (
                <Table.Row key={i}>
                  <Table.Cell><TxLink val={tx.indexer_tx_hash.split('-')[0]} /></Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={tx.indexer_ts} positioning={{ placement: 'top' }}>
                      {timeAgo(tx.indexer_ts)}
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell><AccountLink val={tx.from_addr} truncate={16} /></Table.Cell>
                  <Table.Cell>
                    <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} aria-label="To" />
                  </Table.Cell>
                  <Table.Cell><AccountLink val={tx.to_addr} truncate={16} /></Table.Cell>
                  <Table.Cell>{formatSats(tx.amount)}</Table.Cell>
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
