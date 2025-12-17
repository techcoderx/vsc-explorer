import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Text,
  Tooltip,
  VStack
} from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useOutletContext, Link as ReactRouterLink } from 'react-router'
import TableRow from '../../TableRow'
import { timeAgo, thousandSeperator } from '../../../helpers'
import { fetchBlocksByProposer, fetchWitnessStat, getWitness } from '../../../requests'
import { WitnessStat } from '../../../types/HafApiResult'
import { Witness } from '../../../types/L2ApiResult'
import { Blocks } from '../../tables/Blocks'

export const StatCard = ({ label, children }: { label: string; children?: ReactNode }) => {
  return (
    <Card minW={'48'} flex={1}>
      <CardBody>
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber>{children}</StatNumber>
        </Stat>
      </CardBody>
    </Card>
  )
}

export const WitnessInfo = ({ witness, stats }: { witness?: Witness; stats?: WitnessStat }) => {
  const [expMeta, setExpMeta] = useState(false)
  return !!witness ? (
    <VStack width={'full'} spacing={'1'}>
      {!!stats && (
        <Stack spacing={'3'} direction={'row'} w={'full'} overflowX={'scroll'}>
          <StatCard label="Enabled">
            <Badge colorScheme={witness.enabled ? 'green' : 'red'} fontSize={'18'}>
              {witness.enabled.toString()}
            </Badge>
          </StatCard>
          <StatCard label="Last Block">
            <Link as={ReactRouterLink} to={'/block/' + stats.last_block}>
              {stats.last_block ? thousandSeperator(stats.last_block) : 'N/A'}
            </Link>
          </StatCard>
          <StatCard label="Blocks Produced">{thousandSeperator(stats?.block_count || 0)}</StatCard>
          <StatCard label="Last Epoch">
            <Link as={ReactRouterLink} to={'/epoch/' + stats.last_epoch}>
              {stats.last_epoch ? thousandSeperator(stats.last_epoch) : 'N/A'}
            </Link>
          </StatCard>
          <StatCard label="Elections Held">{thousandSeperator(stats.election_count || 0)}</StatCard>
        </Stack>
      )}
      <Card width={'100%'} mt={'15px'}>
        <CardHeader onClick={() => setExpMeta((v) => !v)} cursor={'pointer'}>
          <Heading size={'md'}>Witness Info{!expMeta ? ' (Click to expand)' : ''}</Heading>
        </CardHeader>
        {expMeta && (
          <CardBody pt={'0'}>
            <TableContainer>
              <Table variant={'unstyled'}>
                <Tbody>
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label="Peer ID" value={witness.peer_id} />
                  <TableRow
                    isInCard
                    minimalSpace
                    minWidthLabel="115px"
                    label="Consensus DID Key"
                    value={witness.did_keys.find((k) => k.t === 'consensus')?.key}
                  />
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label="Gateway Key" value={witness.gateway_key} />
                  <TableRow
                    isInCard
                    minimalSpace
                    minWidthLabel="115px"
                    label="Git Commit"
                    value={witness.git_commit}
                    link={'https://github.com/vsc-eco/go-vsc-node/commit/' + witness.git_commit}
                  />
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label="Last Update">
                    <Tooltip placement="top" label={witness.ts}>
                      <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/' + witness.tx_id}>
                        {timeAgo(witness.ts)}
                      </Link>
                    </Tooltip>
                  </TableRow>
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        )}
      </Card>
    </VStack>
  ) : (
    <Text>Failed to load witness info</Text>
  )
}

export const AddressWitness = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const user = addr!.replace('hive:', '')
  const { data: witness } = useQuery({
    queryKey: ['vsc-witness', user],
    queryFn: async () => getWitness(user)
  })
  const { data: witnessStats } = useQuery({
    queryKey: ['vsc-witness-stats', user],
    queryFn: async () => fetchWitnessStat(user)
  })
  const { data: blocks, isLoading: isBlocksLoading } = useQuery({
    queryKey: ['vsc-blocks-by-proposer', user, 100],
    queryFn: async () => fetchBlocksByProposer(user, 100)
  })
  return (
    <VStack w={'full'} mt={'3'} gap={'3'}>
      <WitnessInfo witness={witness} stats={witnessStats} />
      <Blocks blocks={blocks} isLoading={isBlocksLoading} />
    </VStack>
  )
}
