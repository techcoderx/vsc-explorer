import { Text, TableContainer, Table, Tbody, Thead, Tr, Th, Td, Tooltip, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchLatestDepositsHive, fetchLatestWithdrawalsHive } from '../../../requests'
import { thousandSeperator, timeAgo } from '../../../helpers'
import { HiveBridgeTx } from '../../../types/HafApiResult'
import Pagination from '../../Pagination'

const count = 100

const TxsTable = ({
  type,
  txs,
  isLoading,
  isSuccess,
  currentPage,
  txCount
}: {
  type: string
  txs?: HiveBridgeTx[]
  isLoading: boolean
  isSuccess: boolean
  currentPage: number
  txCount?: number
}) => {
  return (
    <>
      <TableContainer m={'15px 0px'}>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Age</Th>
              <Th>To User</Th>
              <Th>Tx ID</Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                {[...Array(5)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton height="20px" />
                  </Td>
                ))}
              </Tr>
            ) : isSuccess ? (
              txs?.map((item, i) => (
                <Tr key={i}>
                  <Td>
                    <Link as={ReactRouterLink} to={'/tx/' + item.in_op}>
                      {item.id}
                    </Link>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.ts} placement="top">
                      {timeAgo(item.ts)}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/@' + item.username}>
                      {item.username}
                    </Link>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/tx/' + item.in_op}>
                      {item.in_op}
                    </Link>
                  </Td>
                  <Td>{thousandSeperator(item.amount)}</Td>
                </Tr>
              ))
            ) : (
              <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination path={'/bridge/hive/' + type} currentPageNum={currentPage} maxPageNum={Math.ceil((txCount || 0) / count)} />
    </>
  )
}

export const HiveDeposits = () => {
  // TODO: Deposit to DID key
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data: depositCount, isSuccess: isLatestTxSuccess } = useQuery({
    queryKey: ['vsc-deposit-count'],
    queryFn: async () => {
      const latestRecord = await fetchLatestDepositsHive(null, 1)
      return latestRecord.length > 0 ? latestRecord[0].id : 0
    },
    enabled: !invalidPage
  })
  const {
    data: deposits,
    isSuccess: isDepSuccess,
    isLoading: isDepLoading
  } = useQuery({
    queryKey: ['vsc-list-deposits-hive', null, count],
    queryFn: async () => fetchLatestDepositsHive(null, count),
    enabled: !invalidPage && typeof depositCount === 'number'
  })
  return (
    <>
      <Text fontSize={'5xl'}>Hive Bridge Deposits</Text>
      <hr />
      <br />
      <Text>Total {isLatestTxSuccess ? depositCount : 0} deposits</Text>
      <TxsTable
        type="deposits"
        txs={deposits}
        txCount={depositCount}
        currentPage={pageNumber}
        isLoading={isDepLoading}
        isSuccess={isDepSuccess}
      />
    </>
  )
}

export const HiveWithdrawals = () => {
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data: withdrawalCount, isSuccess: isLatestTxSuccess } = useQuery({
    queryKey: ['vsc-withdrawal-count'],
    queryFn: async () => {
      const latestRecord = await fetchLatestWithdrawalsHive(null, 1)
      return latestRecord.length > 0 ? latestRecord[0].id : 0
    },
    enabled: !invalidPage
  })
  const paginate = Math.max((withdrawalCount || 0) - (pageNumber - 1) * count, 0)
  const {
    data: withdrawals,
    isSuccess: isWithdSuccess,
    isLoading: isWithdLoading
  } = useQuery({
    queryKey: ['vsc-list-withdrawals-hive', paginate, count],
    queryFn: async () => fetchLatestWithdrawalsHive(paginate, count),
    enabled: !invalidPage && typeof withdrawalCount === 'number'
  })
  return (
    <>
      <Text fontSize={'5xl'}>Hive Bridge Withdrawals</Text>
      <hr />
      <br />
      <Text>Total {isLatestTxSuccess ? withdrawalCount : 0} withdrawals</Text>
      <TxsTable
        type="withdrawals"
        txs={withdrawals}
        txCount={withdrawalCount}
        currentPage={pageNumber}
        isLoading={isWithdLoading}
        isSuccess={isWithdSuccess}
      />
    </>
  )
}
