import { Text, Table, Thead, Tbody, Tr, Th, Td, Box, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageNotFound from './404'
import Pagination from '../Pagination'
import { fetchProps, fetchBlocks } from '../../requests'
import { thousandSeperator, timeAgo } from '../../helpers'
import { ipfsSubGw } from '../../settings'

const count = 50

const Blocks = () => {
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = page && isNaN(pageNumber) || pageNumber < 1
  const paginate = page ? pageNumber*count : count
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    enabled: !invalidPage
  })
  const height = prop?.l2_block_height
  const { data: blocks, isLoading: isBlocksLoading, isSuccess: isBlocksSuccess } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-blocks', height, page],
    queryFn: async () => {
      const d = await fetchBlocks(Math.max(1,height!-paginate+1),count)
      return d.reverse()
    },
    enabled: !!height && !invalidPage
  })
  if (invalidPage)
    return <PageNotFound/>

  return (
    <>
      <Text fontSize={'5xl'}>Latest Blocks</Text>
      <hr/><br/>
      <Text>Total {isPropSuccess ? thousandSeperator(prop.l2_block_height) : 0} blocks</Text>
      <Box overflowX="auto" marginTop={'15px'} marginBottom={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Age</Th>
              <Th>Proposer</Th>
              <Th>Block Hash</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isBlocksLoading ? (
              <Tr>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
              </Tr>
            ) : ( isBlocksSuccess ?
              blocks.map((item, i) => (
                <Tr key={i}>
                  <Td><Link as={ReactRouterLink} to={'/block/'+item.id}>{item.id}</Link></Td>
                  <Td sx={{whiteSpace: 'nowrap'}}>
                    <Tooltip label={item.ts} placement='top'>
                      {timeAgo(item.ts)}
                    </Tooltip>
                  </Td>
                  <Td><Link as={ReactRouterLink} to={'/@'+item.proposer}>{item.proposer}</Link></Td>
                  <Td isTruncated><Link href={ipfsSubGw(item.block_hash)} target='_blank'>{item.block_hash}</Link></Td>
                </Tr>
              )) : <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      <Pagination path='/blocks' currentPageNum={pageNumber} maxPageNum={Math.ceil((height || 0)/count)}/>
    </>
  )
}

export default Blocks