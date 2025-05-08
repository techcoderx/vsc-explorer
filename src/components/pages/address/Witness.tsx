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
import { fetchWitness, fetchWitnessStat } from '../../../requests'
import { Witness, WitnessStat } from '../../../types/HafApiResult'

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
  return !!witness && !witness.error ? (
    <VStack width={'full'} spacing={'1'} mt={'3'}>
      {!!stats && (
        <Stack spacing={'3'} direction={'row'} w={'full'} overflow={'scroll'}>
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
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label="ID" value={witness.id} />
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label="Peer ID" value={witness.peer_id} />
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label="Consensus DID Key" value={witness.consensus_did} />
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
                    <Tooltip placement="top" label={witness.last_update_ts}>
                      <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/' + witness.last_update_tx}>
                        {timeAgo(witness.last_update_ts)}
                      </Link>
                    </Tooltip>
                  </TableRow>
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label="First Seen">
                    <Tooltip placement="top" label={witness.first_seen_ts}>
                      <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/' + witness.first_seen_tx}>
                        {timeAgo(witness.first_seen_ts)}
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
  ) : !!witness && witness.error ? (
    <Text>{witness.error}</Text>
  ) : null
}

export const AddressWitness = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const user = addr!.replace('hive:', '')
  const { data: witness } = useQuery({
    queryKey: ['vsc-witness', user],
    queryFn: async () => fetchWitness(user)
  })
  const { data: witnessStats } = useQuery({
    queryKey: ['vsc-witness-stats', user],
    queryFn: async () => fetchWitnessStat(user)
  })
  return <WitnessInfo witness={witness} stats={witnessStats} />
}
