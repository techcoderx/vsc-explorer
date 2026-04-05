import { ReactNode, useEffect, useMemo, useRef } from 'react'
import {
  Text,
  Box,
  Table,
  Skeleton,
  Link,
  Button,
  Heading,
  Card,
  Badge,
  Flex,
  Tag,
  Accordion,
  Icon,
  Grid,
  GridItem,
  Spinner,
  HStack
} from '@chakra-ui/react'
import { Tooltip } from '../ui/tooltip'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { fetchL1TxOutput, fetchL1Rest, fetchL2TxnsDetailed, getDagByCIDBatch, fetchTssReqStatuses } from '../../requests'
import { abbreviateHash, beL1BlockUrl, fmtmAmount, parseOperation, thousandSeperator, timeAgo } from '../../helpers'
import { getConf, themeColorScheme } from '../../settings'
import { Block, Election } from '../../types/HafApiResult'
import { ProgressBarPct } from '../ProgressPercent'
import { L1TxHeader } from '../../types/L1ApiResult'
import { Contract, ContractOutputDag, TssKeyStatus, TssOp, TssReqStatus, Txn } from '../../types/L2ApiResult'
import { StatusBadge } from '../tables/Ledgers'
import { AccountLink, ContractLink } from '../TableLink'
import { FaCircleArrowRight } from 'react-icons/fa6'
import { LuCheck, LuX } from 'react-icons/lu'
import { PageTitle } from '../PageTitle'

const cardBorder = '1px solid rgb(255,255,255,0.16)'
const cardBorderLight = '1px solid #e2e8f0'
const MinTd = ({ children, ...props }: { children: ReactNode } & Table.CellProps) => (
  <Table.Cell
    py={'2'}
    _dark={{
      borderTop: cardBorder,
      borderBottom: cardBorder
    }}
    _light={{
      borderTop: cardBorderLight,
      borderBottom: cardBorderLight
    }}
    {...props}
  >
    {children}
  </Table.Cell>
)

const RC_COSTS = {
  deposit: 0,
  transfer: 100,
  withdraw: 200,
  stake_hbd: 200,
  unstake_hbd: 200,
  consensus_stake: 100,
  consensus_unstake: 100,
  call: 0 // FIXME: use real RC usage
}

