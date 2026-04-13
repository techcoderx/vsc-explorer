import { Heading, Text, Box, Tabs, Table, Skeleton, Stack, Badge } from '@chakra-ui/react'
import { useParams, Outlet, useOutletContext, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  fetchNftRegistry,
  fetchNftTransfers,
  fetchNftTransferCount,
  fetchNftTokens,
  fetchNftTokenCount
} from '../../../hasuraRequests'
import { getNextTabRoute, timeAgo, thousandSeperator } from '../../../helpers'
import { PageTitle } from '../../PageTitle'
import { AccountLink, ContractLink } from '../../TableLink'
import { Tooltip } from '../../ui/tooltip'
import Pagination from '../../Pagination'
import PageNotFound from '../404'
import { themeColorScheme } from '../../../settings'
import { NftRegistry } from '../../../types/HasuraResult'

const count = 100

const tabNames = ['tokens', 'transfers']

export const NftTokensTab = () => {
  const { contractId } = useOutletContext<{ contractId: string; nft: NftRegistry }>()
  const { page } = useParams()
  const { t } = useTranslation('tables')
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: tokens } = useQuery({
    queryKey: ['hasura-nft-tokens', contractId, offset],
    queryFn: () => fetchNftTokens(contractId, count, offset),
    staleTime: 60000
  })
  const { data: totalCount } = useQuery({
    queryKey: ['hasura-nft-token-count', contractId],
    queryFn: () => fetchNftTokenCount(contractId),
    staleTime: 60000
  })
  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('nfts.tokenId')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.maxSupply')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.soulbound')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.created')}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tokens?.map((token, i) => (
              <Table.Row key={i}>
                <Table.Cell>{token.token_id}</Table.Cell>
                <Table.Cell>{token.max_supply === '0' ? 'Unlimited' : thousandSeperator(token.max_supply)}</Table.Cell>
                <Table.Cell>
                  {token.soulbound ? <Badge colorPalette="purple">Soulbound</Badge> : 'No'}
                </Table.Cell>
                <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                  <Tooltip content={token.created_ts} positioning={{ placement: 'top' }}>
                    {timeAgo(token.created_ts)}
                  </Tooltip>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Box mt="4">
        <Pagination path={`/nfts/${contractId}/tokens`} currentPageNum={pageNum} maxPageNum={Math.ceil((totalCount || 0) / count)} />
      </Box>
    </Box>
  )
}

export const NftTransfersTab = () => {
  const { contractId } = useOutletContext<{ contractId: string; nft: NftRegistry }>()
  const { page } = useParams()
  const { t } = useTranslation('tables')
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: transfers } = useQuery({
    queryKey: ['hasura-nft-transfers', contractId, offset],
    queryFn: () => fetchNftTransfers(contractId, count, offset),
    staleTime: 60000
  })
  const { data: totalCount } = useQuery({
    queryKey: ['hasura-nft-transfer-count', contractId],
    queryFn: () => fetchNftTransferCount(contractId),
    staleTime: 60000
  })
  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('nfts.age')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.from')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.to')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.tokenId')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.value')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.block')}</Table.ColumnHeader>
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
                <Table.Cell>{tx.token_id}</Table.Cell>
                <Table.Cell>{tx.value}</Table.Cell>
                <Table.Cell>{thousandSeperator(tx.indexer_block_height)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Box mt="4">
        <Pagination path={`/nfts/${contractId}/transfers`} currentPageNum={pageNum} maxPageNum={Math.ceil((totalCount || 0) / count)} />
      </Box>
    </Box>
  )
}

const NftDetail = () => {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { contractId } = useParams()
  const { data: nfts, isLoading } = useQuery({
    queryKey: ['hasura-nft-registry-detail', contractId],
    queryFn: async () => {
      const all = await fetchNftRegistry()
      return all.find((n) => n.contract_id === contractId) ?? null
    },
    staleTime: 60000
  })
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
  if (!nfts) return <PageNotFound />

  return (
    <>
      <PageTitle title={`${nfts.name} (${nfts.symbol})`} />
      <Box>
        <Heading as="h1" size="5xl" fontWeight="normal">
          {nfts.name} ({nfts.symbol})
        </Heading>
        <Box fontSize="lg" opacity="0.7" mb="4">
          <ContractLink val={nfts.contract_id} truncate={30} />
        </Box>
      </Box>
      <hr />
      <Stack direction={{ base: 'column', md: 'row' }} gap="6" mt="4" mb="4" flexWrap="wrap">
        <Box>
          <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('nfts.owner')}</Text>
          <AccountLink val={nfts.owner} />
        </Box>
        {nfts.base_uri && (
          <Box>
            <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('nfts.baseUri')}</Text>
            <Text fontSize="lg">{nfts.base_uri}</Text>
          </Box>
        )}
        <Box>
          <Text fontWeight="bold" fontSize="sm" opacity="0.6">{t('nfts.created')}</Text>
          <Tooltip content={nfts.init_ts} positioning={{ placement: 'top' }}>
            <Text fontSize="lg">{timeAgo(nfts.init_ts)}</Text>
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
          <Tabs.Trigger value="tokens">{t('nfts.tabs.tokens')}</Tabs.Trigger>
          <Tabs.Trigger value="transfers">{t('nfts.tabs.transfers')}</Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Outlet context={{ contractId, nft: nfts }} />
        </Box>
      </Tabs.Root>
    </>
  )
}

export default NftDetail
