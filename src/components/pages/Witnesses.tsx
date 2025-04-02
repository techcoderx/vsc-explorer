import { Text, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Skeleton, Badge, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchWitnesses } from '../../requests'
import { thousandSeperator } from '../../helpers'
import { l1Explorer } from '../../settings'
// import PageNotFound from './404'
// import Pagination from '../Pagination'

// const count = 50

const Witnesses = () => {
  // const { page } = useParams()
  // const pageNumber = parseInt(page || '1')
  // const invalidParams = isNaN(pageNumber) || pageNumber < 1
  // const { data: prop, isSuccess: isPropSuccess } = useQuery({
  //   queryKey: ['vsc-props'],
  //   queryFn: fetchProps,
  //   enabled: !invalidParams
  // })
  // const id_start = prop ? Math.max((pageNumber - 1) * count + 1, 1) : null
  const {
    data: witnesses,
    isLoading: isWitnessLoading,
    isSuccess: isWitnessSuccess
  } = useQuery({
    queryKey: ['vsc-witnesses', 1],
    queryFn: async () => fetchWitnesses()
  })
  return (
    <>
      <Text fontSize={'5xl'}>Witnesses</Text>
      <hr />
      <br />
      <Text>Total {witnesses ? witnesses.length : 0} witnesses</Text>
      <TableContainer marginTop={'15px'} marginBottom={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Username</Th>
              <Th>Enabled</Th>
              <Th>Last Update</Th>
              <Th>DID Key</Th>
              {/* <Th>Up To Date</Th>
              <Th>Last Block</Th>
              <Th>Produced</Th> */}
            </Tr>
          </Thead>
          <Tbody>
            {isWitnessLoading ? (
              <Tr>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                {/* <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td> */}
              </Tr>
            ) : isWitnessSuccess ? (
              witnesses.map((item, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/@' + item.account}>
                      {item.account}
                    </Link>
                  </Td>
                  <Td>{item.enabled ? <Badge colorScheme="green">True</Badge> : <Badge colorScheme="red">False</Badge>}</Td>
                  <Td>
                    <Link as={ReactRouterLink} to={l1Explorer + '/b/' + item.height} target="_blank">
                      {thousandSeperator(item.height)}
                    </Link>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }} isTruncated>
                    {item.did_keys[0].key}
                  </Td>
                  {/* <Td>
                    <Tooltip label={item.git_commit.slice(0, 8)}>
                      {item.is_up_to_date ? <Badge colorScheme="green">True</Badge> : <Badge colorScheme="red">False</Badge>}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={item.last_block ? '/block/' + item.last_block : '#'}>
                      {item.last_block ?? 'N/A'}
                    </Link>
                  </Td>
                  <Td>{item.produced}</Td> */}
                </Tr>
              ))
            ) : null}
          </Tbody>
        </Table>
      </TableContainer>
      {/* {isPropSuccess && isWitnessSuccess ? (
        <Pagination path={'/witnesses'} currentPageNum={pageNumber} maxPageNum={Math.ceil(prop.witnesses / count)} />
      ) : null} */}
    </>
  )
}

export default Witnesses
