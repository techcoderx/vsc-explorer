import { Text, Table, Thead, Tbody, Tr, Th, Td, Box, Skeleton, Badge, Link, Tooltip } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProps, fetchWitnesses } from '../../requests'

const Witnesses = () => {
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  const { data: witnesses, isLoading: isWitnessLoading, isSuccess: isWitnessSuccess } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-witnesses', 0],
    queryFn: async () => fetchWitnesses(0)
  })
  return (
    <>
      <Text fontSize={'5xl'}>Witnesses</Text>
      <hr/><br/>
      <Text>Total {isPropSuccess ? prop.witnesses : 0} witnesses</Text>
      <Box overflowX="auto" marginTop={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Username</Th>
              <Th>DID Key</Th>
              <Th>Enabled</Th>
              <Th>Up To Date</Th>
              <Th>Last Block</Th>
              <Th>Produced</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isWitnessLoading ? (
              <Tr>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
              </Tr>
            ) : ( isWitnessSuccess ?
              witnesses.map((item, i) => (
                <Tr key={i}>
                  <Td>{item.id}</Td>
                  <Td><Link as={ReactRouterLink} to={'/@'+item.username}>{item.username}</Link></Td>
                  <Td sx={{whiteSpace: 'nowrap'}} isTruncated>{item.did}</Td>
                  <Td>{item.enabled ? <Badge colorScheme='green'>True</Badge> : <Badge colorScheme='red'>False</Badge>}</Td>
                  <Td>
                    <Tooltip label={item.git_commit.slice(0,8)}>
                      {item.is_up_to_date ? <Badge colorScheme='green'>True</Badge> : <Badge colorScheme='red'>False</Badge>}
                    </Tooltip>
                  </Td>
                  <Td>{item.last_block ?? 'N/A'}</Td>
                  <Td>{item.produced}</Td>
                </Tr>
              )) : null
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  )
}

export default Witnesses