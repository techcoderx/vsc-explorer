import { Text, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Skeleton, Link, Tooltip } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchEpoch, fetchProps, fetchWitnessStatMany } from '../../requests'
import { abbreviateHash, fmtmAmount, thousandSeperator } from '../../helpers'

const Witnesses = () => {
  const { data: prop, isLoading: isPropLd } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  const { data: epoch, isLoading } = useQuery({
    queryKey: ['vsc-epoch', prop?.epoch || 0],
    queryFn: async () => fetchEpoch(prop?.epoch || 0),
    enabled: !!prop
  })
  // TODO: sort by weight option
  const members =
    epoch?.members.map((m, i) => {
      return { ...m, weight: epoch.weights[i] }
    }) || []
  const names = members.map((m) => m.account)
  const { data: stats } = useQuery({
    queryKey: ['vsc-witness-stats-many', ...names],
    queryFn: async () => fetchWitnessStatMany(names.join(',')),
    enabled: names.length > 0
  })
  const participation =
    (100 * (epoch?.blocks_info?.total_votes || 0)) / ((epoch?.blocks_info?.count || 1) * (epoch?.total_weight || 1))
  return (
    <>
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
              <Th>Weight</Th>
              <Th>Last Block</Th>
              <Th>Blocks Produced</Th>
              <Th>Last Epoch</Th>
              <Th>Elections</Th>
              <Th>DID Key</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isPropLd || isLoading ? (
              <Tr>
                {[...Array(8)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton h={'20px'} />
                  </Td>
                ))}
              </Tr>
            ) : !!epoch ? (
              members.map((m, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/address/hive:' + m.account}>
                      {m.account}
                    </Link>
                  </Td>
                  <Td>{fmtmAmount(epoch.weights[i], 'HIVE')}</Td>
                  <Td>
                    {!!stats ? (
                      <Link as={ReactRouterLink} to={'/block/' + stats[i].last_block}>
                        {thousandSeperator(stats[i].last_block || 0)}
                      </Link>
                    ) : (
                      <Skeleton h={'20px'} />
                    )}
                  </Td>
                  <Td>{!!stats ? thousandSeperator(stats[i].block_count || 0) : <Skeleton h={'20px'} />}</Td>
                  <Td>
                    {!!stats ? (
                      !!stats[i].last_epoch ? (
                        <Link as={ReactRouterLink} to={'/epoch/' + stats[i].last_epoch}>
                          {thousandSeperator(stats[i].last_epoch)}
                        </Link>
                      ) : (
                        'N/A'
                      )
                    ) : (
                      <Skeleton h={'20px'} />
                    )}
                  </Td>
                  <Td>{!!stats ? thousandSeperator(stats[i].election_count || 0) : <Skeleton h={'20px'} />}</Td>
                  <Td sx={{ whiteSpace: 'nowrap' }} isTruncated>
                    <Tooltip placement="top" label={m.key}>
                      {abbreviateHash(m.key, 20, 0)}
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
