import { Table, Skeleton, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { NormalizedTransfer } from '../../types/HasuraResult'
import { timeAgo } from '../../helpers'
import { AccountLink, TxLink } from '../TableLink'
import { ToIcon } from '../CheckXIcon'
import { Tooltip } from '../ui/tooltip'
import Pagination from '../Pagination'

interface TransfersTableProps {
  transfers?: NormalizedTransfer[]
  isLoading?: boolean
  pagination?: {
    path: string
    currentPageNum: number
    maxPageNum: number
  }
}

const TransfersTable = ({ transfers, isLoading, pagination }: TransfersTableProps) => {
  const { t } = useTranslation('tables')
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
            ) : transfers?.map((tx, i) => (
              <Table.Row key={i}>
                <Table.Cell><TxLink val={tx.txId} /></Table.Cell>
                <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                  <Tooltip content={tx.ts} positioning={{ placement: 'top' }}>
                    {timeAgo(tx.ts)}
                  </Tooltip>
                </Table.Cell>
                <Table.Cell><AccountLink val={tx.from} truncate={16} /></Table.Cell>
                <Table.Cell><ToIcon /></Table.Cell>
                <Table.Cell><AccountLink val={tx.to} truncate={16} /></Table.Cell>
                <Table.Cell>{tx.formattedAmount}</Table.Cell>
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

export default TransfersTable
