import { Text, TableContainer, Table, Tbody, Thead, Tr, Th, Td, Tooltip, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchElections, fetchProps } from '../../requests'
import { abbreviateHash, thousandSeperator } from '../../helpers'
// import { ProgressBarPct } from '../ProgressPercent'
import PageNotFound from './404'
import Pagination from '../Pagination'
import { l1Explorer } from '../../settings'

const count = 100

const Elections = () => {
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data: prop } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    enabled: !invalidPage
  })
  const lastEpoch = (prop?.epoch || 0) - (pageNumber - 1) * count
  const {
    data: epochs,
    isLoading: isEpochsLoading,
    isSuccess: isEpochsSuccess
  } = useQuery({
    queryKey: ['vsc-epochs', lastEpoch, count],
    queryFn: async () => fetchElections(lastEpoch!, count),
    enabled: !!prop && typeof prop.epoch === 'number' && !invalidPage
  })
  if (invalidPage) return <PageNotFound />
  return (
    <>
      <Text fontSize={'5xl'}>Elections</Text>
      <hr />
      <br />
      <TableContainer mb={'15px'}>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th>Epoch</Th>
              <Th>L1 Block Number</Th>
              <Th>Proposer</Th>
              <Th>Data CID</Th>
              <Th>Members</Th>
              <Th>Total Weight</Th>
              {/* <Th>Voted</Th> */}
            </Tr>
          </Thead>
          <Tbody>
            {isEpochsLoading ? (
              <Tr>
                {[...Array(6)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton height="20px" />
                  </Td>
                ))}
              </Tr>
            ) : isEpochsSuccess ? (
              epochs.map((epoch, i) => (
                <Tr key={i}>
                  <Td>
                    <Link as={ReactRouterLink} to={'/epoch/' + epoch.epoch}>
                      {epoch.epoch}
                    </Link>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Link href={l1Explorer + '/b/' + epoch.block_height} target="_blank">
                      {thousandSeperator(epoch.block_height)}
                    </Link>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/@' + epoch.proposer}>
                      {epoch.proposer}
                    </Link>
                  </Td>
                  <Td>
                    <Tooltip label={epoch.data} placement="top">
                      <Link as={ReactRouterLink} to={'/epoch/' + epoch.epoch}>
                        {abbreviateHash(epoch.data)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td>{epoch.members.length}</Td>
                  <Td>{epoch.total_weight}</Td>
                  {/* <Td maxW={'200px'}>
                    <ProgressBarPct val={(epoch.voted_weight / epoch.eligible_weight) * 100} />
                  </Td> */}
                </Tr>
              ))
            ) : (
              <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination path="/elections" currentPageNum={pageNumber} maxPageNum={Math.ceil((prop?.epoch || 0) / count)} />
    </>
  )
}

export default Elections
