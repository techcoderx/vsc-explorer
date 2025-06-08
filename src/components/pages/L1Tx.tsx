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
  Icon
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
const CardTr = ({ children }: { children: ReactNode }) => (
  <Tr
    _dark={{
      borderTop: cardBorder,
      borderBottom: cardBorder
    }}
    _light={{
      borderTop: cardBorderLight,
      borderBottom: cardBorderLight
    }}
  >
    {children}
  </Tr>
)
const MinTd = ({ children }: { children: ReactNode }) => <Td py={'2'}>{children}</Td>

const TxOut = ({ txn }: { txn: Txn }) => (
  <Accordion allowToggle>
    <AccordionItem>
      <AccordionButton>
        <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
          Ledger Operations ({txn.ledger.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
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
                  <CardTr key={i}>
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
                  </CardTr>
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
      <AccordionPanel>
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
                  <CardTr key={i}>
                    <MinTd>{item.type}</MinTd>
                    <MinTd>
                      <AccountLink val={item.to} />
                    </MinTd>
                    <MinTd>{fmtmAmount(item.amount, item.type === 'consensus_unstake' ? 'HIVE' : item.asset)}</MinTd>
                    <MinTd>
                      <StatusBadge status={item.status} />
                    </MinTd>
                    <MinTd>{item.memo}</MinTd>
                  </CardTr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </AccordionPanel>
    </AccordionItem>
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
  const vscTx = useQuery({
    queryKey: ['vsc-tx', txid],
    queryFn: async () => fetchL2TxnsDetailed(txid!),
    enabled: isValid
  }).data?.txns
  const timestamp = Array.isArray(vscTx) && vscTx.length > 0 ? vscTx[0].anchr_ts : data?.timestamp ?? ''
  const operations = data && !data.code ? data.transaction_json.operations : []
  const parsedOps = operations.map((v) => parseOperation(v))
  return (
    <>
      <Box marginBottom={'15px'}>
        <Text fontSize={'5xl'}>Hive Transaction</Text>
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
      {Array.isArray(vscTx) && vscTx.length > 0 && (
        <Card mb={'6'}>
          <CardHeader>
            <Flex gap={'3'} direction={'row'}>
              <Heading fontSize={'2xl'} display={'inline'}>
                VSC Transaction
              </Heading>
              <Tag
                colorScheme={vscTx[0].status === 'CONFIRMED' ? 'green' : vscTx[0].status === 'FAILED' ? 'red' : themeColorScheme}
              >
                {vscTx[0].status.toUpperCase()}
              </Tag>
            </Flex>
          </CardHeader>
          {(vscTx[0].ledger.length > 0 || vscTx[0].ledger_actions.length > 0) && (
            <CardBody mt={'-6'}>
              <TxOut txn={vscTx[0]} />
            </CardBody>
          )}
        </Card>
      )}
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
          ))}
        </Flex>
      ) : null}
    </>
  )
}

export default L1Tx
