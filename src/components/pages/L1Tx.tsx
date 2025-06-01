import {
  Text,
  Box,
  Table,
  Tbody,
  Skeleton,
  Link,
  Button,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Flex
} from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { fetchL1TxOutput, fetchL1Rest, useDagByCID } from '../../requests'
import { makeL1TxIdWifIdx, parseOperation, roundFloat, thousandSeperator, timeAgo } from '../../helpers'
import { l1Explorer, l1ExplorerName, themeColor, themeColorScheme } from '../../settings'
import { Block, Election } from '../../types/HafApiResult'
import { ProgressBarPct } from '../ProgressPercent'
import { L1TxHeader } from '../../types/L1ApiResult'
import { Contract, ContractOutput, Txn } from '../../types/L2ApiResult'

const VscLedgerTxNames = ['call', 'transfer', 'withdraw', 'consensus_stake', 'consensus_unstake', 'stake_hbd', 'unstake_hbd']

const ContractResult = ({ out }: { out: Contract }) => {
  return (
    <>
      <CardHeader>
        <Heading fontSize={'xl'}>Deployed Contract</Heading>
      </CardHeader>
      <CardBody mt={'-25px'}>
        <Table variant={'unstyled'}>
          <TableRow minimalSpace isInCard allCardBorders label="Contract ID" value={out.id} link={`/contract/${out.id}`} />
        </Table>
      </CardBody>
    </>
  )
}

const CallResult = ({ out, trx_id, opidx }: { out: Txn; trx_id: string; opidx: number }) => {
  return (
    <>
      {!!out.ledger && Array.isArray(out.ledger) && out.ledger.length > 0 && (
        <LedgerOpLogs out={out} trx_id={trx_id} opidx={opidx} />
      )}
      {!!out.output && <ContractOut id={out.output.id} index={out.output.index} />}
    </>
  )
}

const LedgerOpLogs = ({ out, trx_id, opidx }: { out: Txn; trx_id: string; opidx: number }) => {
  const idWifIdx = makeL1TxIdWifIdx(trx_id, opidx)
  return (
    <>
      <CardHeader>
        <Heading fontSize={'xl'}>Ledger Operations</Heading>
      </CardHeader>
      <CardBody mt={'-25px'}>
        <JsonToTableRecursive
          isInCard
          minimalSpace
          json={out.ledger
            .filter((l) => (opidx > 0 ? l.id.startsWith(idWifIdx) : l.id === idWifIdx))
            .map((l) => {
              return {
                from: l.from,
                to: l.to,
                amount: `${roundFloat(l.amount / 1000, 3)} ${l.asset.toUpperCase()}`,
                type: l.type,
                params: l.params
              }
            })}
        />
      </CardBody>
    </>
  )
}

const ContractOut = ({ id, index }: { id: string; index: number }) => {
  const { data: dag } = useDagByCID<ContractOutput>(id)
  return (
    <>
      <CardHeader>
        <Heading fontSize={'xl'}>Contract Output</Heading>
      </CardHeader>
      <CardBody mt={'-6'}>
        <Table margin={'0'} variant={'unstyled'}>
          <Tbody>
            <TableRow minimalSpace isInCard allCardBorders label="Output CID" value={id} link={`/tools/dag?cid=${id}`} />
            <TableRow minimalSpace isInCard allCardBorders label="Success" value={dag?.results[index].ok ? 'true' : 'false'} />
            <TableRow minimalSpace isInCard allCardBorders label="Result" value={dag?.results[index].ret} />
          </Tbody>
        </Table>
      </CardBody>
    </>
  )
}

const ElectionResult = ({ out }: { out: Election }) => {
  return (
    <>
      <CardHeader>
        <Heading fontSize={'xl'}>Proposed Election Result</Heading>
      </CardHeader>
      <CardBody mt={'-25px'}>
        <Table margin={'0'} variant={'unstyled'}>
          <Tbody>
            <TableRow minimalSpace isInCard allCardBorders label="Epoch" value={out.epoch} link={'/epoch/' + out.epoch} />
            <TableRow minimalSpace isInCard allCardBorders label="Data CID" value={out.data} />
            {out.epoch > 0 ? (
              <TableRow minimalSpace isInCard allCardBorders label="Participation">
                {out.be_info ? (
                  <ProgressBarPct fontSize={'md'} val={(out.be_info.voted_weight / out.be_info.eligible_weight) * 100} />
                ) : (
                  <Text fontStyle={'italic'} opacity={'0.7'}>
                    Indexing...
                  </Text>
                )}
              </TableRow>
            ) : null}
          </Tbody>
        </Table>
      </CardBody>
    </>
  )
}

