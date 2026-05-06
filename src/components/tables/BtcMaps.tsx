import { Table, Skeleton, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { BtcMappingDeposit } from '../../types/HasuraResult'
import { abbreviateHash, formatSats, timeAgo } from '../../helpers'
import { AccountLink, TxLink } from '../TableLink'
import { ToIcon } from '../CheckXIcon'
import { Tooltip } from '../ui/tooltip'
import Pagination from '../Pagination'

interface BtcMapsTableProps {
  deposits?: BtcMappingDeposit[]
  isLoading?: boolean
  pagination?: {
    path: string
    currentPageNum: number
    maxPageNum: number
  }
}

const BtcMapsTable = ({ deposits, isLoading, pagination }: BtcMapsTableProps) => {
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
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
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
      {pagination && (
        <Box mt="4">
          <Pagination path={pagination.path} currentPageNum={pagination.currentPageNum} maxPageNum={pagination.maxPageNum} />
        </Box>
      )}
    </>
  )
}

export default BtcMapsTable