const CallOutputs = ({
  success,
  outputs,
  outContents
}: {
  success: boolean
  outputs: { id: string; index: number[] }[]
  outContents: ContractOutputDag[]
}) => {
  const { t } = useTranslation('pages')
  return (
    <Table.ScrollArea>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t('l1Tx.opLogHeaders.outputId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('l1Tx.opLogHeaders.contractId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('l1Tx.opLogHeaders.index')}</Table.ColumnHeader>
            {!success && <Table.ColumnHeader>{t('l1Tx.opLogHeaders.errorSymbol')}</Table.ColumnHeader>}
            {!success && <Table.ColumnHeader>{t('l1Tx.opLogHeaders.errorMessage')}</Table.ColumnHeader>}
            {success && <Table.ColumnHeader>{t('l1Tx.opLogHeaders.output')}</Table.ColumnHeader>}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {outputs.map((out, i) =>
            out.index.map((o, j) => (
              <Table.Row key={`${i}-${j}`}>
                <MinTd>
                  {j === 0 && (
                    <Link asChild>
                      <ReactRouterLink to={`/tools/dag?cid=${out.id}`}>{abbreviateHash(out.id, 20, 0)}</ReactRouterLink>
                    </Link>
                  )}
                </MinTd>
                <MinTd>{j === 0 && <ContractLink val={outContents[i].contract_id} />}</MinTd>
                <MinTd>{o}</MinTd>
                {!success && <MinTd>{outContents[i].results[o].err}</MinTd>}
                {!success && <MinTd>{outContents[i].results[o].errMsg}</MinTd>}
                {success && (
                  <MinTd>
                    {!!outContents[i].results[o].ret ? (
                      outContents[i].results[o].ret
                    ) : (
                      <Text opacity={'0.7'}>
                        <i>{t('empty', { ns: 'common' })}</i>
                      </Text>
                    )}
                  </MinTd>
                )}
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

const CallLog = ({ contractId, idx, log }: { contractId: string; idx: number; log: string }) => (
  <Table.Row>
    <MinTd>{idx === 0 ? <ContractLink val={contractId} /> : ''}</MinTd>
    <MinTd>{log}</MinTd>
  </Table.Row>
)

const TssRequest = ({
  contractId,
  idx,
  req,
  status
}: {
  contractId: string
  idx: number
  req: TssOp
  status?: TssKeyStatus | TssReqStatus[]
}) => {
  const { t } = useTranslation('pages')
  const s = Array.isArray(status) ? status[0] : status
  const out = (s as TssKeyStatus | undefined)?.public_key || (s as TssReqStatus | undefined)?.sig
  return (
    <Table.Row>
      <MinTd>{idx === 0 ? <ContractLink val={contractId} /> : ''}</MinTd>
      <MinTd>{req.type}</MinTd>
      <MinTd>{req.key_id.replace(`${contractId}-`, '')}</MinTd>
      <MinTd>{req.args}</MinTd>
      <MinTd>
        {!!s ? (
          <Badge colorPalette={s.status === 'complete' || s.status === 'active' ? 'green' : themeColorScheme}>{s.status}</Badge>
        ) : (
          <Skeleton height="20px" />
        )}
      </MinTd>
      <MinTd>
        {out ?? (
          <Text opacity={'0.7'}>
            <i>{t('na', { ns: 'common' })}</i>
          </Text>
        )}
      </MinTd>
    </Table.Row>
  )
}

const shouldRefetch = (txn?: Txn | null) =>
  !!txn &&
  (txn.status === 'UNCONFIRMED' || txn.status === 'INCLUDED') &&
  (!txn.anchr_ts || Math.abs(new Date().getTime() - new Date(txn.anchr_ts + 'Z').getTime()) < 3600000)

const TxOverview = ({ txn, type }: { txn: Txn; type: 'hive' | 'vsc' }) => {
  const { t } = useTranslation('pages')
  // prettier-ignore
  const rcUsed = txn.status === 'CONFIRMED' && !txn.ops.find((o) => o.type === 'call') ? txn.ops.reduce((p, o) => p + RC_COSTS[o.type], 0) : 0
  return (
    <Card.Root>
      <Card.Header pb={'4'}>
        <Flex gap={'3'} direction={'row'} alignItems={'center'}>
          <Heading fontSize={'2xl'} display={'inline'}>
            {t('l1Tx.magiTransaction')}
          </Heading>
          <Tag.Root
            py={'2px'}
            colorPalette={txn.status === 'CONFIRMED' ? 'green' : txn.status === 'FAILED' ? 'red' : themeColorScheme}
          >
            {txn.status === 'CONFIRMED' ? <LuCheck /> : txn.status === 'FAILED' ? <LuX /> : <Spinner size={'sm'} mx={'1'} />}
            {txn.status.toUpperCase()}
          </Tag.Root>
        </Flex>
      </Card.Header>

      <Card.Body pt={'0'}>
        <Table.ScrollArea>
          <Table.Root>
            <Table.Body>
              <Table.Row>
                <MinTd py={'2.5'} fontWeight={'bold'}>
                  {t('l1Tx.requiredAuths')}
                </MinTd>
                <MinTd py={'2.5'}>
                  <Grid
                    templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
                    gap={3}
                  >
                    {txn.required_auths.map((a, i) => {
                      return (
                        <GridItem key={i}>
                          <Link asChild>
                            <ReactRouterLink to={'/address/' + a}>{a}</ReactRouterLink>
                          </Link>
                        </GridItem>
                      )
                    })}
                  </Grid>
                </MinTd>
              </Table.Row>
              <Table.Row>
                <MinTd py={'2.5'} fontWeight={'bold'}>
                  {t('l1Tx.rcUsed')}
                </MinTd>
                <MinTd>
                  {rcUsed > 0 ? rcUsed : '\uD83E\uDD14'} / {txn.rc_limit} (
                  {txn.rc_limit > 0 ? Math.round((100 * rcUsed) / txn.rc_limit) : '\uD83D\uDC40'}%)
                </MinTd>
              </Table.Row>
              {type === 'vsc' && (
                <Table.Row>
                  <MinTd py={'2.5'} fontWeight={'bold'}>
                    {t('l1Tx.nonce')}
                  </MinTd>
                  <MinTd>{txn.nonce}</MinTd>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
        {(txn.ledger.length > 0 || txn.ledger_actions.length > 0 || !!txn.output) && <TxOut txn={txn} />}
      </Card.Body>
    </Card.Root>
  )
}

const TxOut = ({ txn }: { txn: Txn }) => {
  const { t } = useTranslation('pages')
  const { data: outContents } = useQuery({
    queryKey: ['vsc-tx-outputs', txn.id],
    queryFn: () => getDagByCIDBatch<ContractOutputDag>(txn.output!.map((o) => o.id)),
    enabled: (txn.status === 'CONFIRMED' || txn.status === 'FAILED') && !!txn.output && txn.output.length > 0
  })
  const logCount =
    txn.status === 'CONFIRMED' && !!outContents && !!txn.output
      ? txn.output.reduce(
          (pv, val, idx) =>
            pv +
            val.index.reduce(
              (pv2, val2) => pv2 + (!!outContents[idx].results[val2].logs ? outContents[idx].results[val2].logs?.length : 0),
              0
            ),
          0
        )
      : 0
  const tssCount =
    txn.status === 'CONFIRMED' && !!outContents && !!txn.output
      ? txn.output.reduce(
          (pv, val, idx) =>
            pv +
            val.index.reduce(
              (pv2, val2) =>
                pv2 + (!!outContents[idx].results[val2].tss_ops ? outContents[idx].results[val2].tss_ops?.length : 0),
              0
            ),
          0
        )
      : 0
  const tssOps = useMemo(() => {
    const result: { [k: string]: TssOp } = {}
    if (tssCount > 0) {
      txn.output?.forEach((out, i) =>
        out.index.forEach((o, j) => outContents![i].results[o].tss_ops?.forEach((req, k) => (result[`${i}_${j}_${k}`] = req)))
      )
    }
    return result
  }, [outContents, txn, tssCount])
  const { data: tssReqStatus } = useQuery({
    queryKey: ['vsc-tx-tss-status', txn.id],
    queryFn: () => fetchTssReqStatuses(tssOps),
    enabled: tssCount > 0
  })
  return (
    <Accordion.Root collapsible>
      <Accordion.Item value="ledger-ops">
        <Accordion.ItemTrigger pl={'3'} fontSize={'sm'}>
          <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
            {t('l1Tx.ledgerOps', { count: txn.ledger.length })}
          </Box>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent px={'0'}>
          <Table.ScrollArea>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.type')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.from')}</Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.to')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.amount')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.memo')}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {txn.ledger.map((item, i) => {
                  return (
                    <Table.Row key={i}>
                      <MinTd>{item.type}</MinTd>
                      <MinTd>
                        <AccountLink val={item.from} />
                      </MinTd>
                      <MinTd>
                        <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} aria-label="To" />
                      </MinTd>
                      <MinTd>
                        <AccountLink val={item.to} />
                      </MinTd>
                      <MinTd>{fmtmAmount(item.amount, item.type === 'consensus_unstake' ? 'HIVE' : item.asset)}</MinTd>
                      <MinTd>{item.memo}</MinTd>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Accordion.ItemContent>
      </Accordion.Item>
      <Accordion.Item value="ledger-actions">
        <Accordion.ItemTrigger pl={'3'} fontSize={'sm'}>
          <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
            {t('l1Tx.ledgerActions', { count: txn.ledger_actions.length })}
          </Box>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent px={'0'}>
          <Table.ScrollArea>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.type')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.to')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.amount')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.status')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('l1Tx.opLogHeaders.memo')}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {txn.ledger_actions.map((item, i) => {
                  return (
                    <Table.Row key={i}>
                      <MinTd>{item.type}</MinTd>
                      <MinTd>
                        <AccountLink val={item.to} />
                      </MinTd>
                      <MinTd>{fmtmAmount(item.amount, item.type === 'consensus_unstake' ? 'HIVE' : item.asset)}</MinTd>
                      <MinTd>
                        <StatusBadge status={item.status} />
                      </MinTd>
                      <MinTd>{item.memo}</MinTd>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Accordion.ItemContent>
      </Accordion.Item>
      {!!txn.output && !!outContents && txn.status !== 'UNCONFIRMED' && txn.status !== 'INCLUDED' && (
        <Accordion.Item value="call-outputs">
          <Accordion.ItemTrigger pl={'3'} fontSize={'sm'}>
            <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
              {t('l1Tx.callOutputs')}
            </Box>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent px={'0'}>
            <CallOutputs success={txn.status === 'CONFIRMED'} outputs={txn.output} outContents={outContents} />
          </Accordion.ItemContent>
        </Accordion.Item>
      )}
      {!!txn.output && !!outContents && txn.status === 'CONFIRMED' && (
        <Accordion.Item value="logs">
          <Accordion.ItemTrigger pl={'3'} fontSize={'sm'}>
            <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
              {t('l1Tx.logs', { count: logCount })}
            </Box>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent px={'0'}>
            {logCount > 0 && (
              <Table.ScrollArea>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.contractId')}</Table.ColumnHeader>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.log')}</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {txn.output.map((out, i) =>
                      out.index.map((o, j) =>
                        outContents[i].results[o].logs?.map((log, k) => (
                          <CallLog key={`${i}-${j}-${k}`} contractId={outContents[i].contract_id} idx={j} log={log} />
                        ))
                      )
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            )}
          </Accordion.ItemContent>
        </Accordion.Item>
      )}
      {!!txn.output && !!outContents && txn.status === 'CONFIRMED' && tssCount > 0 && (
        <Accordion.Item value="tss-requests">
          <Accordion.ItemTrigger pl={'3'} fontSize={'sm'}>
            <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
              {t('l1Tx.tssRequests', { count: tssCount })}
            </Box>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent px={'0'}>
            {tssCount > 0 && (
              <Table.ScrollArea>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.contractId')}</Table.ColumnHeader>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.type')}</Table.ColumnHeader>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.keyId')}</Table.ColumnHeader>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.arguments')}</Table.ColumnHeader>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.status')}</Table.ColumnHeader>
                      <Table.ColumnHeader>{t('l1Tx.opLogHeaders.output')}</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {txn.output.map((out, i) =>
                      out.index.map((o, j) =>
                        outContents[i].results[o].tss_ops?.map((req, k) => (
                          <TssRequest
                            key={`${i}-${j}-${k}`}
                            contractId={outContents[i].contract_id}
                            idx={j}
                            req={req}
                            status={tssReqStatus ? tssReqStatus[`t${i}_${j}_${k}`] : undefined}
                          />
                        ))
                      )
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            )}
          </Accordion.ItemContent>
        </Accordion.Item>
      )}
    </Accordion.Root>
  )
}

const ContractResult = ({ out }: { out: Contract }) => {
  const { t } = useTranslation('pages')
  return (
    <>
      <Card.Header pb={'4'}>
        <Heading fontSize={'xl'}>{t('l1Tx.deployedContract')}</Heading>
      </Card.Header>
      <Card.Body pt={'0'}>
        <Table.Root>
          <TableRow minimalSpace isInCard allCardBorders label="Contract ID" value={out.id} link={`/contract/${out.id}`} />
        </Table.Root>
      </Card.Body>
    </>
  )
}

const ElectionResult = ({ out }: { out: Election }) => {
  const { t } = useTranslation('pages')
  return (
    <>
      <Card.Header pb={'4'}>
        <Heading fontSize={'xl'}>{t('l1Tx.proposedElection')}</Heading>
      </Card.Header>
      <Card.Body pt={'0'}>
        <Table.Root margin={'0'}>
          <Table.Body>
            <TableRow minimalSpace isInCard allCardBorders label="Epoch" value={out.epoch} link={'/epoch/' + out.epoch} />
            <TableRow minimalSpace isInCard allCardBorders label="Data CID" value={out.data} />
            {out.epoch > 0 ? (
              <TableRow minimalSpace isInCard allCardBorders label="Participation">
                {out.be_info ? (
                  <ProgressBarPct fontSize={'md'} val={(out.be_info.voted_weight / out.be_info.eligible_weight) * 100} />
                ) : (
                  <Text fontStyle={'italic'} opacity={'0.7'}>
                    {t('indexing', { ns: 'common' })}
                  </Text>
                )}
              </TableRow>
            ) : null}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </>
  )
}

const BlockResult = ({ out }: { out: Block }) => {
  const { t } = useTranslation('pages')
  return (
    <>
      <Card.Header pb={'4'}>
        <Heading fontSize={'xl'}>{t('l1Tx.proposedBlock')}</Heading>
      </Card.Header>
      <Card.Body pt={'0'}>
        <Table.Root margin={'0'}>
          <Table.Body>
            <TableRow minimalSpace isInCard allCardBorders label={t('l1Tx.blockNumber')}>
              {out.be_info ? (
                <Link asChild>
                  <ReactRouterLink to={'/block/' + out.be_info.block_id}>
                    {thousandSeperator(out.be_info.block_id)}
                  </ReactRouterLink>
                </Link>
              ) : (
                <Text fontStyle={'italic'} opacity={'0.7'}>
                  {t('indexing', { ns: 'common' })}
                </Text>
              )}
            </TableRow>
            <TableRow minimalSpace isInCard allCardBorders label="Block Hash" value={out.block} />
            <TableRow minimalSpace isInCard allCardBorders label="Participation">
              {out.be_info ? (
                <ProgressBarPct fontSize={'md'} val={(out.be_info.voted_weight / out.be_info.eligible_weight) * 100} />
              ) : (
                <Text fontStyle={'italic'} opacity={'0.7'}>
                  {t('indexing', { ns: 'common' })}
                </Text>
              )}
            </TableRow>
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </>
  )
}

export const Tx = () => {
  const { txid } = useParams()
  const isValidL1 = !!txid && /^[0-9a-fA-F]{40}$/i.test(txid)
  if (isValidL1) return <L1Tx />
  else return <L2Tx />
}

const L1Tx = () => {
  const { t } = useTranslation('pages')
  const { txid } = useParams()
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['vsc-l1-tx', txid],
    queryFn: async () => fetchL1Rest<L1TxHeader>(`/hafah-api/transactions/${txid!}?include-virtual=true`)
  })
  const { data: outData } = useQuery({
    queryKey: ['vsc-l1-tx-output', txid],
    queryFn: async () => fetchL1TxOutput(txid!)
  })
  const { data: txData, refetch } = useQuery({
    queryKey: ['vsc-tx', txid],
    queryFn: async () => fetchL2TxnsDetailed(txid!)
  })
  const vscTx = txData?.txns
  const timestamp = Array.isArray(vscTx) && vscTx.length > 0 ? vscTx[0].anchr_ts : (data?.timestamp ?? '')
  const operations = data && !data.code ? data.transaction_json.operations : []
  const parsedOps = operations.map((v) => parseOperation(v))
  const intervalRef = useRef<NodeJS.Timeout>(undefined)
  useEffect(() => {
    if (shouldRefetch(!!vscTx && vscTx.length > 0 ? vscTx[0] : null)) {
      intervalRef.current = setInterval(() => {
        refetch()
      }, 5000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [vscTx, refetch])
  return (
    <>
      <PageTitle title={`Tx: ${abbreviateHash(txid || '', 20, 0)}`} />
      <Box mb={'3'}>
        <Heading as="h1" size="5xl" fontWeight="normal">{t('l1Tx.hiveTransaction')}</Heading>
        <Text fontSize={'2xl'} opacity={'0.7'}>
          {txid}
        </Text>
        {isSuccess && data.code && data.message ? (
          <Text fontSize={'xl'} marginTop={'10px'}>
            {data.message}
          </Text>
        ) : isSuccess ? (
          operations.length > 0 ? (
            <Box marginTop={'10px'}>
              <Text fontSize={'xl'} display={'inline'}>
                {t('l1Tx.includedInL1')}{' '}
              </Text>
              <Link href={beL1BlockUrl(data.block_num)} target="_blank" rel="noopener noreferrer" fontSize={'xl'} aria-label={`Block #${thousandSeperator(data.block_num)} (opens in new tab)`}>
                {'#' + thousandSeperator(data.block_num)}
              </Link>{' '}
              <Tooltip positioning={{ placement: 'top' }} content={timestamp}>
                <Text fontSize={'xl'} display={'inline'}>
                  ({timeAgo(timestamp)})
                </Text>
              </Tooltip>
            </Box>
          ) : (
            <Text fontSize={'xl'} marginTop={'10px'}>
              {t('l1Tx.noOperations')}
            </Text>
          )
        ) : null}
        {isLoading ? <Skeleton height={'20px'} marginTop={'10px'} /> : null}
      </Box>
      <hr />
      <HStack gap={'2'}>
        {getConf().hiveBe.map((be, i) => (
          <Button key={i} asChild margin={'20px 0px'} colorPalette={themeColorScheme} variant={'outline'}>
            <ReactRouterLink to={be.url + '/tx/' + txid} target="_blank" rel="noopener noreferrer" aria-label={`View in ${be.name} (opens in new tab)`}>
              {t('l1Tx.viewIn', { name: be.name })}
            </ReactRouterLink>
          </Button>
        ))}
      </HStack>
      <Flex gap="6" direction="column">
        {Array.isArray(vscTx) && vscTx.length > 0 && <TxOverview txn={vscTx[0]} type="hive" />}
        {isLoading ? (
          <Card.Root w="100%">
            <Card.Body>{t('l1Tx.loadingMagiOps')}</Card.Body>
          </Card.Root>
        ) : isSuccess && !data.code ? (
          parsedOps.map((trx, i) => (
            <Card.Root key={i}>
              <Card.Header pb={'4'}>
                <Flex gap={'3'} direction={'row'} alignItems={'center'}>
                  <Heading fontSize={'2xl'}>{t('l1Tx.operation', { num: i })}</Heading>
                  {trx.valid && (
                    <Tag.Root variant={'outline'} colorPalette={themeColorScheme} size={'lg'}>
                      {trx.type}
                    </Tag.Root>
                  )}
                </Flex>
              </Card.Header>
              {trx.valid ? (
                <>
                  <Card.Body pt={'0'}>
                    <JsonToTableRecursive isInCard minimalSpace json={trx.payload} />
                  </Card.Body>
                  {outData && outData[i] ? (
                    trx.type === 'create_contract' ? (
                      <ContractResult out={outData[i] as Contract} />
                    ) : trx.type === 'election_result' ? (
                      <ElectionResult out={outData[i] as Election} />
                    ) : trx.type === 'produce_block' ? (
                      <BlockResult out={outData[i] as Block} />
                    ) : null
                  ) : null}
                </>
              ) : (
                <Card.Body pt={'0'}>
                  <Text fontStyle={'italic'}>{t('l1Tx.notMagi')}</Text>
                </Card.Body>
              )}
            </Card.Root>
          ))
        ) : null}
      </Flex>
    </>
  )
}

const L2Tx = () => {
  const { t } = useTranslation('pages')
  const { txid } = useParams()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vsc-tx', txid],
    queryFn: async () => fetchL2TxnsDetailed(txid!)
  })
  const exists = !!data && Array.isArray(data.txns) && data.txns.length > 0
  const tx = exists ? data.txns[0] : null
  const intervalRef = useRef<NodeJS.Timeout>(undefined)
  useEffect(() => {
    if (shouldRefetch(tx)) {
      intervalRef.current = setInterval(() => {
        refetch()
      }, 5000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [tx, refetch])
  return (
    <>
      <PageTitle title={`Tx: ${abbreviateHash(txid || '', 20, 0)}`} />
      <Box mb={'3'}>
        <Heading as="h1" size="5xl" fontWeight="normal">{t('l1Tx.transaction')}</Heading>
        <Text fontSize={'2xl'} opacity={'0.7'}>
          {txid}
        </Text>
        {isLoading ? (
          <Skeleton h={'6'} />
        ) : isError ? (
          <Text fontSize={'xl'}>{t('l1Tx.failedToLoad')}</Text>
        ) : !tx ? (
          <Text fontSize={'xl'}>{t('l1Tx.notExist')}</Text>
        ) : !!tx.anchr_ts ? (
          <Box marginTop={'10px'}>
            <Text fontSize={'xl'} display={'inline'}>
              {t('l1Tx.includedInL2')}{' '}
            </Text>
            <Link asChild fontSize={'xl'}>
              <ReactRouterLink to={`/block/${tx.anchr_id}`}>{thousandSeperator(tx.anchr_height)}</ReactRouterLink>
            </Link>{' '}
            <Tooltip positioning={{ placement: 'top' }} content={tx.anchr_ts}>
              <Text fontSize={'xl'} display={'inline'}>
                ({timeAgo(tx.anchr_ts)})
              </Text>
            </Tooltip>
          </Box>
        ) : null}
      </Box>
      <hr />
      <Button asChild my={'5'} colorPalette={themeColorScheme} variant={'outline'}>
        <ReactRouterLink to={`/tools/dag?cid=${txid}`}>{t('viewInDagInspector', { ns: 'common' })}</ReactRouterLink>
      </Button>
      {!!tx && (
        <Flex gap="6" direction="column">
          <TxOverview txn={tx} type="vsc" />
          {tx.ops.map((op, i) => (
            <Card.Root key={i}>
              <Card.Header pb={'4'}>
                <Flex gap={'3'} direction={'row'} alignItems={'center'}>
                  <Heading fontSize={'2xl'}>{t('l1Tx.operation', { num: i })}</Heading>
                  <Tag.Root variant={'outline'} colorPalette={themeColorScheme} size={'lg'}>
                    {op.type}
                  </Tag.Root>
                </Flex>
              </Card.Header>
              <Card.Body pt={'0'}>
                <JsonToTableRecursive isInCard minimalSpace json={op.data} />
              </Card.Body>
            </Card.Root>
          ))}
        </Flex>
      )}
    </>
  )
}
