import { Box, Card, Heading, Link, Stack, Stat, Table, Text, VStack } from '@chakra-ui/react'
import { Tooltip } from '../../ui/tooltip'
import { CheckXIcon } from '../../CheckXIcon'
import { ReactNode, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useOutletContext, Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import TableRow from '../../TableRow'
import { timeAgo, thousandSeperator } from '../../../helpers'
import { fetchBlocksByProposer, fetchWitnessStat, getWitness } from '../../../requests'
import { WitnessStat } from '../../../types/HafApiResult'
import { Witness } from '../../../types/L2ApiResult'
import { Blocks } from '../../tables/Blocks'

export const StatCard = ({ label, children }: { label: string; children?: ReactNode }) => {
  return (
    <Card.Root minW={'48'} flex={1}>
      <Card.Body>
        <Stat.Root>
          <Stat.Label>{label}</Stat.Label>
          <Stat.ValueText>{children}</Stat.ValueText>
        </Stat.Root>
      </Card.Body>
    </Card.Root>
  )
}

export const WitnessInfo = ({ witness, stats }: { witness?: Witness; stats?: WitnessStat }) => {
  const { t } = useTranslation('pages')
  const [expMeta, setExpMeta] = useState(false)
  return !!witness ? (
    <VStack width={'full'} gap={'1'}>
      {!!stats && (
        <Stack gap={'3'} direction={'row'} w={'full'} overflowX={'scroll'}>
          <StatCard label={t('witness.enabled')}>
            <Box css={{ '& > *': { fontSize: '2rem !important' } }}>
              <CheckXIcon ok={witness.enabled} />
            </Box>
          </StatCard>
          <StatCard label={t('witness.lastBlock')}>
            <Link asChild>
              <ReactRouterLink to={'/block/' + stats.last_block}>
                {stats.last_block ? thousandSeperator(stats.last_block) : t('na', { ns: 'common' })}
              </ReactRouterLink>
            </Link>
          </StatCard>
          <StatCard label={t('witness.blocksProduced')}>{thousandSeperator(stats?.block_count || 0)}</StatCard>
          <StatCard label={t('witness.lastEpoch')}>
            <Link asChild>
              <ReactRouterLink to={'/epoch/' + stats.last_epoch}>
                {stats.last_epoch ? thousandSeperator(stats.last_epoch) : t('na', { ns: 'common' })}
              </ReactRouterLink>
            </Link>
          </StatCard>
          <StatCard label={t('witness.electionsHeld')}>{thousandSeperator(stats.election_count || 0)}</StatCard>
        </Stack>
      )}
      <Card.Root width={'100%'} mt={'15px'}>
        <Card.Header pt={'4'} pb={'4'} onClick={() => setExpMeta((v) => !v)} cursor={'pointer'}>
          <Heading size={'md'}>{t('witness.witnessInfo')}{!expMeta ? ' ' + t('witness.clickToExpand') : ''}</Heading>
        </Card.Header>
        {expMeta && (
          <Card.Body pt={'0'}>
            <Table.ScrollArea>
              <Table.Root>
                <Table.Body>
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label={t('witness.peerId')} value={witness.peer_id} />
                  <TableRow
                    isInCard
                    minimalSpace
                    minWidthLabel="115px"
                    label={t('witness.consensusDidKey')}
                    value={witness.did_keys.find((k) => k.t === 'consensus')?.key}
                  />
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label={t('witness.gatewayKey')} value={witness.gateway_key} />
                  <TableRow
                    isInCard
                    minimalSpace
                    minWidthLabel="115px"
                    label={t('witness.gitCommit')}
                    value={witness.git_commit}
                    link={'https://github.com/vsc-eco/go-vsc-node/commit/' + witness.git_commit}
                  />
                  <TableRow isInCard minimalSpace minWidthLabel="115px" label={t('witness.lastUpdate')}>
                    <Tooltip positioning={{ placement: 'top' }} content={witness.ts}>
                      <Link asChild wordBreak={'break-all'}>
                        <ReactRouterLink to={'/tx/' + witness.tx_id}>{timeAgo(witness.ts)}</ReactRouterLink>
                      </Link>
                    </Tooltip>
                  </TableRow>
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Card.Body>
        )}
      </Card.Root>
    </VStack>
  ) : (
    <Text>{t('witness.loadError')}</Text>
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
