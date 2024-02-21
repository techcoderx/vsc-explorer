import { Text, Table, Tbody, Stack, Box, Heading, Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { cid as isCID } from 'is-ipfs'
import { CID } from 'multiformats/cid'
import { fetchBlock, fetchBlockByHash, useFindCID } from '../../requests'
import PageNotFound from './404'
import TableRow from '../TableRow'
import { PrevNextBtns } from '../Pagination'
import { isPuralArr, thousandSeperator, timeAgo } from '../../helpers'
import { ipfsSubGw, l1Explorer } from '../../settings'
import { L2TxCard } from '../TxCard'
import { L2BlockCID } from '../../types/L2ApiResult'
import { Block as BlockResult } from '../../types/HafApiResult'

export const BlockByID = () => {
  const {blockNum} = useParams()
  const blkNum = parseInt(blockNum!)
  const invalidBlkNum = isNaN(blkNum) || blkNum < 1
  const { data, isLoading, isError} = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-block', blkNum],
    queryFn: async () => fetchBlock(blkNum),
    enabled: !invalidBlkNum
  })
  return Block(data!, isLoading, isError, invalidBlkNum, blkNum)
}

export const BlockByHash = () => {
  const {blockId} = useParams()
  const invalidBlkId = !blockId || !isCID(blockId) || CID.parse(blockId).code !== 0x71
  const { data, isLoading, isError} = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-block', blockId],
    queryFn: async () => fetchBlockByHash(blockId!),
    enabled: !invalidBlkId
  })
  const blkNum = !isLoading && !isError && !data.error ? data.id : 0
  return Block(data!, isLoading, isError, invalidBlkId, blkNum)
}

const Block = (block: BlockResult, isBlockLoading: boolean, isBlockError: boolean, invalidBlkNum: boolean, blkNum: number) => {
  const l1BlockSuccess = !invalidBlkNum && !isBlockLoading && !isBlockError && !block.error
  const { data, isLoading: isL2BlockLoading, isError: isL2BlockError } = useFindCID(block?.block_hash, true, false, l1BlockSuccess)
  const l2Block = data as L2BlockCID
  const isValidL2Block = !isL2BlockLoading && !isL2BlockError && l2Block.findCID.type === 'vsc-block' && l2Block.findCID.data && Array.isArray(l2Block.findCID.data.txs)
  if (invalidBlkNum)
    return <PageNotFound/>
  return (
    <>
      <Stack direction={{base: 'column', md: 'row'}} justifyContent='space-between'>
        <Text fontSize='5xl'>Block #{thousandSeperator(blkNum)}</Text>
        <PrevNextBtns toPrev={blkNum > 1 ? '/block/'+(blkNum!-1) : undefined} toNext={'/block/'+(blkNum!+1)}/>
      </Stack>
      <hr/>
      {block?.error || isBlockError ? <Text>Failed to load block, error: {block ? block.error : 'Failed to fetch from HAF node'}</Text> : (
        <Table marginTop='20px'>
          <Tbody>
            <TableRow label="Block ID" value={block?.id} isLoading={isBlockLoading}/>
            <TableRow label="Timestamp" value={block ? block.ts+' ('+timeAgo(block.ts)+')' : ''} isLoading={isBlockLoading}/>
            <TableRow label="L1 Tx" value={block?.l1_tx} isLoading={isBlockLoading} link={'/tx/'+block?.l1_tx}/>
            <TableRow label="L1 Block" value={block?.l1_block} isLoading={isBlockLoading} link={l1Explorer+'/b/'+block?.l1_block}/>
            <TableRow label="Proposer" value={block?.proposer} isLoading={isBlockLoading} link={'/@'+block?.proposer}/>
            <TableRow label="Previous Block Hash" value={block?.prev_block_hash ?? 'NULL'} isLoading={isBlockLoading} link={block?.prev_block_hash ? ipfsSubGw(block?.prev_block_hash) : undefined}/>
            <TableRow label="Block Hash" value={block?.block_hash} isLoading={isBlockLoading} link={block ? ipfsSubGw(block?.block_hash): undefined}/>
          </Tbody>
        </Table>
      )}
      {isL2BlockLoading ? <Text mt={'9'}>Loading L2 Block...</Text> : null}
      {l1BlockSuccess && !isL2BlockLoading && !isL2BlockError ? (isValidL2Block ? (
        <Box mt={'9'}>
          <Heading fontSize={'2xl'}>{l2Block.findCID.data.txs.length} transaction{isPuralArr(l2Block.findCID.data.txs) ? 's' : ''} in this block</Heading>
          <Flex direction={'column'} gap={'3'} marginTop={'15px'}>
            {l2Block.findCID.data.txs.map((tx, i) => {
              if (!tx.id || typeof tx.id['/'] !== 'string' || typeof tx.op !== 'string')
                return null
              return (<L2TxCard key={i} id={i} ts={block!.ts} txid={tx.id['/']} op={tx.op}/>)
            })}
          </Flex>
        </Box>
      ): <Text>Invalid or malformed L2 block data</Text>) : (isL2BlockError ? <Text>Failed to load L2 block data</Text> : null)}
    </>
  )
}