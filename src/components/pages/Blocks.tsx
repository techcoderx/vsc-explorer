import { Text, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import PageNotFound from './404'
import Pagination from '../Pagination'
import { fetchProps, fetchBlocks } from '../../requests'
import { abbreviateHash, thousandSeperator, timeAgo } from '../../helpers'
import { ProgressBarPct } from '../ProgressPercent'

const count = 50

const Blocks = () => {
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    enabled: !invalidPage
  })
  const height = prop?.l2_block_height
  const lastBlock = (prop?.l2_block_height || 0) - (pageNumber - 1) * count
  const {
    data: blocks,
    isLoading: isBlocksLoading,
    isSuccess: isBlocksSuccess
  } = useQuery({
    queryKey: ['vsc-blocks', height, page],
    queryFn: async () => fetchBlocks(lastBlock, count),
    enabled: !!height && !invalidPage
  })
  if (invalidPage) return <PageNotFound />

  return (
    <>
      <Text fontSize={'5xl'}>Latest Blocks</Text>
      <hr />
      <br />
      <Text>Total {isPropSuccess ? thousandSeperator(prop.l2_block_height) : 0} blocks.</Text>
      <TableContainer marginTop={'15px'} marginBottom={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Age</Th>
              <Th>Proposer</Th>
              <Th>Block Hash</Th>
              <Th>Voted</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isBlocksLoading ? (
              <Tr>
                {[...Array(6)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton height="20px" />
                  </Td>
                ))}
              </Tr>
            ) : isBlocksSuccess ? (
              blocks.map((item, i) => (
                <Tr key={i}>
                  <Td>
                    <Link as={ReactRouterLink} to={'/block/' + item.be_info.block_id}>
                      {item.be_info.block_id}
                    </Link>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.ts} placement="top">
                      {timeAgo(item.ts)}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/address/hive:' + item.proposer}>
                      {item.proposer}
                    </Link>
                  </Td>
                  {/* <Td>{item.txs}</Td> */}
                  <Td>
                    <Tooltip label={item.block} placement="top">
                      <Link as={ReactRouterLink} to={'/block/' + item.be_info.block_id}>
                        {abbreviateHash(item.block)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td maxW={'200px'}>
                    <ProgressBarPct val={(item.be_info.voted_weight / item.be_info.eligible_weight) * 100} />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination path="/blocks" currentPageNum={pageNumber} maxPageNum={Math.ceil((height || 0) / count)} />
    </>
  )
}

export default Blocks
