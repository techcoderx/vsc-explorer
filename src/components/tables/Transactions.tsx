import { Table, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Txn, Status } from '../../types/L2ApiResult'
import { CheckXIcon, PendingIcon, ToIcon } from '../CheckXIcon'
import { AccountLink, ContractLink, TxLink } from '../TableLink'
import { abbreviateHash, fmtAmount, formatBaseUnits, timeAgo } from '../../helpers'
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
  const totalHive = intents.reduce((pv, v) => (v.args.token === 'hive' ? pv + formatBaseUnits(v.args.limit) : pv), 0)
  const totalHbd = intents.reduce((pv, v) => (v.args.token === 'hbd' ? pv + formatBaseUnits(v.args.limit) : pv), 0)
  const totalStakedHbd = intents.reduce((pv, v) => (v.args.token === 'hbd_savings' ? pv + formatBaseUnits(v.args.limit) : pv), 0)
  const first: [CoinLower, number] | null =
    totalHive > 0
      ? ['hive', totalHive]
      : totalHbd > 0
        ? ['hbd', totalHbd]
        : totalStakedHbd > 0
          ? ['hbd_savings', totalStakedHbd]
          : null
  let tokenCount = 0
  if (totalHive > 0) tokenCount += 1
  if (totalHbd > 0) tokenCount += 1
  if (totalStakedHbd > 0) tokenCount += 1
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
  const { t } = useTranslation('tables')
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>{t('transactions.txId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('transactions.age')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('transactions.method')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('transactions.from')}</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>{t('transactions.to')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('transactions.amount')}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {txs.map((tx) =>
            tx.ops
              .filter((o) => !pov || pov === resolveFrom(tx, o) || pov === resolveTo(o))
              .map((o, j) => (
                <Table.Row key={`${tx.id}-${j}`}>
                  <Table.Cell>
                    <StatusIcon status={tx.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <TxLink val={tx.id} />
                  </Table.Cell>
                  <Table.Cell>
                    {!!tx.anchr_ts ? (
                      <Tooltip positioning={{ placement: 'top' }} content={tx.anchr_ts}>
                        {timeAgo(tx.anchr_ts)}
                      </Tooltip>
                    ) : (
                      <Text opacity={'0.7'}>
                        <i>{t('pending', { ns: 'common' })}</i>
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>{o.type === 'call' ? abbreviateHash(o.data.action, 20, 0) : o.type}</Table.Cell>
                  <Table.Cell>
                    <AccountLink val={resolveFrom(tx, o)} />
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
                    ) : (
                      fmtAmount(formatBaseUnits(o.data.amount), o.data.asset.toUpperCase() as Coin)
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
