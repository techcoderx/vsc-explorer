import { Text, Table, Thead, Tbody, Tr, Th, Td, Box, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { abbreviateHash, timeAgo } from '../../helpers'
import { fetchLatestContracts } from '../../requests'
import { ipfsGw } from '../../settings'

const NewContracts = () => {
  const {
    data: contracts,
    isLoading: isContractsLoading,
    isSuccess: isContractsSuccess
  } = useQuery({
    queryKey: ['vsc-latest-contracts'],
    queryFn: fetchLatestContracts
  })
  return (
    <>
      <Text fontSize={'5xl'}>Latest Contracts</Text>
      <hr />
      <Box overflowX="auto" marginTop={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Contract Id</Th>
              <Th>Age</Th>
              <Th>Creator</Th>
              <Th>Created In Tx</Th>
              <Th>Code</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isContractsLoading ? (
              <Tr>
                {[...Array(5)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton height="20px" />
                  </Td>
                ))}
              </Tr>
            ) : isContractsSuccess ? (
              contracts.map((item, i) => (
                <Tr key={i}>
                  <Td>
                    <Tooltip label={item.contract_id} placement="top">
                      <Link as={ReactRouterLink} to={'/contract/' + item.contract_id}>
                        {abbreviateHash(item.contract_id)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.created_at} placement="top">
                      {timeAgo(item.created_at)}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/@' + item.creator}>
                      {item.creator}
                    </Link>
                  </Td>
                  <Td>
                    <Tooltip label={item.created_in_op} placement="top" sx={{ whiteSpace: 'nowrap' }}>
                      <Link as={ReactRouterLink} to={'/tx/' + item.created_in_op}>
                        {abbreviateHash(item.created_in_op, 6, 6)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={item.code} placement="top">
                      <Link href={ipfsGw + '/ipfs/' + item.code} target="_blank">
                        {abbreviateHash(item.code)}
                      </Link>
                    </Tooltip>
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

export default NewContracts
