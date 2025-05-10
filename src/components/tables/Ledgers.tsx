import { Badge, Icon, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr } from '@chakra-ui/react'
import { FaCircleArrowRight } from 'react-icons/fa6'
import { Link as ReactRouterLink } from 'react-router'
import { LedgerActions, LedgerTx } from '../../types/L2ApiResult'
import { AccountLink, TxLink } from '../TableLink'
import { fmtmAmount, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'

const StatusBadge = ({ tx }: { tx: LedgerActions }) => {
  if (tx.status === 'complete')
    return (
      <Link as={ReactRouterLink} to={'/tx/' + tx.action_id}>
        <Badge colorScheme={'green'}>{tx.status}</Badge>
      </Link>
    )
  else return <Badge colorScheme={themeColorScheme}>{tx.status}</Badge>
}

export const LedgerTxsTbl = ({ txs }: { txs?: LedgerTx[] }) => {
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
                  <TxLink val={item.id} tooltip={true} />
                </Td>
                <Td sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip label={item.timestamp} placement="top">
                    {timeAgo(item.timestamp + 'Z')}
                  </Tooltip>
                </Td>
                <Td>
                  <AccountLink val={(item as LedgerTx).from} truncate={30} />
                </Td>
                <Td>
                  <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} />
                </Td>
                <Td>
                  <AccountLink val={item.to} truncate={30} tooltip={true} />
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
                  <TxLink val={item.id} tooltip={true} />
                </Td>
                <Td sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip label={item.timestamp} placement="top">
                    {timeAgo(item.timestamp + 'Z')}
                  </Tooltip>
                </Td>
                <Td>
                  <AccountLink val={item.to} truncate={30} tooltip={true} />
                </Td>
                <Td>{fmtmAmount(item.amount, item.asset)}</Td>
                <Td>
                  <StatusBadge tx={item as LedgerActions} />
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
