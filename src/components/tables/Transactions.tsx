import { Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from '@chakra-ui/react'
import { Txn, Status } from '../../types/L2ApiResult'
import { CheckXIcon, PendingIcon, ToIcon } from '../CheckXIcon'
import { AccountLink, ContractLink, TxLink } from '../TableLink'
import { abbreviateHash, fmtAmount, timeAgo } from '../../helpers'
import { Coin, CoinLower } from '../../types/Payloads'
import { TxIntentAllowance } from '../../types/L2ApiResult'

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

export const Txns = ({ txs }: { txs: Txn[] }) => {
  //@ts-ignore
  txs.forEach((t) => t.ops.forEach((o) => (o.type === 'call' ? (o.type = 'call_contract') : undefined)))
  return (
    <TableContainer my={'3'}>
      <Table>
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Transaction ID</Th>
            <Th>Age</Th>
            <Th>Method</Th>
            <Th>From</Th>
            <Th></Th>
            <Th>To</Th>
            <Th>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {txs.map((t) =>
            t.ops.map((o, j) => (
              <Tr key={`${t.id}-${j}`}>
                <Td>
                  <StatusIcon status={t.status} />
                </Td>
                <Td>
                  <TxLink val={t.id} />
                </Td>
                <Td>
                  {!!t.anchr_ts ? (
                    <Tooltip placement="top" label={t.anchr_ts}>
                      {timeAgo(t.anchr_ts)}
                    </Tooltip>
                  ) : (
                    <Text opacity={'0.7'}>
                      <i>Pending...</i>
                    </Text>
                  )}
                </Td>
                <Td>{o.type === 'call_contract' ? abbreviateHash(o.data.action, 20, 0) : o.type}</Td>
                <Td>
                  <AccountLink
                    val={
                      o.type === 'deposit'
                        ? o.data.from
                        : (t.required_auths[0] ??
                          (o.type !== 'call_contract' ? o.data.from : (o.data.caller ?? t.required_posting_auths[0] ?? '')))
                    }
                  />
                </Td>
                <Td>
                  <ToIcon />
                </Td>
                <Td>
                  {o.type === 'call_contract' ? <ContractLink val={o.data.contract_id} /> : <AccountLink val={o.data.to} />}
                </Td>
                <Td>
                  {o.type === 'call_contract' ? (
                    <AmountIntentAllowance
                      intents={Array.isArray(o.data.intents) ? o.data.intents.filter((i) => i.type === 'transfer.allow') : []}
                    />
                  ) : o.type === 'deposit' ? (
                    fmtAmount(o.data.amount / 1000, o.data.asset.toUpperCase() as Coin)
                  ) : (
                    fmtAmount(parseFloat(o.data.amount || '0'), o.data.asset.toUpperCase() as Coin)
                  )}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
