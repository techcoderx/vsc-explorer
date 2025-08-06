import { Text, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Skeleton, Link, Tooltip, HStack, Box } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { FaAngleDown, FaAngleUp, FaArrowsUpDown } from 'react-icons/fa6'
import { fetchEpoch, fetchWitnessesStats } from '../../requests'
import { abbreviateHash, fmtmAmount, thousandSeperator } from '../../helpers'
import { useMemo, useState } from 'react'
import { PageTitle } from '../PageTitle'

const Witnesses = () => {
  const [sort, setSort] = useState<string>('')
  const { data: epoch } = useQuery({
    queryKey: ['vsc-epoch', -1],
    queryFn: async () => fetchEpoch(-1)
  })
  const participation =
    (100 * (epoch?.blocks_info?.total_votes || 0)) / ((epoch?.blocks_info?.count || 1) * (epoch?.total_weight || 1))
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vsc-witnesses-stats'],
    queryFn: async () => fetchWitnessesStats()
  })
  const statsUnsorted = useMemo(() => stats?.filter(() => true), [stats])
  const statsSorted = useMemo(() => {
    if (sort === 'weight') {
      return (stats || []).sort((a, b) => b.weight - a.weight)
    } else if (sort === 'weight_asc') {
      return (stats || []).sort((a, b) => a.weight - b.weight)
    } else {
      return statsUnsorted
    }
  }, [stats, sort])
  return (
    <>
      <PageTitle title="Witnesses" />
      <Text fontSize={'5xl'}>Witnesses</Text>
      <hr />
      <br />
      <Text>
        Total {epoch ? epoch.members.length : 0} active witnesses. Participation rate: {participation.toFixed(2)}%
      </Text>
      <TableContainer my={'3'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Idx</Th>
              <Th>Username</Th>
              <Th
                cursor={'pointer'}
                onClick={() => {
                  setSort((prev) => (prev === 'weight_asc' ? '' : prev === 'weight' ? 'weight_asc' : 'weight'))
                }}
              >
                <HStack>
                  <Box>Weight</Box>
                  {sort === 'weight' ? <FaAngleDown /> : sort === 'weight_asc' ? <FaAngleUp /> : <FaArrowsUpDown />}
                </HStack>
              </Th>
              <Th>Last Block</Th>
              <Th>Blocks Produced</Th>
              <Th>Last Epoch</Th>
              <Th>Elections</Th>
              <Th>DID Key</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                {[...Array(8)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton h={'20px'} />
                  </Td>
                ))}
              </Tr>
            ) : !!statsSorted ? (
              statsSorted.map((m, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/address/hive:' + m._id}>
                      {m._id}
                    </Link>
                  </Td>
                  <Td>{fmtmAmount(m.weight, 'HIVE')}</Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/block/' + m.last_block}>
                      {thousandSeperator(m.last_block || 0)}
                    </Link>
                  </Td>
                  <Td>{thousandSeperator(m.block_count || 0)}</Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/epoch/' + m.last_epoch}>
                      {thousandSeperator(m.last_epoch)}
                    </Link>
                  </Td>
                  <Td>{thousandSeperator(m.election_count || 0)}</Td>
                  <Td sx={{ whiteSpace: 'nowrap' }} isTruncated>
                    <Tooltip placement="top" label={m.did_key}>
                      {abbreviateHash(m.did_key, 20, 0)}
                    </Tooltip>
                  </Td>
                </Tr>
              ))
            ) : null}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  )
}

export default Witnesses
