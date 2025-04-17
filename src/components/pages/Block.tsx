import {
  Text,
  Table,
  Tbody,
  Stack,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  TableContainer,
  Thead,
  Th,
  Tr,
  Td,
  Icon
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { fetchBlock, fetchEpoch, getDagByCID, getDagByCIDBatch } from '../../requests'
import PageNotFound from './404'
import TableRow from '../TableRow'
import { PrevNextBtns } from '../Pagination'
import { base64UrlToHex, getVotedMembers, roundFloat, thousandSeperator, timeAgo } from '../../helpers'
import { l1Explorer, themeColorScheme } from '../../settings'
// import { L2TxCard } from '../TxCard'
import { Block as BlockResult } from '../../types/HafApiResult'
import { ProgressBarPct } from '../ProgressPercent'
import { ParticipatedMembers } from '../BlsAggMembers'
import { BlockHeader, OpLog } from '../../types/L2ApiResult'
import { CheckXIcon } from '../CheckXIcon'
import { FaCircleArrowRight } from 'react-icons/fa6'
import { AccountLink, TxLink } from '../TableLink'

export const BlockBy = () => {
  const { blockId } = useParams()
  const blkNum = parseInt(blockId!)
  const invalidBlkNum = isNaN(blkNum) || blkNum < 1
  const invalidBlkHash = !blockId || blockId.length !== 59 || !blockId.startsWith('bafyrei')
  const invalidBlkId = invalidBlkNum && invalidBlkHash
  const blockBy = !invalidBlkNum ? 'id' : 'cid'
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vsc-block', blockBy, blockId!],
    queryFn: async () => fetchBlock(blockId!, !invalidBlkNum ? 'id' : 'cid'),
    enabled: !invalidBlkId
  })
  return Block(
    data!,
    isLoading,
    isError,
    invalidBlkId,
    !invalidBlkNum ? blkNum : data && data.be_info ? data.be_info.block_id : -1
  )
}

