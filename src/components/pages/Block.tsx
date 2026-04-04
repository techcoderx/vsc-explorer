import { Heading, Text, Table, Stack, Tabs } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { fetchBlock, fetchEpoch, fetchL2TxnsBy, getDagByCIDBatch, useDagByCID } from '../../requests'
import PageNotFound from './404'
import TableRow from '../TableRow'
import { PrevNextBtns } from '../Pagination'
import { beL1BlockUrl, fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'
import { Block as BlockResult } from '../../types/HafApiResult'
import { ProgressBarPct } from '../ProgressPercent'
import { ParticipatedMembers } from '../BlsAggMembers'
import { BlockHeader, ContractOutput, ContractOutputDag, OffchainTx, OpLog } from '../../types/L2ApiResult'
import { CheckXIcon, ToIcon } from '../CheckXIcon'
import { AccountLink, TxLink } from '../TableLink'
import { Coin } from '../../types/Payloads'
import { ContractOutputTbl } from '../tables/ContractOutput'
import { Txns } from '../tables/Transactions'
import { PageTitle } from '../PageTitle'

const BlockTxs = ({ txIds }: { txIds: string[] }) => {
  const { data } = useQuery({
    queryKey: ['vsc-tx-multi', ...txIds],
    queryFn: async () => fetchL2TxnsBy(0, 100, { byIds: txIds }),
    enabled: txIds.length > 0
  })
  return <Txns txs={data?.txns || []} />
}

export const BlockBy = () => {
  const { blockId } = useParams()
  const blkNum = parseInt(blockId!)
  const invalidBlkNum = isNaN(blkNum) || blkNum < 1
  const invalidBlkHash = !blockId || blockId.length !== 59 || !blockId.startsWith('bafyrei')
  const invalidBlkTxId = !blockId || blockId.length !== 40 || !/^[0-9a-f]+$/i.test(blockId)
  const invalidBlkId = invalidBlkNum && invalidBlkHash && invalidBlkTxId
  const blockBy = !invalidBlkTxId ? 'id1' : !invalidBlkNum ? 'id' : 'cid'
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vsc-block', blockBy, blockId!],
    queryFn: async () => fetchBlock(blockId!, blockBy),
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
    queryFn: async () => getDagByCIDBatch<OffchainTx | OpLog | ContractOutputDag>(blockTxIds),
    enabled: !!blockDag
  })
  const txIds = blockDag ? blockDag.txs.filter((t) => t.type === 1).map((v) => v.id) : []
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
      <PageTitle title={`Block #${thousandSeperator(blkNum)}`} />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Heading as="h1" size="5xl" fontWeight="normal">Block #{thousandSeperator(blkNum)}</Heading>
        <PrevNextBtns toPrev={blkNum > 1 ? '/block/' + (blkNum! - 1) : undefined} toNext={'/block/' + (blkNum! + 1)} />
      </Stack>
      <hr />
      {(block && block.error) || isBlockError ? (
        <Text mt={'3'}>{block ? block.error : 'Failed to fetch block from backend'}</Text>
      ) : (
        <>
          <Table.Root marginTop="20px">
            <Table.Body>
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
                link={beL1BlockUrl(block?.slot_height)}
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
            </Table.Body>
          </Table.Root>

          <Tabs.Root mt={'7'} colorPalette={themeColorScheme} variant={'enclosed'} defaultValue="0">
            <Tabs.List overflowX={'auto'} whiteSpace={'nowrap'} maxW={'100%'} display={'flex'} css={{ '& > button': { flexShrink: 0 } }}>
              <Tabs.Trigger value="0">Transactions</Tabs.Trigger>
              <Tabs.Trigger value="1">Op Logs</Tabs.Trigger>
              {Array.isArray(outputs) && outputs.length > 0 && <Tabs.Trigger value="2">Contract Outputs</Tabs.Trigger>}
              <Tabs.Trigger value="3">Participation</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="0" mt={'2'} pt={'1'}>
              <BlockTxs txIds={txIds} />
            </Tabs.Content>
            <Tabs.Content value="1" mt={'2'}>
              <Table.ScrollArea>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader></Table.ColumnHeader>
                      <Table.ColumnHeader>Transaction ID</Table.ColumnHeader>
                      <Table.ColumnHeader>Type</Table.ColumnHeader>
                      <Table.ColumnHeader>From</Table.ColumnHeader>
                      <Table.ColumnHeader></Table.ColumnHeader>
                      <Table.ColumnHeader>To</Table.ColumnHeader>
                      <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {opLogs?.outputs.map((tx, i) => {
                      return tx.ok && tx.lidx.length > 0 ? (
                        tx.lidx.map((ln, j) => (
                          <Table.Row key={`${i}.${j}`}>
                            <Table.Cell>{j === 0 ? <CheckXIcon ok={tx.ok} /> : null}</Table.Cell>
                            <Table.Cell>{j === 0 ? <TxLink val={tx.id} /> : null}</Table.Cell>
                            <Table.Cell>{opLogs.ledger[ln].ty}</Table.Cell>
                            <Table.Cell>
                              <AccountLink val={opLogs.ledger[ln].fr} />
                            </Table.Cell>
                            <Table.Cell>
                              <ToIcon />
                            </Table.Cell>
                            <Table.Cell>
                              <AccountLink val={opLogs.ledger[ln].to} />
                            </Table.Cell>
                            <Table.Cell>{fmtmAmount(opLogs.ledger[ln].am, opLogs.ledger[ln].as.toUpperCase() as Coin)}</Table.Cell>
                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row key={`${i}`}>
                          <Table.Cell>
                            <CheckXIcon ok={tx.ok} />
                          </Table.Cell>
                          <Table.Cell>
                            <TxLink val={tx.id} />
                          </Table.Cell>
                          {[...Array(5)].map((_, k) => (
                            <Table.Cell key={k}>
                              <Text fontStyle={'italic'} opacity={'0.7'}>
                                {k !== 2 ? 'N/A' : ''}
                              </Text>
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Tabs.Content>
            {Array.isArray(outputs) && outputs.length > 0 && (
              <Tabs.Content value="2" mt={'2'} pt={'1'}>
                <ContractOutputTbl outputs={outputs ?? []} />
              </Tabs.Content>
            )}
            <Tabs.Content value="3" mt={'2'}>
              {block && block.be_info ? (
                <ParticipatedMembers
                  bv={block.be_info.signature.bv}
                  sig={block.be_info.signature.sig}
                  members={epoch?.members || []}
                  weights={epoch?.weights || []}
                />
              ) : null}
            </Tabs.Content>
          </Tabs.Root>
        </>
      )}
    </>
  )
}
