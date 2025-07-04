import { ReactNode } from 'react'
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
  Flex,
  Tooltip,
  Tag,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Icon,
  TableCellProps,
  Grid,
  GridItem
} from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { fetchL1TxOutput, fetchL1Rest, fetchL2TxnsDetailed } from '../../requests'
import { fmtmAmount, parseOperation, thousandSeperator, timeAgo } from '../../helpers'
import { l1Explorer, l1ExplorerName, themeColorScheme } from '../../settings'
import { Block, Election } from '../../types/HafApiResult'
import { ProgressBarPct } from '../ProgressPercent'
import { L1TxHeader } from '../../types/L1ApiResult'
import { Contract, Txn } from '../../types/L2ApiResult'
import { StatusBadge } from '../tables/Ledgers'
import { AccountLink } from '../TableLink'
import { FaCircleArrowRight } from 'react-icons/fa6'

const cardBorder = '1px solid rgb(255,255,255,0.16)'
const cardBorderLight = '1px solid #e2e8f0'
const MinTd = ({ children, ...props }: { children: ReactNode } & TableCellProps) => (
  <Td
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
  </Td>
)

const RC_COSTS = {
  deposit: 0,
  transfer: 100,
  withdraw: 200,
  stake_hbd: 200,
  unstake_hbd: 200,
  consensus_stake: 100,
  consensus_unstake: 100,
  call_contract: 0 // FIXME: use real RC usage
}

const TxOverview = ({ txn }: { txn: Txn }) => {
  const rcUsed =
    txn.status === 'CONFIRMED' && !txn.ops.find((o) => o.type === 'call_contract')
      ? txn.ops.reduce((p, o) => p + RC_COSTS[o.type], 0)
      : 0
  return (
    <Card>
      <CardHeader>
        <Flex gap={'3'} direction={'row'}>
          <Heading fontSize={'2xl'} display={'inline'}>
            VSC Transaction
          </Heading>
          <Tag colorScheme={txn.status === 'CONFIRMED' ? 'green' : txn.status === 'FAILED' ? 'red' : themeColorScheme}>
            {txn.status.toUpperCase()}
          </Tag>
        </Flex>
      </CardHeader>

      <CardBody mt={'-6'}>
        <Table mb={'-1px'}>
          <Tbody>
            <Tr>
              <MinTd py={'2.5'} pl={'4'} fontWeight={'bold'}>
                Required Auths
              </MinTd>
              <MinTd py={'2.5'}>
                <Grid
                  templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
                  gap={3}
                >
                  {txn.required_auths.map((a, i) => {
                    return (
                      <GridItem key={i}>
                        <Link as={ReactRouterLink} to={'/address/' + a}>
                          {a}
                        </Link>
                      </GridItem>
                    )
                  })}
                </Grid>
              </MinTd>
            </Tr>
            <Tr>
              <MinTd py={'2.5'} pl={'4'} fontWeight={'bold'}>
                RC Used
              </MinTd>
              <MinTd>
                {rcUsed > 0 ? rcUsed : '🤔'} / {txn.rc_limit} (
                {txn.rc_limit > 0 ? Math.round((100 * rcUsed) / txn.rc_limit) : '👀'}%)
              </MinTd>
            </Tr>
          </Tbody>
        </Table>
        {(txn.ledger.length > 0 || txn.ledger_actions.length > 0 || !!txn.output) && <TxOut txn={txn} />}
      </CardBody>
    </Card>
  )
}

