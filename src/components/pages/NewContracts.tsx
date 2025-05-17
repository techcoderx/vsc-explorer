import { Text, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { abbreviateHash, timeAgo } from '../../helpers'
import { useContracts } from '../../requests'

const NewContracts = () => {
  const { contracts, isLoading } = useContracts({})
  return (
    <>
      <Text fontSize={'5xl'}>Latest Contracts</Text>
      <hr />
      <TableContainer marginTop={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Contract Id</Th>
              <Th>Age</Th>
              <Th>Creator</Th>
              <Th>Creation Tx</Th>
              <Th>Code</Th>
              <Th>Runtime</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                {[...Array(5)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton height="20px" />
                  </Td>
                ))}
              </Tr>
            ) : !!contracts ? (
              contracts.map((item, i) => (
                <Tr key={i}>
                  <Td>
                    <Tooltip label={item.id} placement="top">
                      <Link as={ReactRouterLink} to={'/contract/' + item.id}>
                        {abbreviateHash(item.id, 20, 0)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.creation_ts} placement="top">
                      {timeAgo(item.creation_ts)}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/address/hive:' + item.creator}>
                      {item.creator}
                    </Link>
                  </Td>
                  <Td>
                    <Tooltip label={item.tx_id} placement="top" sx={{ whiteSpace: 'nowrap' }}>
                      <Link as={ReactRouterLink} to={'/tx/' + item.tx_id}>
                        {abbreviateHash(item.tx_id, 15, 0)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={item.code} placement="top">
                      {abbreviateHash(item.code)}
                    </Tooltip>
                  </Td>
                  <Td>{item.runtime}</Td>
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
