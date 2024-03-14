import { Text, Table, Thead, Tbody, Tr, Th, Td, Box, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { timeAgo } from '../../helpers'
import { fetchLatestContracts } from '../../requests'
import { ipfsGw } from '../../settings'

const NewContracts = () => {
  const { data: contracts, isLoading: isContractsLoading, isSuccess: isContractsSuccess } = useQuery({
    cacheTime: 9000,
    queryKey: ['vsc-latest-contracts'],
    queryFn: fetchLatestContracts
  })
  return (
    <>
      <Text fontSize={'5xl'}>Latest Contracts</Text>
      <hr/>
      <Box overflowX="auto" marginTop={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Contract Id</Th>
              <Th>Age</Th>
              <Th>Created In Tx</Th>
              <Th>Code</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isContractsLoading ? (
              <Tr>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
              </Tr>
            ) : ( isContractsSuccess ?
              contracts.map((item, i) => (
                <Tr key={i}>
                  <Td>{item.contract_id}</Td>
                  <Td sx={{whiteSpace: 'nowrap'}}>
                    <Tooltip label={item.created_at} placement='top'>
                      {timeAgo(item.created_at)}
                    </Tooltip>
                  </Td>
                  <Td><Link as={ReactRouterLink} to={'/tx/'+item.created_in_op}>{item.created_in_op}</Link></Td>
                  <Td>
                    <Tooltip label={item.code} placement='top'>
                      <Link href={ipfsGw+'/ipfs/'+item.code} target='_blank'>{item.code.substring(0,15)+'...'}</Link>
                    </Tooltip>
                  </Td>
                </Tr>
              )) : <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  )
}

export default NewContracts