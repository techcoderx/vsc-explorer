import { Heading, Box, Tabs, Table, Skeleton, Stack, Badge } from '@chakra-ui/react'
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
import { formatTokenAmount, getNextTabRoute, timeAgo } from '../../../helpers'
import { PageTitle } from '../../PageTitle'
import { AccountLink, ContractLink } from '../../TableLink'
import { ProgressBarPct } from '../../ProgressPercent'
import Pagination from '../../Pagination'
import TransfersTable from '../../tables/Transfers'
import PageNotFound from '../404'
import { themeColorScheme } from '../../../settings'
import { TokenOverview } from '../../../types/HasuraResult'
import TableRow from '../../TableRow'

const count = 100

const tabNames = ['transfers', 'holders', 'info']

export const TokenInfoTab = () => {
  const { token } = useOutletContext<{ token: TokenOverview }>()
  const { t } = useTranslation('pages')
  return (
    <Table.ScrollArea>
      <Table.Root>
        <Table.Body>
          <TableRow label={t('tokens.currentSupply')} value={formatTokenAmount(token.current_supply, token.decimals)} />
          <TableRow
            label={t('tokens.maxSupply')}
            value={token.max_supply === '0' ? 'Unlimited' : formatTokenAmount(token.max_supply, token.decimals)}
          />
          <TableRow label={t('tokens.decimals')} value={token.decimals} />
          <TableRow label={t('tokens.owner')}>
            <AccountLink val={token.owner} />
          </TableRow>
          <TableRow label={t('tokens.created')} value={token.init_ts + ' (' + timeAgo(token.init_ts) + ')'} />
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

export const TokenTransfersTab = () => {
  const { contractId, decimals, symbol } = useOutletContext<{ contractId: string; decimals: number; symbol: string }>()
  const { page } = useParams()
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
    <TransfersTable
      transfers={transfers?.map((tx) => ({
        txId: tx.indexer_tx_hash,
        ts: tx.indexer_ts,
        from: tx.from,
        to: tx.to,
        formattedAmount: formatTokenAmount(tx.amount, decimals) + ' ' + symbol
      }))}
      pagination={{
        path: `/token/${contractId}/transfers`,
        currentPageNum: pageNum,
        maxPageNum: Math.ceil((totalCount || 0) / count)
      }}
    />
  )
}

export const TokenHoldersTab = () => {
  const { contractId, decimals, currentSupply } = useOutletContext<{ contractId: string; decimals: number; currentSupply: string }>()
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
  const supplyNum = parseFloat(currentSupply)
  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>#</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.account')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.balance')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.supplyPct')}</Table.ColumnHeader>
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
                <Table.Cell>
                  {supplyNum > 0 ? <ProgressBarPct val={(parseFloat(bal.balance) / supplyNum) * 100} width="240px" /> : '—'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Box mt="4">
        <Pagination path={`/token/${contractId}/holders`} currentPageNum={pageNum} maxPageNum={Math.ceil((totalCount || 0) / count)} />
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
      <PageTitle title={token.symbol} />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="start">
        <Box>
          <Heading as="h1" size="5xl" fontWeight="normal">
            Token
          </Heading>
          <Box fontSize="lg" opacity="0.7" mb="4">
            <ContractLink val={token.contract_id} truncate={30} />
          </Box>
        </Box>
        {token.paused && <Badge colorPalette="red" fontSize="md">Paused</Badge>}
      </Stack>
      <hr />
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
          <Tabs.Trigger value="info">{t('tokens.tabs.info')}</Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Outlet context={{ contractId, decimals: token.decimals, symbol: token.symbol, currentSupply: token.current_supply, token }} />
        </Box>
      </Tabs.Root>
    </>
  )
}

export default TokenDetail
