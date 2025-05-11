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
          {txs.map((t, i) => (
            <Tr key={i}>
              <Td>
                <StatusIcon status={t.status} />
              </Td>
              <Td>
                <TxLink val={t.tx_id} />
              </Td>
              <Td>
                <Tooltip placement="top" label={t.anchr_ts}>
                  {timeAgo(t.anchr_ts)}
                </Tooltip>
              </Td>
              <Td>{t.data.type === 'call' ? abbreviateHash(t.data.op, 20, 0) : t.data.type}</Td>
              <Td>
                <AccountLink val={t.required_auths[0] ?? ''} />
              </Td>
              <Td>
                <ToIcon />
              </Td>
              <Td>{t.data.type === 'call' ? <ContractLink val={t.data.contract_id} /> : <AccountLink val={t.data.to} />}</Td>
              <Td>
                {t.data.type === 'call'
                  ? '0 HIVE'
                  : fmtAmount(t.data.amount / (t.data.type === 'deposit' ? 1000 : 1), t.data.asset.toUpperCase() as Coin)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