const Block = (block: BlockResult, isBlockLoading: boolean, isBlockError: boolean, invalidBlkId: boolean, blkNum: number) => {
  // const l1BlockSuccess = !invalidBlkId && !isBlockLoading && !isBlockError && !block.error
  // const {
  //   data: l2BlockTxs,
  //   isLoading: isL2BlockLoading,
  //   isError: isL2BlockError
  // } = useQuery({
  //   queryKey: ['vsc-block-txs', blkNum],
  //   queryFn: async () => fetchBlockTxs(blkNum),
  //   enabled: !isBlockError && !isBlockLoading && !invalidBlkId
  // })
  const { data: epoch } = useQuery({
    queryKey: ['vsc-epoch', block && !block.error ? block?.be_info.epoch : -1],
    queryFn: async () => fetchEpoch(block && !block.error ? block?.be_info.epoch : -1),
    enabled: !isBlockError && !isBlockLoading && !invalidBlkId && !block.error
  })
  const { votedMembers, votedWeight, totalWeight } = getVotedMembers(
    base64UrlToHex((block && !block.error && block.be_info && block.be_info.signature ? block.be_info.signature.bv : '') ?? ''),
    epoch?.members ?? [],
    epoch?.weights ?? []
  )
  const { data: blockDag } = useQuery({
    queryKey: ['dag-by-cid', (block && block.block) ?? ''],
    queryFn: async () => getDagByCID<BlockHeader>(block.block),
    enabled: !!block && !block.error
  })
  const blockTxIds = blockDag ? blockDag.txs.map((t) => t.id) : []
  const { data: txDags } = useQuery({
    queryKey: ['dag-by-cid-batch', ...blockTxIds],
    queryFn: async () => getDagByCIDBatch<OpLog>(blockTxIds),
    enabled: !!blockDag
  })
  const opLogs = txDags?.find((d) => d.__t === 'vsc-oplog')
  if (invalidBlkId) return <PageNotFound />
  return (
    <>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize="5xl">Block #{thousandSeperator(blkNum)}</Text>
        <PrevNextBtns toPrev={blkNum > 1 ? '/block/' + (blkNum! - 1) : undefined} toNext={'/block/' + (blkNum! + 1)} />
      </Stack>
      <hr />
      {(block && block.error) || isBlockError ? (
        <Text mt={'3'}>{block ? block.error : 'Failed to fetch block from backend'}</Text>
      ) : (
        <>
          <Table marginTop="20px">
            <Tbody>
              <TableRow label="Block ID" value={blkNum} isLoading={isBlockLoading} />
              <TableRow
                label="Timestamp"
                value={block ? block.ts + ' (' + timeAgo(block.ts) + ')' : ''}
                isLoading={isBlockLoading}
              />
              <TableRow label="L1 Tx" value={block?.id} isLoading={isBlockLoading} link={'/tx/' + block?.id} />
              <TableRow
                label="Slot Height"
                value={block?.slot_height}
                isLoading={isBlockLoading}
                link={l1Explorer + '/b/' + block?.slot_height}
              />
              <TableRow label="Proposer" value={block?.proposer} isLoading={isBlockLoading} link={'/@' + block?.proposer} />
              <TableRow label="Block Hash" value={block?.block} isLoading={isBlockLoading} />
              <TableRow label="Participation">
                <ProgressBarPct fontSize={'md'} val={(votedWeight / totalWeight) * 100} />
              </TableRow>
            </Tbody>
          </Table>

          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'solid-rounded'}>
            <TabList>
              <Tab>Transactions</Tab>
              <Tab>Op Logs</Tab>
              <Tab>Participation</Tab>
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel>
                👀 Coming soon...
                {/* {isL2BlockLoading ? <Text>Loading L2 block details...</Text> : null}
            {l1BlockSuccess && !isL2BlockLoading && !isL2BlockError && !isL2BlockLoading ? (
              <Flex direction={'column'} gap={'3'}>
                {l2BlockTxs?.map((tx, i) => {
                  return <L2TxCard key={i} id={i} ts={block!.ts} txid={tx.id} op={tx.tx_type} />
                })}
              </Flex>
            ) : isL2BlockError ? (
              <Text>Failed to load L2 block data</Text>
            ) : null} */}
              </TabPanel>
              <TabPanel>
                <TableContainer>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th></Th>
                        <Th>Transaction ID</Th>
                        <Th>Type</Th>
                        <Th>From</Th>
                        <Th></Th>
                        <Th>To</Th>
                        <Th>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {opLogs?.outputs.map((tx, i) => {
                        return tx.ok ? (
                          tx.lidx.map((ln, j) => (
                            <Tr key={`${i}.${j}`}>
                              <Td>{j === 0 ? <CheckXIcon ok={tx.ok} /> : null}</Td>
                              <Td>{j === 0 ? <TxLink val={tx.id} /> : null}</Td>
                              <Td>{opLogs.ledger[ln].ty}</Td>
                              <Td>
                                <AccountLink val={opLogs.ledger[ln].fr} />
                              </Td>
                              <Td>
                                <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} />
                              </Td>
                              <Td>
                                <AccountLink val={opLogs.ledger[ln].to} />
                              </Td>
                              <Td>{`${roundFloat(opLogs.ledger[ln].am / 1000, 3)} ${opLogs.ledger[ln].as.toUpperCase()}`}</Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr key={`${i}`}>
                            <Td>
                              <CheckXIcon ok={tx.ok} />
                            </Td>
                            <Td>
                              <TxLink val={tx.id} />
                            </Td>
                            {[...Array(5)].map((_, k) => (
                              <Td key={k}>
                                <Text fontStyle={'italic'} opacity={'0.7'}>
                                  {k !== 2 ? 'N/A' : ''}
                                </Text>
                              </Td>
                            ))}
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel>
                <ParticipatedMembers
                  bvHex={base64UrlToHex(block && block.be_info.signature && block.be_info.signature.bv) ?? ''}
                  sig={(block && block.be_info.signature && block.be_info.signature.sig) ?? ''}
                  members={votedMembers.map((m) => m.account)}
                  isLoading={isBlockLoading}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </>
  )
}
