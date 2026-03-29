import { Table, Text } from '@chakra-ui/react'
import { Txn, Status } from '../../types/L2ApiResult'
import { CheckXIcon, PendingIcon, ToIcon } from '../CheckXIcon'
import { AccountLink, ContractLink, TxLink } from '../TableLink'
import { abbreviateHash, fmtAmount, timeAgo } from '../../helpers'
import { Coin, CoinLower } from '../../types/Payloads'
import { TxIntentAllowance } from '../../types/L2ApiResult'
import { Tooltip } from '../ui/tooltip'

export const StatusIcon = ({ status }: { status: Status }) => {
  switch (status) {
    case 'CONFIRMED':
      return <CheckXIcon ok />
    case 'FAILED':
      return <CheckXIcon ok={false} />
    default:
      return <PendingIcon />
  }
}

export const AmountIntentAllowance = ({ intents }: { intents: TxIntentAllowance[] }) => {
  const totalHive = intents.reduce((pv, v) => (v.args.token === 'hive' ? pv + parseFloat(v.args.limit) : pv), 0)
  const totalHbd = intents.reduce((pv, v) => (v.args.token === 'hbd' ? pv + parseFloat(v.args.limit) : pv), 0)
  const totalStakedHbd = intents.reduce((pv, v) => (v.args.token === 'hbd_savings' ? pv + parseFloat(v.args.limit) : pv), 0)
  const first: [CoinLower, number] | null =
    totalHive > 0
      ? ['hive', totalHive]
      : totalHbd > 0
        ? ['hbd', totalHbd]
        : totalStakedHbd > 0
          ? ['hbd_savings', totalStakedHbd]
          : null
  let tokenCount = 0
  totalHive > 0 && (tokenCount += 1)
  totalHbd > 0 && (tokenCount += 1)
  totalStakedHbd > 0 && (tokenCount += 1)
  return first !== null ? (
    <Text>
      {fmtAmount(first[1], first[0])}
      {tokenCount > 1 ? <i> (+{tokenCount - 1})</i> : ''}
    </Text>
  ) : (
    <Text>0 HIVE</Text>
  )
}

const resolveFrom = (t: Txn, o: Txn['ops'][number]): string =>
  o.type === 'deposit'
    ? o.data.from
    : (t.required_auths[0] ?? (o.type !== 'call' ? o.data.from : (o.data.caller ?? t.required_posting_auths[0] ?? '')))

const resolveTo = (o: Txn['ops'][number]): string => (o.type === 'call' ? o.data.contract_id : o.data.to)

export const Txns = ({ txs, pov }: { txs: Txn[]; pov?: string }) => {
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>Transaction ID</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Method</Table.ColumnHeader>
            <Table.ColumnHeader>From</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>To</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {txs.map((t) =>
            t.ops
              .filter((o) => !pov || pov === resolveFrom(t, o) || pov === resolveTo(o))
              .map((o, j) => (
                <Table.Row key={`${t.id}-${j}`}>
                  <Table.Cell>
                    <StatusIcon status={t.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <TxLink val={t.id} />
                  </Table.Cell>
                  <Table.Cell>
                    {!!t.anchr_ts ? (
                      <Tooltip positioning={{ placement: 'top' }} content={t.anchr_ts}>
                        {timeAgo(t.anchr_ts)}
                      </Tooltip>
                    ) : (
                      <Text opacity={'0.7'}>
                        <i>Pending...</i>
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>{o.type === 'call' ? abbreviateHash(o.data.action, 20, 0) : o.type}</Table.Cell>
                  <Table.Cell>
                    <AccountLink val={resolveFrom(t, o)} />
                  </Table.Cell>
                  <Table.Cell>
                    <ToIcon />
                  </Table.Cell>
                  <Table.Cell>{o.type === 'call' ? <ContractLink val={o.data.contract_id} /> : <AccountLink val={o.data.to} />}</Table.Cell>
                  <Table.Cell>
                    {o.type === 'call' ? (
                      <AmountIntentAllowance
                        intents={Array.isArray(o.data.intents) ? o.data.intents.filter((i) => i.type === 'transfer.allow') : []}
                      />
                    ) : o.type === 'deposit' ? (
                      fmtAmount(o.data.amount / 1000, o.data.asset.toUpperCase() as Coin)
                    ) : (
                      fmtAmount(parseFloat(o.data.amount || '0'), o.data.asset.toUpperCase() as Coin)
                    )}
                  </Table.Cell>
                </Table.Row>
              ))
          )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
