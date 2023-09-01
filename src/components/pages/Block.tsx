import { Text, Table, Tbody, Stack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchBlock } from '../../requests'
import PageNotFound from './404'
import TableRow from '../TableRow'
import { PrevNextBtns } from '../Pagination'
import { timeAgo } from '../../helpers'
import { ipfsSubGw, l1Explorer } from '../../settings'

const Block = () => {
  const {blockNum} = useParams()
  const blkNum = parseInt(blockNum!)
  if (isNaN(blkNum) || blkNum < 1)
    return <PageNotFound/>
  const { data: block, isLoading: isBlockLoading, isError: isBlockError} = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-block', blkNum],
    queryFn: async () => fetchBlock(blkNum)
  })
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
            <TableRow label="L1 Tx" value={block?.l1_tx} isLoading={isBlockLoading} link={l1Explorer+'/tx/'+block?.l1_tx}/>
            <TableRow label="L1 Block" value={block?.l1_block} isLoading={isBlockLoading} link={l1Explorer+'/b/'+block?.l1_block}/>
            <TableRow label="Announcer" value={block?.announcer} isLoading={isBlockLoading}/>
            <TableRow label="Previous Block Hash" value={block?.prev_block_hash ?? 'NULL'} isLoading={isBlockLoading} link={block?.prev_block_hash ? ipfsSubGw(block?.prev_block_hash) : undefined}/>
            <TableRow label="Block Hash" value={block?.block_hash} isLoading={isBlockLoading} link={block ? ipfsSubGw(block?.block_hash): undefined}/>
          </Tbody>
        </Table>
      )}
    </>
  )
}

export default Block