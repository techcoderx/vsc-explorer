import { Badge, Icon, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr } from '@chakra-ui/react'
import { FaCircleArrowRight } from 'react-icons/fa6'
import { Link as ReactRouterLink } from 'react-router'
import { LedgerActions, LedgerTx } from '../../types/L2ApiResult'
import { AccountLink, TxLink } from '../TableLink'
import { fmtmAmount, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'

export const StatusBadge = ({ status, action_id }: { status: 'complete' | 'pending'; action_id?: string }) => {
  const color = status === 'complete' ? 'green' : themeColorScheme
  if (status === 'complete' && !!action_id)
    return (
      <Link as={ReactRouterLink} to={'/tx/' + action_id}>
        <Badge colorScheme={color}>{status}</Badge>
      </Link>
    )
  else return <Badge colorScheme={color}>{status}</Badge>
}

export const LedgerTxsTbl = ({ txs }: { txs?: LedgerTx[] }) => {
  return (
    <TableContainer my={'3'}>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th>Tx ID</Th>
            <Th>Age</Th>
            <Th>Type</Th>
            <Th>From</Th>
            <Th></Th>
            <Th>To</Th>
            <Th>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!!txs &&
            txs.map((item, i) => {
              const [id] = item.id.split('#')[0].split('-')
              return (
                <Tr key={i}>
                  <Td>
                    <TxLink val={id} truncate={25} />
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.timestamp} placement="top">
                      {timeAgo(item.timestamp + 'Z')}
                    </Tooltip>
                  </Td>
                  <Td>{item.type}</Td>
                  <Td>
                    <AccountLink val={item.from} />
                  </Td>
                  <Td>
                    <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} />
                  </Td>
                  <Td>
                    <AccountLink val={item.to} />
                  </Td>
                  <Td>{fmtmAmount(item.amount, item.asset)}</Td>
                </Tr>
              )
            })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export const LedgerDeposits = ({ txs }: { txs?: LedgerTx[] }) => {
  return (
    <TableContainer my={'3'}>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th>Tx ID</Th>
            <Th>Age</Th>
            <Th>From User</Th>
            <Th></Th>
            <Th>To User</Th>
            <Th>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!!txs &&
            txs.map((item, i) => (
              <Tr key={i}>
                <Td>
                  <TxLink val={item.id} />
                </Td>
                <Td sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip label={item.timestamp} placement="top">
                    {timeAgo(item.timestamp + 'Z')}
                  </Tooltip>
                </Td>
                <Td>
                  <AccountLink val={(item as LedgerTx).from} />
                </Td>
                <Td>
                  <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} />
                </Td>
                <Td>
                  <AccountLink val={item.to} />
                </Td>
                <Td>{fmtmAmount(item.amount, item.asset)}</Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export const LedgerActionsTbl = ({ actions }: { actions?: LedgerActions[] }) => {
  return (
    <TableContainer my={'3'}>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th>Tx ID</Th>
            <Th>Age</Th>
            <Th>Type</Th>
            <Th>To User</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!!actions &&
            actions.map((item, i) => {
              const [id] = item.id.split('-')
              return (
                <Tr key={i}>
                  <Td>
                    <TxLink val={id.split(':')[0]} />
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.timestamp} placement="top">
                      {timeAgo(item.timestamp + 'Z')}
                    </Tooltip>
                  </Td>
                  <Td>{item.type}</Td>
                  <Td>
                    <AccountLink val={item.to} />
                  </Td>
                  <Td>{fmtmAmount(item.amount, item.type === 'consensus_unstake' ? 'HIVE' : item.asset)}</Td>
                  <Td>
                    <StatusBadge
                      status={item.status}
                      action_id={item.action_id !== item.id ? item.action_id.split('-')[0] : ''}
                    />
                  </Td>
                </Tr>
              )
            })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export const LedgerWithdrawals = ({ actions }: { actions?: LedgerActions[] }) => {
  return (
    <TableContainer my={'3'}>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th>Tx ID</Th>
            <Th>Age</Th>
            <Th>To User</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!!actions &&
            actions.map((item, i) => (
              <Tr key={i}>
                <Td>
                  <TxLink val={item.id.split(':')[0]} />
                </Td>
                <Td sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip label={item.timestamp} placement="top">
                    {timeAgo(item.timestamp + 'Z')}
                  </Tooltip>
                </Td>
                <Td>
                  <AccountLink val={item.to} truncate={30} />
                </Td>
                <Td>{fmtmAmount(item.amount, item.asset)}</Td>
                <Td>
                  <StatusBadge status={item.status} action_id={item.action_id} />
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
