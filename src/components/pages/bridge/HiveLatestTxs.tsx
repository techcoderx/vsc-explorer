import { Text, TableContainer, Table, Tbody, Thead, Tr, Th, Td, Tooltip, Skeleton, Link, Badge, Icon } from '@chakra-ui/react'
import { Link as ReactRouterLink, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getBridgeTxCounts, getDeposits, getWithdrawals } from '../../../requests'
import { fmtmAmount, timeAgo } from '../../../helpers'
import { BridgeCounter } from '../../../types/HafApiResult'
import Pagination from '../../Pagination'
import PageNotFound from '../404'
import { LedgerActions, LedgerTx } from '../../../types/L2ApiResult'
import { AccountLink, TxLink } from '../../TableLink'
import { themeColorScheme } from '../../../settings'
import { FaCircleArrowRight } from 'react-icons/fa6'

const count = 100
const maxPage = 100

interface Commons {
  tally: BridgeCounter
  pageNumber: number
}

const StatusBadge = ({ tx }: { tx: LedgerActions }) => {
  if (tx.status === 'complete')
    return (
      <Link as={ReactRouterLink} to={'/tx/' + tx.action_id}>
        <Badge colorScheme={'green'}>{tx.status}</Badge>
      </Link>
    )
  else return <Badge colorScheme={themeColorScheme}>{tx.status}</Badge>
}

export const BridgeTxsTable = ({
  type,
  txs,
  isLoading,
  isSuccess,
  currentPage,
  txCount
}: {
  type: 'deposits' | 'withdrawals'
  txs: (LedgerTx | LedgerActions)[]
  isLoading: boolean
  isSuccess: boolean
  currentPage: number
  txCount: number
}) => {
  return (
    <>
      <TableContainer m={'15px 0px'}>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th>Tx ID</Th>
              <Th>Age</Th>
              {type === 'deposits' ? <Th>From User</Th> : null}
              {type === 'deposits' ? <Th></Th> : null}
              <Th>To User</Th>
              <Th>Amount</Th>
              {type === 'withdrawals' ? <Th>Status</Th> : null}
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
                    <TxLink val={item.id} tooltip={true} />
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.timestamp} placement="top">
                      {timeAgo(item.timestamp + 'Z')}
                    </Tooltip>
                  </Td>
                  {type === 'deposits' ? (
                    <Td>
                      <AccountLink val={(item as LedgerTx).from} truncate={30} />
                    </Td>
                  ) : null}
                  {type === 'deposits' ? (
                    <Td>
                      <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} />
                    </Td>
                  ) : null}
                  <Td>
                    <AccountLink val={item.to} truncate={30} tooltip={true} />
                  </Td>
                  <Td>{fmtmAmount(item.amount, item.asset)}</Td>
                  {type === 'withdrawals' ? (
                    <Td>
                      <StatusBadge tx={item as LedgerActions} />
                    </Td>
                  ) : null}
                </Tr>
              ))
            ) : (
              <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination
        path={'/bridge/hive/' + type}
        currentPageNum={currentPage}
        maxPageNum={Math.min(maxPage, Math.ceil(txCount / count))}
      />
    </>
  )
}

export const HiveDeposits = ({ tally, pageNumber }: Commons) => {
  const offset = (pageNumber - 1) * count
  const {
    data: deposits,
    isSuccess: isDepSuccess,
    isLoading: isDepLoading
  } = useQuery({
    queryKey: ['vsc-list-deposits-hive', offset, count],
    queryFn: async () => getDeposits(offset, count)
  })
  return (
    <>
      <Text fontSize={'5xl'}>Hive Bridge Deposits</Text>
      <hr />
      <br />
      <Text>Total {tally.deposits} deposits</Text>
      <BridgeTxsTable
        type="deposits"
        txs={deposits?.deposits || []}
        isLoading={isDepLoading}
        isSuccess={isDepSuccess}
        currentPage={pageNumber}
        txCount={tally.deposits}
      />
    </>
  )
}

export const HiveWithdrawals = ({ tally, pageNumber }: Commons) => {
  const offset = (pageNumber - 1) * count
  const {
    data: withdrawals,
    isSuccess: isWithdSuccess,
    isLoading: isWithdLoading
  } = useQuery({
    queryKey: ['vsc-list-withdrawals-hive', offset, count],
    queryFn: async () => getWithdrawals(offset, count)
  })
  return (
    <>
      <Text fontSize={'5xl'}>Hive Bridge Withdrawals</Text>
      <hr />
      <br />
      <Text>Total {tally.withdrawals} withdrawals</Text>
      <BridgeTxsTable
        type="withdrawals"
        txs={withdrawals?.withdrawals || []}
        isLoading={isWithdLoading}
        isSuccess={isWithdSuccess}
        currentPage={pageNumber}
        txCount={tally.withdrawals}
      />
    </>
  )
}

export const HiveBridgeLatestTxs = ({ kind }: { kind: 'd' | 'w' }) => {
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data } = useQuery({ queryKey: ['vsc-bridge-tx-count'], queryFn: async () => getBridgeTxCounts() })
  const tally: BridgeCounter = data || {
    deposits: 0,
    withdrawals: 0
  }
  if (invalidPage) return <PageNotFound />
  else if (kind === 'd') return <HiveDeposits tally={tally} pageNumber={pageNumber} />
  else return <HiveWithdrawals tally={tally} pageNumber={pageNumber} />
}
