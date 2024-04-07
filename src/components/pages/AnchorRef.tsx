import { Text, Table, Tbody, Stack, Flex, Box, Heading } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchAnchorRefByCID, fetchAnchorRefByID } from '../../requests'
import PageNotFound from './404'
import TableRow from '../TableRow'
import { PrevNextBtns } from '../Pagination'
import { isPuralArr, thousandSeperator, timeAgo } from '../../helpers'
import { TxCard } from '../TxCard'
import { AnchorRef as AnchorRefResult } from '../../types/HafApiResult'

export const AnchorRefByID = () => {
  const { refid } = useParams()
  const refNum = parseInt(refid!)
  const invalidRefId = isNaN(refNum) || refNum < 0
  const { data, isLoading, isError} = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-anchor-ref-by-id', refNum],
    queryFn: async () => fetchAnchorRefByID(refNum),
    enabled: !invalidRefId
  })
  return AnchorRef(data!, isLoading, isError, invalidRefId, refNum)
}

export const AnchorRefByHash = () => {
  const { cid } = useParams()
  const invalidRefId = !cid || cid.length !== 59 || !cid.startsWith('bafyrei')
  const { data, isLoading, isError} = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-anchor-ref-by-cid', cid],
    queryFn: async () => fetchAnchorRefByCID(cid!),
    enabled: !invalidRefId
  })
  const refNum = !isLoading && !isError && !data.error ? data.id : 0
  return AnchorRef(data!, isLoading, isError, invalidRefId, refNum)
}

const AnchorRef = (anchorRef: AnchorRefResult, isRefLoading: boolean, isRefError: boolean, invalidRefNum: boolean, refNum: number) => {
  if (invalidRefNum)
    return <PageNotFound/>
  return (
    <>
      <Stack direction={{base: 'column', md: 'row'}} justifyContent='space-between'>
        <Text fontSize='5xl'>Anchor Ref #{thousandSeperator(refNum)}</Text>
        <PrevNextBtns toPrev={refNum > 1 ? '/anchor-ref/'+(refNum!-1) : undefined} toNext={'/anchor-ref/'+(refNum!+1)}/>
      </Stack>
      <hr/>
      {anchorRef?.error || isRefError ? <Text>Failed to load anchor ref, error: {anchorRef ? anchorRef.error : 'Failed to fetch from HAF node'}</Text> : (
        <Box>
          <Table mt={'20px'}>
            <Tbody>
              <TableRow label='Ref ID' value={refNum} isLoading={isRefLoading}/>
              <TableRow label='Timestamp' value={anchorRef ? anchorRef.ts+' ('+timeAgo(anchorRef.ts)+')' : ''} isLoading={isRefLoading}/>
              <TableRow label='L2 Block' value={anchorRef?.block_num} link={'/block/'+anchorRef?.block_num} isLoading={isRefLoading}/>
              <TableRow label='Data CID' value={anchorRef?.cid} isLoading={isRefLoading}/>
              <TableRow label='Transaction Root' value={anchorRef?.tx_root} isLoading={isRefLoading}/>
            </Tbody>
          </Table>
          <Heading mt={'7'} fontSize={'xl'}>{(anchorRef && anchorRef.refs.length) ?? 0} transaction{isPuralArr((anchorRef && anchorRef.refs) ?? []) ? 's' : ''} in this anchor ref</Heading>
          <Flex direction={'column'} gap={'3'} mt={'3'}>
            {anchorRef?.refs.map((tx, i) => {
              return (<TxCard key={i} id={i} ts={anchorRef?.ts} txid={tx}>{tx}</TxCard>)
            })}
          </Flex>
        </Box>
      )}
    </>
  )
}