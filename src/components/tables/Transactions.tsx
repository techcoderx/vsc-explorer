import { Table, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr } from '@chakra-ui/react'
import { Txn, Status } from '../../types/L2ApiResult'
import { CheckXIcon, PendingIcon, ToIcon } from '../CheckXIcon'
import { AccountLink, ContractLink, TxLink } from '../TableLink'
import { abbreviateHash, fmtAmount, timeAgo } from '../../helpers'
import { Coin } from '../../types/Payloads'

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

export const Txns = ({ txs }: { txs: Txn[] }) => {
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
                  <Tooltip placement="top" label={t.anchr_ts}>
                    {timeAgo(t.anchr_ts)}
                  </Tooltip>
                </Td>
                <Td>{o.type === 'call_contract' ? abbreviateHash(o.data.action, 20, 0) : o.type}</Td>
                <Td>
                  <AccountLink
                    val={
                      o.type === 'deposit' ? o.data.from : t.required_auths[0] ?? (o.type !== 'call_contract' ? o.data.from : '')
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
                  {o.type === 'call_contract'
                    ? '0 HIVE'
                    : o.type === 'deposit'
                    ? fmtAmount(o.data.amount / 1000, o.data.asset.toUpperCase() as Coin)
                    : fmtAmount(parseFloat(o.data.amount || '0'), o.data.asset.toUpperCase() as Coin)}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
