import { Text, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { abbreviateHash } from '../../helpers'
import { fetchLatestContracts } from '../../requests'
import { l1Explorer } from '../../settings'

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
      <TableContainer marginTop={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Contract Id</Th>
              <Th>Created In Block</Th>
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
                    <Tooltip label={item.id} placement="top">
                      <Link as={ReactRouterLink} to={'/contract/' + item.id}>
                        {abbreviateHash(item.id)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Link href={l1Explorer + '/b/' + item.creation_height} target="_blank">
                      {item.creation_height}
                    </Link>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/address/hive:' + item.creator}>
                      {item.creator}
                    </Link>
                  </Td>
                  <Td>
                    <Tooltip label={item.tx_id} placement="top" sx={{ whiteSpace: 'nowrap' }}>
                      <Link as={ReactRouterLink} to={'/tx/' + item.tx_id}>
                        {abbreviateHash(item.tx_id, 6, 6)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={item.code} placement="top">
                      {abbreviateHash(item.code)}
                    </Tooltip>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  )
}

export default NewContracts
