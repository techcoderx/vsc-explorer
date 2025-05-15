import { Text, TableContainer, Table, Tbody, Thead, Tr, Th, Td, Tooltip, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchElections, fetchProps } from '../../requests'
import { fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import { ProgressBarPct } from '../ProgressPercent'
import PageNotFound from './404'
import Pagination from '../Pagination'

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
              <Th>Age</Th>
              <Th>Proposer</Th>
              <Th>Blocks</Th>
              <Th>Members</Th>
              <Th>Total Weight</Th>
              <Th>Voted</Th>
              <Th>Block Votes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isEpochsLoading ? (
              <Tr>
                {[...Array(7)].map((_, i) => (
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
                      {thousandSeperator(epoch.epoch)}
                    </Link>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    {epoch.be_info ? (
                      <Tooltip placement="top" label={epoch.be_info.ts}>
                        {timeAgo(epoch.be_info.ts)}
                      </Tooltip>
                    ) : (
                      <Text fontStyle={'italic'} opacity={'0.7'}>
                        Indexing...
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/address/hive:' + epoch.proposer}>
                      {epoch.proposer}
                    </Link>
                  </Td>
                  <Td>{epoch.blocks_info?.count || 0}</Td>
                  <Td>{epoch.members.length}</Td>
                  <Td>{fmtmAmount(epoch.total_weight, 'HIVE')}</Td>
                  <Td maxW={'200px'}>
                    {epoch.epoch === 0 ? (
                      <Text>N/A</Text>
                    ) : epoch.be_info ? (
                      <ProgressBarPct val={(epoch.be_info.voted_weight / epoch.be_info.eligible_weight) * 100} />
                    ) : (
                      <Text fontStyle={'italic'} opacity={'0.7'}>
                        Indexing...
                      </Text>
                    )}
                  </Td>
                  <Td maxW={'200px'}>
                    <ProgressBarPct
                      val={(100 * (epoch.blocks_info?.total_votes || 0)) / (epoch.total_weight * (epoch.blocks_info?.count || 1))}
                    />
                  </Td>
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
