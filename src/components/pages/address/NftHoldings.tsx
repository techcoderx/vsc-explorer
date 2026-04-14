import { Box, Table, Text } from '@chakra-ui/react'
import { useOutletContext, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchNftBalancesByAccount, fetchNftBalanceCountByAccount } from '../../../hasuraRequests'
import { timeAgo } from '../../../helpers'
import { ContractLink } from '../../TableLink'
import { Tooltip } from '../../ui/tooltip'
import Pagination from '../../Pagination'

const count = 100

export const AddressNftHoldings = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const { t } = useTranslation('tables')
  const pageNum = parseInt(page || '1')
  const offset = (pageNum - 1) * count
  const { data: nfts, isLoading } = useQuery({
    queryKey: ['hasura-nft-by-account', addr, offset, count],
    queryFn: () => fetchNftBalancesByAccount(addr, count, offset),
    staleTime: 60000
  })
  const { data: totalCount } = useQuery({
    queryKey: ['hasura-nft-by-account-count', addr],
    queryFn: () => fetchNftBalanceCountByAccount(addr),
    staleTime: 60000
  })
  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('nfts.contractId')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.tokenId')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.value')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.age')}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? null : nfts?.length ? (
              nfts.map((nft, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <ContractLink val={nft.indexer_contract_id} truncate={20} />
                  </Table.Cell>
                  <Table.Cell>{nft.token_id}</Table.Cell>
                  <Table.Cell>{nft.value}</Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={nft.indexer_ts} positioning={{ placement: 'top' }}>
                      {timeAgo(nft.indexer_ts)}
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Text opacity="0.6">{t('nfts.noHoldings')}</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Box mt="4">
        <Pagination path={`/address/${addr}/nfts`} currentPageNum={pageNum} maxPageNum={Math.ceil((totalCount || 0) / count)} />
      </Box>
    </Box>
  )
}
