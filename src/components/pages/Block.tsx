import { Text, Table, Tbody, Stack, Box, Heading, Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchBlock, useFindCID } from '../../requests'
import PageNotFound from './404'
import TableRow from '../TableRow'
import { PrevNextBtns } from '../Pagination'
import { isPuralArr, timeAgo } from '../../helpers'
import { ipfsSubGw, l1Explorer } from '../../settings'
import { L2TxCard } from '../TxCard'

const Block = () => {
  const {blockNum} = useParams()
  const blkNum = parseInt(blockNum!)
  const invalidBlkNum = isNaN(blkNum) || blkNum < 1
  const { data: block, isLoading: isBlockLoading, isError: isBlockError} = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-block', blkNum],
    queryFn: async () => fetchBlock(blkNum),
    enabled: !invalidBlkNum
  })
  const l1BlockSuccess = !invalidBlkNum && !isBlockLoading && !isBlockError && !block.error
  const { data: l2Block, isLoading: isL2BlockLoading, isError: isL2BlockError } = useFindCID(block?.block_hash, true, false, l1BlockSuccess)
  console.log(l2Block)
  if (invalidBlkNum)
    return <PageNotFound/>
  return (
    <>
      <Stack direction={{base: 'column', md: 'row'}} justifyContent='space-between'>
        <Text fontSize='5xl'>Block #{blockNum}</Text>
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
            <TableRow label="Announcer" value={block?.announcer} isLoading={isBlockLoading} link={'/@'+block?.announcer}/>
            <TableRow label="Previous Block Hash" value={block?.prev_block_hash ?? 'NULL'} isLoading={isBlockLoading} link={block?.prev_block_hash ? ipfsSubGw(block?.prev_block_hash) : undefined}/>
            <TableRow label="Block Hash" value={block?.block_hash} isLoading={isBlockLoading} link={block ? ipfsSubGw(block?.block_hash): undefined}/>
          </Tbody>
        </Table>
      )}
      {isL2BlockLoading ? <Text mt={'9'}>Loading L2 Block...</Text> : null}
      {l1BlockSuccess && !isL2BlockLoading && !isL2BlockError && l2Block.findCID.type === 'vsc-block' ? (
        <Box mt={'9'}>
          <Heading fontSize={'2xl'}>{l2Block.findCID.data.txs.length} transaction{isPuralArr(l2Block.findCID.data.txs) ? 's' : ''} in this block</Heading>
          <Flex direction={'column'} gap={'3'} marginTop={'15px'}>
            {l2Block.findCID.data.txs.map((tx, i) => <L2TxCard id={i} ts={block!.ts} txid={tx.id['/']} op={tx.op}/>)}
          </Flex>
        </Box>
      ): null}
    </>
  )
}

export default Block