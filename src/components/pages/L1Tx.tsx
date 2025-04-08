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
import { fetchTxByL1Id, fetchL1TxOutput } from '../../requests'
import { roundFloat, thousandSeperator, timeAgo } from '../../helpers'
import { l1Explorer, l1ExplorerName, themeColor, themeColorScheme } from '../../settings'
import { Block, Contract, TxHeader } from '../../types/HafApiResult'
import { ProgressBarPct } from '../ProgressPercent'

const VscLedgerTxNames = ['call', 'transfer', 'withdraw', 'consensus_stake', 'consensus_unstake', 'stake_hbd', 'unstake_hbd']

const L1Tx = () => {
  const { txid } = useParams()
  const isValid = !!txid && /^[0-9a-fA-F]{40}$/i.test(txid)
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['vsc-l1-tx', txid],
    queryFn: async () => fetchTxByL1Id(txid!),
    enabled: isValid
  })
  const { data: outData } = useQuery({
    queryKey: ['vsc-l1-tx-output', txid],
    queryFn: async () => fetchL1TxOutput(txid!),
    enabled: isValid
  })
  return (
    <>
      <Box marginBottom={'15px'}>
        <Text fontSize={'5xl'}>Hive L1 Transaction</Text>
        <Text fontSize={'2xl'} opacity={'0.7'}>
          {txid}
        </Text>
        {!isValid ? (
          <Text>Invalid transaction ID</Text>
        ) : isSuccess ? (
          data.length > 0 ? (
            <Box marginTop={'10px'}>
              <Text fontSize={'xl'} display={'inline'}>
                Included in L1 block{' '}
              </Text>
              <Link href={l1Explorer + '/b/' + data[0].block_num} target="_blank" fontSize={'xl'}>
                {'#' + thousandSeperator(data[0].block_num)}
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
      ) : isSuccess ? (
        <Flex gap="6" direction="column">
          {data.map((trx, i) => (
            <Card key={i}>
              <CardHeader>
                <Heading fontSize={'2xl'}>Operation #{i}</Heading>
              </CardHeader>
              <CardBody>
                <Table margin={'-20px 0 0'} variant={'unstyled'}>
                  <Tbody>
                    <TableRow isInCard label="ID" value={trx.id} />
                    <TableRow isInCard label="Timestamp" value={trx.ts + ' (' + timeAgo(trx.ts) + ')'} />
                    <TableRow isInCard label="Username" value={trx.username} link={'/@' + trx.username} />
                    <TableRow isInCard label="Operation Type">
                      <Badge color={themeColor}>{trx.type}</Badge>
                    </TableRow>
                    <TableRow isInCard label="Nonce" value={trx.nonce} />
                    {outData && outData[i] && VscLedgerTxNames.includes(trx.type) ? (
                      <TableRow isInCard label="Status">
                        <Badge color={themeColor}>{(outData[i] as TxHeader).status}</Badge>
                      </TableRow>
                    ) : null}
                  </Tbody>
                </Table>
              </CardBody>
              <CardHeader>
                <Heading fontSize={'xl'}>Payload</Heading>
              </CardHeader>
              <CardBody marginTop={'-25px'}>
                <JsonToTableRecursive isInCard minimalSpace json={trx.payload as object} />
              </CardBody>
              {outData && outData[i] ? (
                VscLedgerTxNames.includes(trx.type) &&
                Array.isArray((outData[i] as TxHeader).ledger) &&
                (outData[i] as TxHeader).ledger.length > 0 ? (
                  <Box>
                    <CardHeader>
                      <Heading fontSize={'xl'}>Ledger Operations</Heading>
                    </CardHeader>
                    <CardBody mt={'-25px'}>
                      <JsonToTableRecursive
                        isInCard
                        minimalSpace
                        json={(outData[i] as TxHeader).ledger.map((l) => {
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
                  </Box>
                ) : trx.type === 'create_contract' ? (
                  <Box>
                    <CardHeader>
                      <Heading fontSize={'xl'}>Deployed Contract</Heading>
                    </CardHeader>
                    <CardBody>
                      <TableRow
                        minimalSpace
                        isInCard
                        allCardBorders
                        label="Contract ID"
                        value={(outData[i]! as Contract).id}
                        link={'/contract/' + (outData[i]! as Contract).id}
                      />
                    </CardBody>
                  </Box>
                ) : trx.type === 'produce_block' ? (
                  <Box>
                    <CardHeader>
                      <Heading fontSize={'xl'}>Proposed Block</Heading>
                    </CardHeader>
                    <CardBody mt={'-25px'}>
                      <Table margin={'0'} variant={'unstyled'}>
                        <Tbody>
                          <TableRow
                            minimalSpace
                            isInCard
                            allCardBorders
                            label="Block Number"
                            value={(outData[i]! as Block).be_info.block_id}
                            link={'/block/' + (outData[i]! as Block).be_info.block_id}
                          />
                          <TableRow
                            minimalSpace
                            isInCard
                            allCardBorders
                            label="Block Hash"
                            value={(outData[i]! as Block).block}
                          />
                          {typeof (outData[i]! as Block).be_info === 'object' ? (
                            <TableRow minimalSpace isInCard allCardBorders label="Participation">
                              <ProgressBarPct
                                fontSize={'md'}
                                val={
                                  ((outData[i]! as Block).be_info.voted_weight / (outData[i]! as Block).be_info.eligible_weight) *
                                  100
                                }
                              />
                            </TableRow>
                          ) : null}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Box>
                ) : null
              ) : null}
            </Card>
          ))}
        </Flex>
      ) : null}
    </>
  )
}

export default L1Tx