const TxOut = ({ txn }: { txn: Txn }) => (
  <Accordion allowToggle>
    <AccordionItem>
      <AccordionButton>
        <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
          Ledger Operations ({txn.ledger.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel px={'0'}>
        <TableContainer>
          <Table variant={'unstyled'}>
            <Thead>
              <Tr>
                <Th>Type</Th>
                <Th>From</Th>
                <Th></Th>
                <Th>To</Th>
                <Th>Amount</Th>
                <Th>Memo</Th>
              </Tr>
            </Thead>
            <Tbody>
              {txn.ledger.map((item, i) => {
                return (
                  <Tr key={i}>
                    <MinTd>{item.type}</MinTd>
                    <MinTd>
                      <AccountLink val={item.from} />
                    </MinTd>
                    <MinTd>
                      <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} />
                    </MinTd>
                    <MinTd>
                      <AccountLink val={item.to} />
                    </MinTd>
                    <MinTd>{fmtmAmount(item.amount, item.type === 'consensus_unstake' ? 'HIVE' : item.asset)}</MinTd>
                    <MinTd>{item.memo}</MinTd>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem>
      <AccordionButton>
        <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
          Ledger Actions ({txn.ledger_actions.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel px={'0'}>
        <TableContainer>
          <Table variant={'unstyled'}>
            <Thead>
              <Tr>
                <Th>Type</Th>
                <Th>To</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Memo</Th>
              </Tr>
            </Thead>
            <Tbody>
              {txn.ledger_actions.map((item, i) => {
                return (
                  <Tr key={i}>
                    <MinTd>{item.type}</MinTd>
                    <MinTd>
                      <AccountLink val={item.to} />
                    </MinTd>
                    <MinTd>{fmtmAmount(item.amount, item.type === 'consensus_unstake' ? 'HIVE' : item.asset)}</MinTd>
                    <MinTd>
                      <StatusBadge status={item.status} />
                    </MinTd>
                    <MinTd>{item.memo}</MinTd>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </AccordionPanel>
    </AccordionItem>
    {!!txn.output && (
      <AccordionItem>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
            Call Output
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel px={'0'}>
          <Table variant={'unstyled'}>
            <Tbody>
              <TableRow
                minimalSpace
                isInCard
                allCardBorders
                label="Output CID"
                value={txn.output.id}
                link={`/tools/dag?cid=${txn.output.id}`}
              />
              <TableRow minimalSpace isInCard allCardBorders label="Index" value={txn.output.index} />
            </Tbody>
          </Table>
        </AccordionPanel>
      </AccordionItem>
    )}
  </Accordion>
)

const ContractResult = ({ out }: { out: Contract }) => {
  return (
    <>
      <CardHeader>
        <Heading fontSize={'xl'}>Deployed Contract</Heading>
      </CardHeader>
      <CardBody mt={'-6'}>
        <Table variant={'unstyled'}>
          <TableRow minimalSpace isInCard allCardBorders label="Contract ID" value={out.id} link={`/contract/${out.id}`} />
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
      <CardBody mt={'-6'}>
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
      <CardBody mt={'-6'}>
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

export const Tx = () => {
  const { txid } = useParams()
  const isValidL1 = !!txid && /^[0-9a-fA-F]{40}$/i.test(txid)
  if (isValidL1) return <L1Tx />
  else return <L2Tx />
}

const L1Tx = () => {
  const { txid } = useParams()
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['vsc-l1-tx', txid],
    queryFn: async () => fetchL1Rest<L1TxHeader>(`/hafah-api/transactions/${txid!}?include-virtual=true`)
  })
  const { data: outData } = useQuery({
    queryKey: ['vsc-l1-tx-output', txid],
    queryFn: async () => fetchL1TxOutput(txid!)
  })
  const vscTx = useQuery({
    queryKey: ['vsc-tx', txid],
    queryFn: async () => fetchL2TxnsDetailed(txid!)
  }).data?.txns
  const timestamp = Array.isArray(vscTx) && vscTx.length > 0 ? vscTx[0].anchr_ts : data?.timestamp ?? ''
  const operations = data && !data.code ? data.transaction_json.operations : []
  const parsedOps = operations.map((v) => parseOperation(v))
  return (
    <>
      <Box mb={'3'}>
        <Text fontSize={'5xl'}>Hive Transaction</Text>
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
                Included in L1 block{' '}
              </Text>
              <Link href={l1Explorer + '/b/' + data.block_num} target="_blank" fontSize={'xl'}>
                {'#' + thousandSeperator(data.block_num)}
              </Link>{' '}
              <Tooltip placement="top" label={timestamp}>
                <Text fontSize={'xl'} display={'inline'}>
                  ({timeAgo(timestamp)})
                </Text>
              </Tooltip>
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
      <Flex gap="6" direction="column">
        {Array.isArray(vscTx) && vscTx.length > 0 && <TxOverview txn={vscTx[0]} />}
        {isLoading ? (
          <Card w="100%">
            <CardBody>Loading VSC Operations...</CardBody>
          </Card>
        ) : isSuccess && !data.code ? (
          parsedOps.map((trx, i) => (
            <Card key={i}>
              <CardHeader>
                <Heading fontSize={'2xl'}>Operation #{i}</Heading>
              </CardHeader>
              {trx.valid ? (
                <>
                  <CardBody mt={'-6'}>
                    <Table variant={'unstyled'}>
                      <Tbody>
                        <TableRow isInCard label="Timestamp" value={data.timestamp + ' (' + timeAgo(data.timestamp) + ')'} />
                        <TableRow isInCard label="Username" value={trx.user} link={'/address/hive:' + trx.user} />
                        <TableRow isInCard label="Operation Type">
                          <Badge colorScheme={themeColorScheme}>{trx.type}</Badge>
                        </TableRow>
                      </Tbody>
                    </Table>
                  </CardBody>
                  <CardHeader>
                    <Heading fontSize={'xl'}>Payload</Heading>
                  </CardHeader>
                  <CardBody marginTop={'-6'}>
                    <JsonToTableRecursive isInCard minimalSpace json={trx.payload} />
                  </CardBody>
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
                <CardBody mt={'-6'}>
                  <Text fontStyle={'italic'}>This operation is not related to VSC.</Text>
                </CardBody>
              )}
            </Card>
          ))
        ) : null}
      </Flex>
    </>
  )
}

const L2Tx = () => {
  const { txid } = useParams()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vsc-tx', txid],
    queryFn: async () => fetchL2TxnsDetailed(txid!)
  })
  const exists = !!data && Array.isArray(data.txns) && data.txns.length > 0
  const tx = exists ? data.txns[0] : null
  return (
    <>
      <Box mb={'3'}>
        <Text fontSize={'5xl'}>Transaction</Text>
        <Text fontSize={'2xl'} opacity={'0.7'}>
          {txid}
        </Text>
        {isLoading ? (
          <Skeleton h={'6'} />
        ) : isError ? (
          <Text fontSize={'xl'}>Failed to load transaction</Text>
        ) : !tx ? (
          <Text fontSize={'xl'}>Transaction does not exist</Text>
        ) : (
          <Box marginTop={'10px'}>
            <Text fontSize={'xl'} display={'inline'}>
              Anchored in L1 block{' '}
            </Text>
            <Link href={l1Explorer + '/b/' + tx.anchr_height} target="_blank" fontSize={'xl'}>
              {'#' + thousandSeperator(tx.anchr_height)}
            </Link>{' '}
            <Tooltip placement="top" label={tx.anchr_ts}>
              <Text fontSize={'xl'} display={'inline'}>
                ({timeAgo(tx.anchr_ts)})
              </Text>
            </Tooltip>
          </Box>
        )}
      </Box>
      <hr />
      <Button as={ReactRouterLink} my={'5'} colorScheme={themeColorScheme} variant={'outline'} to={`/tools/dag?cid=${txid}`}>
        View in DAG Inspector
      </Button>
      {!!tx && (
        <Flex gap="6" direction="column">
          <TxOverview txn={tx} />
          {tx.ops.map((op, i) => (
            <Card key={i}>
              <CardHeader>
                <Heading fontSize={'2xl'}>Operation #{i}</Heading>
              </CardHeader>
              <CardBody mt={'-6'}>
                <JsonToTableRecursive isInCard minimalSpace json={op} />
              </CardBody>
            </Card>
          ))}
        </Flex>
      )}
    </>
  )
}
