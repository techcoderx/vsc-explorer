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
  Td
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { fetchBlock, fetchEpoch, getDagByCIDBatch, useDagByCID } from '../../requests'
import PageNotFound from './404'
import TableRow from '../TableRow'
import { PrevNextBtns } from '../Pagination'
import { fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import { l1Explorer, themeColorScheme } from '../../settings'
import { Block as BlockResult } from '../../types/HafApiResult'
import { ProgressBarPct } from '../ProgressPercent'
import { ParticipatedMembers } from '../BlsAggMembers'
import { BlockHeader, ContractOutput, ContractOutputDag, OpLog } from '../../types/L2ApiResult'
import { CheckXIcon, ToIcon } from '../CheckXIcon'
import { AccountLink, TxLink } from '../TableLink'
import { Coin } from '../../types/Payloads'
import { ContractOutputTbl } from '../tables/ContractOutput'

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
  const { data: epoch } = useQuery({
    queryKey: ['vsc-epoch', block && !block.error && block.be_info ? block.be_info.epoch : -1],
    queryFn: async () => fetchEpoch(block && !block.error && block.be_info ? block.be_info.epoch : -1),
    enabled: !isBlockError && !isBlockLoading && !invalidBlkId && !block.error
  })
  const { data: blockDag } = useDagByCID<BlockHeader>(block && block.block, !!block && !block.error)
  const blockTxIds = blockDag ? blockDag.txs.map((t) => t.id) : []
  const { data: txDags } = useQuery({
    queryKey: ['dag-by-cid-batch', ...blockTxIds],
    queryFn: async () => getDagByCIDBatch<OpLog | ContractOutputDag>(blockTxIds),
    enabled: !!blockDag
  })
  const outputIds = blockDag ? blockDag.txs.filter((t) => t.type === 2) : []
  const opLogs = txDags?.find((d) => d.__t === 'vsc-oplog')
  const outputs: ContractOutput[] | undefined = txDags
    ?.filter((d) => d.__t === 'vsc-output')
    .map((v, i) => {
      return { ...v, id: outputIds[i].id, timestamp: block.ts, block_height: (block.be_info && block.be_info.block_id) ?? -1 }
    })
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
              <TableRow
                label="Proposer"
                value={block?.proposer}
                isLoading={isBlockLoading}
                link={'/address/hive:' + block?.proposer}
              />
              <TableRow
                label="Block Hash"
                value={block?.block}
                link={'/tools/dag?cid=' + block?.block}
                isLoading={isBlockLoading}
              />
              <TableRow label="Participation" isLoading={isBlockLoading}>
                {block && block.be_info ? (
                  <ProgressBarPct fontSize={'md'} val={(block.be_info.voted_weight / block.be_info.eligible_weight) * 100} />
                ) : (
                  <Text fontStyle={'italic'} opacity={'0.7'}>
                    Indexing...
                  </Text>
                )}
              </TableRow>
            </Tbody>
          </Table>

          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'solid-rounded'}>
            <TabList>
              <Tab>Transactions</Tab>
              <Tab>Op Logs</Tab>
              {Array.isArray(outputs) && outputs.length > 0 && <Tab>Contract Outputs</Tab>}
              <Tab>Participation</Tab>
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel>👀 Coming soon...</TabPanel>
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
                        return tx.ok && tx.lidx.length > 0 ? (
                          tx.lidx.map((ln, j) => (
                            <Tr key={`${i}.${j}`}>
                              <Td>{j === 0 ? <CheckXIcon ok={tx.ok} /> : null}</Td>
                              <Td>{j === 0 ? <TxLink val={tx.id} /> : null}</Td>
                              <Td>{opLogs.ledger[ln].ty}</Td>
                              <Td>
                                <AccountLink val={opLogs.ledger[ln].fr} />
                              </Td>
                              <Td>
                                <ToIcon />
                              </Td>
                              <Td>
                                <AccountLink val={opLogs.ledger[ln].to} />
                              </Td>
                              <Td>{fmtmAmount(opLogs.ledger[ln].am, opLogs.ledger[ln].as.toUpperCase() as Coin)}</Td>
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
              {Array.isArray(outputs) && outputs.length > 0 && (
                <TabPanel pt={'1'}>
                  <ContractOutputTbl outputs={outputs ?? []} />
                </TabPanel>
              )}
              <TabPanel>
                {block && block.be_info ? (
                  <ParticipatedMembers
                    bv={block.be_info.signature.bv}
                    sig={block.be_info.signature.sig}
                    members={epoch?.members || []}
                    weights={epoch?.weights || []}
                  />
                ) : null}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </>
  )
}
