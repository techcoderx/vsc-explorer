import { Badge, Icon, Link, Table } from '@chakra-ui/react'
import { FaCircleArrowRight } from 'react-icons/fa6'
import { Link as ReactRouterLink } from 'react-router'
import { LedgerActions, LedgerTx } from '../../types/L2ApiResult'
import { AccountLink, TxLink } from '../TableLink'
import { fmtmAmount, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'
import { Tooltip } from '../ui/tooltip'

export const StatusBadge = ({ status, action_id }: { status: 'complete' | 'pending'; action_id?: string }) => {
  const color = status === 'complete' ? 'green' : themeColorScheme
  if (status === 'complete' && !!action_id)
    return (
      <Link asChild>
        <ReactRouterLink to={'/tx/' + action_id}>
          <Badge colorPalette={color}>{status}</Badge>
        </ReactRouterLink>
      </Link>
    )
  else return <Badge colorPalette={color}>{status}</Badge>
}

export const LedgerTxsTbl = ({ txs }: { txs?: LedgerTx[] }) => {
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root variant={'line'}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tx ID</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>From</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>To</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!!txs &&
            txs.map((item, i) => {
              const [id] = item.id.split('#')[0].split('-')
              return (
                <Table.Row key={i}>
                  <Table.Cell>
                    <TxLink val={id} truncate={25} />
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={item.timestamp} positioning={{ placement: 'top' }}>
                      {timeAgo(item.timestamp + 'Z')}
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>{item.type}</Table.Cell>
                  <Table.Cell>
                    <AccountLink val={item.from} />
                  </Table.Cell>
                  <Table.Cell>
                    <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} aria-label="To" />
                  </Table.Cell>
                  <Table.Cell>
                    <AccountLink val={item.to} />
                  </Table.Cell>
                  <Table.Cell>{fmtmAmount(item.amount, item.asset)}</Table.Cell>
                </Table.Row>
              )
            })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

export const LedgerDeposits = ({ txs }: { txs?: LedgerTx[] }) => {
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root variant={'line'}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tx ID</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>From User</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>To User</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!!txs &&
            txs.map((item, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <TxLink val={item.id} />
                </Table.Cell>
                <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                  <Tooltip content={item.timestamp} positioning={{ placement: 'top' }}>
                    {timeAgo(item.timestamp + 'Z')}
                  </Tooltip>
                </Table.Cell>
                <Table.Cell>
                  <AccountLink val={(item as LedgerTx).from} />
                </Table.Cell>
                <Table.Cell>
                  <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} aria-label="To" />
                </Table.Cell>
                <Table.Cell>
                  <AccountLink val={item.to} />
                </Table.Cell>
                <Table.Cell>{fmtmAmount(item.amount, item.asset)}</Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

export const LedgerActionsTbl = ({ actions }: { actions?: LedgerActions[] }) => {
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root variant={'line'}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tx ID</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>To User</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!!actions &&
            actions.map((item, i) => {
              const [id] = item.id.split('-')
              return (
                <Table.Row key={i}>
                  <Table.Cell>
                    <TxLink val={id.split(':')[0]} />
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={item.timestamp} positioning={{ placement: 'top' }}>
                      {timeAgo(item.timestamp + 'Z')}
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>{item.type}</Table.Cell>
                  <Table.Cell>
                    <AccountLink val={item.to} />
                  </Table.Cell>
                  <Table.Cell>{fmtmAmount(item.amount, item.type === 'consensus_unstake' ? 'HIVE' : item.asset)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge
                      status={item.status}
                      action_id={item.action_id !== item.id ? item.action_id.split('-')[0] : ''}
                    />
                  </Table.Cell>
                </Table.Row>
              )
            })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

export const LedgerWithdrawals = ({ actions }: { actions?: LedgerActions[] }) => {
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root variant={'line'}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tx ID</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>To User</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!!actions &&
            actions.map((item, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <TxLink val={item.id.split(':')[0]} />
                </Table.Cell>
                <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                  <Tooltip content={item.timestamp} positioning={{ placement: 'top' }}>
                    {timeAgo(item.timestamp + 'Z')}
                  </Tooltip>
                </Table.Cell>
                <Table.Cell>
                  <AccountLink val={item.to} truncate={30} />
                </Table.Cell>
                <Table.Cell>{fmtmAmount(item.amount, item.asset)}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={item.status} action_id={item.action_id} />
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
