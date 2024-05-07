import { Text, Box, Table, Tbody, Thead, Tr, Th, Td, Tooltip, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchElections, fetchProps } from '../../requests'
import { abbreviateHash, timeAgo } from '../../helpers'
import { ProgressBarPct } from '../ProgressPercent'
import { getBitsetStrFromHex, getPercentFromBitsetStr } from '../../helpers'

const Elections = () => {
  const { data: prop } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  const currentEpoch = prop?.epoch
  const {
    data: epochs,
    isLoading: isEpochsLoading,
    isSuccess: isEpochsSuccess
  } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-epochs', currentEpoch],
    queryFn: async () => fetchElections(currentEpoch!),
    enabled: !!currentEpoch
  })
  return (
    <>
      <Text fontSize={'5xl'}>Elections</Text>
      <hr />
      <br />
      <Box overflowX="auto">
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th>Epoch</Th>
              <Th>Age</Th>
              <Th>Proposer</Th>
              <Th>Data CID</Th>
              <Th>Voted</Th>
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
                    <Tooltip label={epoch.ts} placement="top">
                      {timeAgo(epoch.ts)}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/@' + epoch.proposer}>
                      {epoch.proposer}
                    </Link>
                  </Td>
                  <Td>
                    <Tooltip label={epoch.data_cid} placement="top">
                      <Link as={ReactRouterLink} to={'/epoch/' + epoch.epoch}>
                        {abbreviateHash(epoch.data_cid)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td maxW={'200px'}>
                    <ProgressBarPct val={getPercentFromBitsetStr(getBitsetStrFromHex(epoch.bv))} />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  )
}

export default Elections
