import { Heading, Text, Box, Tabs, Table, Skeleton, Stack, Badge } from '@chakra-ui/react'
import { useParams, Outlet, useOutletContext, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  useTokenOverview,
  fetchTokenTransfers,
  fetchTokenTransferCount,
  fetchTokenBalances,
  fetchTokenBalanceCount
} from '../../../hasuraRequests'
import { formatTokenAmount, getNextTabRoute, timeAgo, thousandSeperator } from '../../../helpers'
import { PageTitle } from '../../PageTitle'
import { AccountLink, ContractLink } from '../../TableLink'
import { Tooltip } from '../../ui/tooltip'
import Pagination from '../../Pagination'
import PageNotFound from '../404'
import { themeColorScheme } from '../../../settings'

const count = 100

const tabNames = ['transfers', 'holders']

export const TokenTransfersTab = () => {
  const { contractId, decimals } = useOutletContext<{ contractId: string; decimals: number }>()
  const { page } = useParams()
  const { t } = useTranslation('tables')
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: transfers } = useQuery({
    queryKey: ['hasura-token-transfers', contractId, offset],
    queryFn: () => fetchTokenTransfers(contractId, count, offset),
    staleTime: 60000
  })
  const { data: totalCount } = useQuery({
    queryKey: ['hasura-token-transfer-count', contractId],
    queryFn: () => fetchTokenTransferCount(contractId),
    staleTime: 60000
  })
  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('tokens.age')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.from')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.to')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.amount')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.block')}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transfers?.map((tx, i) => (
              <Table.Row key={i}>
                <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                  <Tooltip content={tx.indexer_ts} positioning={{ placement: 'top' }}>
                    {timeAgo(tx.indexer_ts)}
                  </Tooltip>
                </Table.Cell>
                <Table.Cell>
                  <AccountLink val={tx.from} truncate={16} />
                </Table.Cell>
                <Table.Cell>
                  <AccountLink val={tx.to} truncate={16} />
                </Table.Cell>
                <Table.Cell>{formatTokenAmount(tx.amount, decimals)}</Table.Cell>
                <Table.Cell>{thousandSeperator(tx.indexer_block_height)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Box mt="4">
        <Pagination path={`/tokens/${contractId}/transfers`} currentPageNum={pageNum} maxPageNum={Math.ceil((totalCount || 0) / count)} />
      </Box>
    </Box>
  )
}

export const TokenHoldersTab = () => {
  const { contractId, decimals } = useOutletContext<{ contractId: string; decimals: number }>()
  const { page } = useParams()
  const { t } = useTranslation('tables')
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: balances } = useQuery({
    queryKey: ['hasura-token-balances', contractId, offset],
    queryFn: () => fetchTokenBalances(contractId, count, offset),
    staleTime: 60000
  })
  const { data: totalCount } = useQuery({
    queryKey: ['hasura-token-balance-count', contractId],
    queryFn: () => fetchTokenBalanceCount(contractId),
    staleTime: 60000
  })
  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>#</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.account')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.balance')}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {balances?.map((bal, i) => (
              <Table.Row key={i}>
                <Table.Cell>{offset + i + 1}</Table.Cell>
                <Table.Cell>
                  <AccountLink val={bal.account} />
                </Table.Cell>
                <Table.Cell>{formatTokenAmount(bal.balance, decimals)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Box mt="4">
        <Pagination path={`/tokens/${contractId}/holders`} currentPageNum={pageNum} maxPageNum={Math.ceil((totalCount || 0) / count)} />
      </Box>
    </Box>
  )
}

const TokenDetail = () => {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { contractId } = useParams()
  const { data: token, isLoading } = useTokenOverview(contractId!)
  const segments = pathname.split('/')
  const tabValue = segments.length >= 4 ? segments[3] : tabNames[0]

  if (!contractId) return <PageNotFound />
  if (isLoading)
    return (
      <>
        <Skeleton height="40px" width="300px" mb="4" />
        <Skeleton height="200px" />
      </>
    )
  if (!token) return <PageNotFound />

  return (
    <>
      <PageTitle title={`${token.name} (${token.symbol})`} />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="start">
        <Box>
          <Heading as="h1" size="5xl" fontWeight="normal">
            {token.name} ({token.symbol})
          </Heading>
          <Box fontSize="lg" opacity="0.7" mb="4">
            <ContractLink val={token.contract_id} truncate={30} />
          </Box>
        </Box>
        {token.paused && <Badge colorPalette="red" fontSize="md">Paused</Badge>}
      </Stack>
      <hr />
      <Stack direction={{ base: 'column', md: 'row' }} gap="6" mt="4" mb="4" flexWrap="wrap">
        <Box>
          <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('tokens.currentSupply')}</Text>
          <Text fontSize="lg">{formatTokenAmount(token.current_supply, token.decimals)}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('tokens.maxSupply')}</Text>
          <Text fontSize="lg">{token.max_supply === '0' ? 'Unlimited' : formatTokenAmount(token.max_supply, token.decimals)}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('tokens.decimals')}</Text>
          <Text fontSize="lg">{token.decimals}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('tokens.owner')}</Text>
          <AccountLink val={token.owner} />
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('tokens.created')}</Text>
          <Tooltip content={token.init_ts} positioning={{ placement: 'top' }}>
            <Text fontSize="lg">{timeAgo(token.init_ts)}</Text>
          </Tooltip>
        </Box>
      </Stack>
      <Tabs.Root
        mt="4"
        colorPalette={themeColorScheme}
        variant="enclosed"
        value={tabValue}
        onValueChange={(details) => {
          const newIdx = tabNames.indexOf(details.value)
          navigate(getNextTabRoute(tabNames, segments, newIdx), { preventScrollReset: true })
        }}
      >
        <Tabs.List>
          <Tabs.Trigger value="transfers">{t('tokens.tabs.transfers')}</Tabs.Trigger>
          <Tabs.Trigger value="holders">{t('tokens.tabs.holders')}</Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Outlet context={{ contractId, decimals: token.decimals }} />
        </Box>
      </Tabs.Root>
    </>
  )
}

export default TokenDetail
