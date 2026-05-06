import { Table, Skeleton, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { BtcMappingUnmap } from '../../types/HasuraResult'
import { abbreviateHash, formatSats, timeAgo } from '../../helpers'
import { AccountLink, TxLink } from '../TableLink'
import { ToIcon } from '../CheckXIcon'
import { Tooltip } from '../ui/tooltip'
import Pagination from '../Pagination'

interface BtcUnmapsTableProps {
  unmaps?: BtcMappingUnmap[]
  isLoading?: boolean
  pagination?: {
    path: string
    currentPageNum: number
    maxPageNum: number
  }
}

const BtcUnmapsTable = ({ unmaps, isLoading, pagination }: BtcUnmapsTableProps) => {
  const { t } = useTranslation(['tables'])
  return (
    <>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('transfers.txId')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('transfers.age')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('transfers.from')}</Table.ColumnHeader>
              <Table.ColumnHeader></Table.ColumnHeader>
              <Table.ColumnHeader>{t('transfers.to')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('transfers.amount')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('btc.fee')}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
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
      {pagination && (
        <Box mt="4">
          <Pagination path={pagination.path} currentPageNum={pagination.currentPageNum} maxPageNum={pagination.maxPageNum} />
        </Box>
      )}
    </>
  )
}

export default BtcUnmapsTable
