import { Text, Table, Skeleton, Link, HStack, Box } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { FaAngleDown, FaAngleUp, FaArrowsUpDown } from 'react-icons/fa6'
import { fetchEpoch, fetchWitnessesStats } from '../../requests'
import { abbreviateHash, fmtmAmount, thousandSeperator } from '../../helpers'
import { useMemo, useState } from 'react'
import { PageTitle } from '../PageTitle'
import { Tooltip } from '../ui/tooltip'

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
  }, [stats, sort, statsUnsorted])
  return (
    <>
      <PageTitle title="Witnesses" />
      <Text fontSize={'5xl'}>Witnesses</Text>
      <hr />
      <br />
      <Text>
        Total {epoch ? epoch.members.length : 0} active witnesses. Participation rate: {participation.toFixed(2)}%
      </Text>
      <Table.ScrollArea my={'3'}>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Idx</Table.ColumnHeader>
              <Table.ColumnHeader>Username</Table.ColumnHeader>
              <Table.ColumnHeader
                cursor={'pointer'}
                onClick={() => {
                  setSort((prev) => (prev === 'weight_asc' ? '' : prev === 'weight' ? 'weight_asc' : 'weight'))
                }}
              >
                <HStack>
                  <Box>Weight</Box>
                  {sort === 'weight' ? <FaAngleDown /> : sort === 'weight_asc' ? <FaAngleUp /> : <FaArrowsUpDown />}
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader>Last Block</Table.ColumnHeader>
              <Table.ColumnHeader>Blocks Produced</Table.ColumnHeader>
              <Table.ColumnHeader>Last Epoch</Table.ColumnHeader>
              <Table.ColumnHeader>Elections</Table.ColumnHeader>
              <Table.ColumnHeader>DID Key</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                {[...Array(8)].map((_, i) => (
                  <Table.Cell key={i}>
                    <Skeleton h={'20px'} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ) : !!statsSorted ? (
              statsSorted.map((m, i) => (
                <Table.Row key={i}>
                  <Table.Cell>{i + 1}</Table.Cell>
                  <Table.Cell>
                    <Link asChild>
                      <ReactRouterLink to={'/address/hive:' + m._id}>{m._id}</ReactRouterLink>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{fmtmAmount(m.weight, 'HIVE')}</Table.Cell>
                  <Table.Cell>
                    {m.last_block ? (
                      <Link asChild>
                        <ReactRouterLink to={'/block/' + m.last_block}>{thousandSeperator(m.last_block || 0)}</ReactRouterLink>
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </Table.Cell>
                  <Table.Cell>{thousandSeperator(m.block_count || 0)}</Table.Cell>
                  <Table.Cell>
                    {m.last_epoch ? (
                      <Link asChild>
                        <ReactRouterLink to={'/epoch/' + m.last_epoch}>{thousandSeperator(m.last_epoch)}</ReactRouterLink>
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </Table.Cell>
                  <Table.Cell>{thousandSeperator(m.election_count || 0)}</Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }} truncate>
                    <Tooltip positioning={{ placement: 'top' }} content={m.did_key}>
                      {abbreviateHash(m.did_key, 20, 0)}
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : null}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}

export default Witnesses