const BlockResult = ({ out }: { out: Block }) => {
  return (
    <>
      <CardHeader>
        <Heading fontSize={'xl'}>Proposed Block</Heading>
      </CardHeader>
      <CardBody mt={'-25px'}>
        <Table margin={'0'} variant={'unstyled'}>
          <Tbody>
            <TableRow minimalSpace isInCard allCardBorders label="Block Number">
              {out.be_info ? (
                <Link as={ReactRouterLink} to={'/block/' + out.be_info.block_id}>
                  {thousandSeperator(out.be_info.block_id)}
                </Link>
              ) : (
                <Text fontStyle={'italic'} opacity={'0.7'}>
                  Indexing...
                </Text>
              )}
            </TableRow>
            <TableRow minimalSpace isInCard allCardBorders label="Block Hash" value={out.block} />
            <TableRow minimalSpace isInCard allCardBorders label="Participation">
              {out.be_info ? (
                <ProgressBarPct fontSize={'md'} val={(out.be_info.voted_weight / out.be_info.eligible_weight) * 100} />
              ) : (
                <Text fontStyle={'italic'} opacity={'0.7'}>
                  Indexing...
                </Text>
              )}
            </TableRow>
          </Tbody>
        </Table>
      </CardBody>
    </>
  )
}

const L1Tx = () => {
  const { txid } = useParams()
  const isValid = !!txid && /^[0-9a-fA-F]{40}$/i.test(txid)
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['vsc-l1-tx', txid],
    queryFn: async () => fetchL1Rest<L1TxHeader>(`/hafah-api/transactions/${txid!}?include-virtual=true`),
    enabled: isValid
  })
  const { data: outData } = useQuery({
    queryKey: ['vsc-l1-tx-output', txid],
    queryFn: async () => fetchL1TxOutput(txid!),
    enabled: isValid
  })
  const operations = data && !data.code ? data.transaction_json.operations : []
  const parsedOps = operations.map((v) => parseOperation(v))
  return (
    <>
      <Box marginBottom={'15px'}>
        <Text fontSize={'5xl'}>Hive L1 Transaction</Text>
        <Text fontSize={'2xl'} opacity={'0.7'}>
          {txid}
        </Text>
        {!isValid ? (
          <Text>Invalid transaction ID</Text>
        ) : isSuccess && data.code && data.message ? (
          <Text fontSize={'xl'} marginTop={'10px'}>
            {data.message}
          </Text>
        ) : isSuccess ? (
          operations.length > 0 ? (
            <Box marginTop={'10px'}>
              <Text fontSize={'xl'} display={'inline'}>
                Included in L1 block{' '}
              </Text>
              <Link href={l1Explorer + '/b/' + data.block_num} target="_blank" fontSize={'xl'}>
                {'#' + thousandSeperator(data.block_num)}
              </Link>
            </Box>
          ) : (
            <Text fontSize={'xl'} marginTop={'10px'}>
              No operations found
            </Text>
          )
        ) : null}
        {isLoading ? <Skeleton height={'20px'} marginTop={'10px'} /> : null}
      </Box>
      <hr />
      <Button
        as={ReactRouterLink}
        margin={'20px 0px'}
        colorScheme={themeColorScheme}
        variant={'outline'}
        to={l1Explorer + '/tx/' + txid}
        target="_blank"
      >
        View in {l1ExplorerName}
      </Button>
      {isLoading ? (
        <Card w="100%">
          <CardBody>Loading VSC Operations...</CardBody>
        </Card>
      ) : isSuccess && !data.code ? (
        <Flex gap="6" direction="column">
          {parsedOps.map((trx, i) => (
            <Card key={i}>
              <CardHeader>
                <Heading fontSize={'2xl'}>Operation #{i}</Heading>
              </CardHeader>
              {trx.valid ? (
                <>
                  <CardBody>
                    <Table margin={'-20px 0 0'} variant={'unstyled'}>
                      <Tbody>
                        <TableRow isInCard label="Timestamp" value={data.timestamp + ' (' + timeAgo(data.timestamp) + ')'} />
                        <TableRow isInCard label="Username" value={trx.user} link={'/address/hive:' + trx.user} />
                        <TableRow isInCard label="Operation Type">
                          <Badge color={themeColor}>{trx.type}</Badge>
                        </TableRow>
                        {outData && outData[i] && VscLedgerTxNames.includes(trx.type) ? (
                          <TableRow isInCard label="Status">
                            <Badge color={themeColor}>{(outData[i] as Txn).status}</Badge>
                          </TableRow>
                        ) : null}
                      </Tbody>
                    </Table>
                  </CardBody>
                  <CardHeader>
                    <Heading fontSize={'xl'}>Payload</Heading>
                  </CardHeader>
                  <CardBody marginTop={'-25px'}>
                    <JsonToTableRecursive isInCard minimalSpace json={trx.payload} />
                  </CardBody>
                  {outData && outData[i] ? (
                    VscLedgerTxNames.includes(trx.type) ? (
                      <CallResult out={outData[i] as Txn} trx_id={txid!} opidx={i} />
                    ) : trx.type === 'create_contract' ? (
                      <ContractResult out={outData[i] as Contract} />
                    ) : trx.type === 'election_result' ? (
                      <ElectionResult out={outData[i] as Election} />
                    ) : trx.type === 'produce_block' ? (
                      <BlockResult out={outData[i] as Block} />
                    ) : null
                  ) : null}
                </>
              ) : (
                <CardBody mt={'-25px'}>
                  <Text fontStyle={'italic'}>This operation is not related to VSC.</Text>
                </CardBody>
              )}
            </Card>
          ))}
        </Flex>
      ) : null}
    </>
  )
}

export default L1Tx
