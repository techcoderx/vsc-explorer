import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Flex, Grid, Heading, Link, SimpleGrid, Skeleton, Stack, Table, Text, VStack } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  LuBlocks,
  LuArrowLeftRight,
  LuFileCode,
  LuUsers,
  LuVote,
  LuLandmark,
  LuChartNoAxesCombined,
  LuRadio,
  LuArrowRight
} from 'react-icons/lu'
import type Recharts from 'recharts'
import { fetchProps, fetchBlocks, fetchL2TxnsBy, fetchEpoch, useNetworkStats, useContracts } from '../../requests'
import { thousandSeperator, timeAgo, fmtmAmount } from '../../helpers'
import { themeColor } from '../../settings'
import { useColorMode } from '../ui/color-mode'
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter'
import { Blocks } from '../tables/Blocks'
import { Txns } from '../tables/Transactions'
import { AccountLink, ContractLink } from '../TableLink'
import { Tooltip } from '../ui/tooltip'
import SearchBar from '../SearchBar'

const AnimatedStat = ({ title, value, isLoading }: { title: string; value?: number; isLoading: boolean }) => {
  const animated = useAnimatedCounter(value ?? 0)
  return (
    <Card.Root>
      <Card.Body textAlign="center" py="4" px="3">
        <Text fontSize="sm" fontWeight="medium" opacity={0.7} mb="1">
          {title}
        </Text>
        {isLoading ? (
          <Skeleton height="28px" mx="auto" maxW="120px" />
        ) : (
          <Text fontSize="2xl" fontWeight="bold">
            {thousandSeperator(animated)}
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  )
}

const ActivityChart = () => {
  const { colorMode } = useColorMode()
  const [recharts, setRecharts] = useState<typeof Recharts>()
  const networkStats = useNetworkStats()
  const chartData = networkStats.slice(-14)

  useEffect(() => {
    import('recharts').then((module) => setRecharts(module))
  }, [])

  if (!recharts) return <Skeleton height="200px" />

  const { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip: RTooltip } = recharts
  return (
    <Card.Root>
      <Card.Header pb="2">
        <Heading fontSize="lg">Network Activity</Heading>
        <Text fontSize="sm" opacity={0.7}>
          Daily transactions (last 14 days)
        </Text>
      </Card.Header>
      <Card.Body pt="0">
        <Box h="200px">
          <ResponsiveContainer width="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" minTickGap={60} fontSize={12} />
              <YAxis tickFormatter={(val) => thousandSeperator(val)} fontSize={12} width={60} />
              <RTooltip
                formatter={(value: number) => [thousandSeperator(value), 'Transactions']}
                labelFormatter={(date: string) => `Date: ${date}`}
                contentStyle={{
                  backgroundColor: 'var(--magi-tooltip)',
                  color: colorMode === 'dark' ? '#fff' : '#000',
                  border: '1px solid #333'
                }}
              />
              <Area type="monotone" dataKey="txs" stroke="#ED64A6" fill="#ED64A6" fillOpacity={0.3} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}

const LatestContracts = () => {
  const { contracts, isLoading } = useContracts({})
  const displayed = contracts?.slice(0, 5)
  return (
    <Card.Root h="100%">
      <Card.Header pb="2">
        <Heading fontSize="lg">Latest Contracts</Heading>
      </Card.Header>
      <Card.Body pt="0">
        <Table.ScrollArea>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Contract Id</Table.ColumnHeader>
                <Table.ColumnHeader>Age</Table.ColumnHeader>
                <Table.ColumnHeader>Creator</Table.ColumnHeader>
                <Table.ColumnHeader>Runtime</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  {[...Array(4)].map((_, i) => (
                    <Table.Cell key={i}>
                      <Skeleton height="20px" />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ) : displayed ? (
                displayed.map((item, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <ContractLink val={item.id} truncate={20} />
                    </Table.Cell>
                    <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                      <Tooltip content={item.creation_ts} positioning={{ placement: 'top' }}>
                        {timeAgo(item.creation_ts)}
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell>
                      <AccountLink val={item.creator} />
                    </Table.Cell>
                    <Table.Cell>{item.runtime}</Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row></Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Card.Body>
      <Card.Footer pt="0">
        <Link asChild color={themeColor} fontSize="sm" fontWeight="medium">
          <ReactRouterLink to="/contracts">
            View All Contracts <LuArrowRight />
          </ReactRouterLink>
        </Link>
      </Card.Footer>
    </Card.Root>
  )
}

const EPOCH_HIVE_BLOCKS = 7200
const HIVE_BLOCK_SECONDS = 3

const formatCountdown = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return 'any moment now'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

const useEpochCountdown = (epochStartBlock?: number, currentBlock?: number) => {
  const initialSeconds = useMemo(() => {
    if (!epochStartBlock || !currentBlock) return null
    const blocksRemaining = EPOCH_HIVE_BLOCKS - (currentBlock - epochStartBlock)
    return Math.max(0, blocksRemaining * HIVE_BLOCK_SECONDS)
  }, [epochStartBlock, currentBlock])

  const [seconds, setSeconds] = useState<number | null>(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (seconds === null || seconds <= 0) return
    const id = setInterval(() => {
      setSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [seconds !== null && seconds > 0])

  return seconds
}

const quickLinks = [
  { label: 'Blocks', href: '/blocks', icon: LuBlocks },
  { label: 'Transactions', href: '/transactions', icon: LuArrowLeftRight },
  { label: 'Contracts', href: '/contracts', icon: LuFileCode },
  { label: 'Witnesses', href: '/witnesses', icon: LuUsers },
  { label: 'Elections', href: '/elections', icon: LuVote },
  { label: 'NAM Bridge', href: '/bridge/hive', icon: LuLandmark },
  { label: 'Charts', href: '/charts', icon: LuChartNoAxesCombined },
  { label: 'Broadcast', href: '/tools/broadcast', icon: LuRadio }
]

const QuickLinks = () => (
  <Card.Root h="100%">
    <Card.Header pb="2">
      <Heading fontSize="lg">Quick Links</Heading>
    </Card.Header>
    <Card.Body pt="0">
      <Grid templateColumns="repeat(2, 1fr)" gap="3">
        {quickLinks.map((link) => (
          <Card.Root
            asChild
            key={link.href}
            size="sm"
            _hover={{ borderColor: themeColor, borderWidth: '0.5px' }}
            _light={{ _hover: { borderWidth: '1px' } }}
          >
            <ReactRouterLink to={link.href}>
              <Card.Body>
                <Flex align="center" gap="3">
                  <link.icon size={18} />
                  <Text fontWeight="medium" fontSize="sm">
                    {link.label}
                  </Text>
                </Flex>
              </Card.Body>
            </ReactRouterLink>
          </Card.Root>
        ))}
      </Grid>
    </Card.Body>
  </Card.Root>
)

const Home = () => {
  const { data: prop, isLoading: isPropLoading } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    refetchInterval: 6000
  })

  const { data: epoch } = useQuery({
    queryKey: ['home-epoch'],
    queryFn: () => fetchEpoch(prop!.epoch),
    enabled: !!prop?.epoch,
    refetchInterval: 6000
  })

  const { data: blocks, isLoading: isBlocksLoading } = useQuery({
    queryKey: ['home-recent-blocks'],
    queryFn: () => fetchBlocks(prop!.l2_block_height, 10),
    enabled: !!prop?.l2_block_height,
    refetchInterval: 6000
  })

  const { data: txnData, isLoading: isTxnLoading } = useQuery({
    queryKey: ['home-recent-txns'],
    queryFn: () => fetchL2TxnsBy(0, 10),
    refetchInterval: 6000
  })

  const epochCountdown = useEpochCountdown(epoch?.block_height, prop?.last_processed_block)

  return (
    <VStack gap="6" align="stretch">
      {/* Hero Search */}
      <Box bg="var(--magi-surface)" borderRadius="xl" py={{ base: 8, md: 12 }} px="4" textAlign="center">
        <Heading size={{ base: '2xl', md: '4xl' }} mb="2">
          Magi Block Explorer
        </Heading>
        <Text opacity={0.7} mb="6">
          Search accounts, blocks, transactions, and contracts
        </Text>
        <Box maxW="600px" mx="auto">
          <SearchBar />
        </Box>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap="3">
        <AnimatedStat title="Hive Block Height" value={prop?.last_processed_block} isLoading={isPropLoading} />
        <AnimatedStat title="Magi Block Height" value={prop?.l2_block_height} isLoading={isPropLoading} />
        <AnimatedStat title="Transactions" value={prop?.transactions} isLoading={isPropLoading} />
        <AnimatedStat title="Current Epoch" value={prop?.epoch} isLoading={isPropLoading} />
        <AnimatedStat title="Witnesses" value={prop?.witnesses} isLoading={isPropLoading} />
        <AnimatedStat title="Contracts" value={prop?.contracts} isLoading={isPropLoading} />
      </SimpleGrid>

      {/* Epoch Info */}
      {epoch && (
        <Card.Root>
          <Card.Body py="3">
            <Flex align="center" justify="center" gap="2" flexWrap="wrap">
              <Link asChild color={themeColor} fontWeight="medium">
                <ReactRouterLink to={`/epoch/${epoch.epoch}`}>Epoch {epoch.epoch}</ReactRouterLink>
              </Link>
              <Text opacity={0.5}>|</Text>
              <Text>{fmtmAmount(epoch.total_weight, 'HIVE')} total stake</Text>
              {epochCountdown !== null && (
                <>
                  <Text opacity={0.5}>|</Text>
                  <Text>Next epoch in ~{formatCountdown(epochCountdown)}</Text>
                </>
              )}
            </Flex>
          </Card.Body>
        </Card.Root>
      )}

      {/* Network Activity Chart */}
      <ActivityChart />

      {/* Recent Blocks & Transactions */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Card.Root>
          <Card.Header pb="2">
            <Heading fontSize="lg">Recent Blocks</Heading>
          </Card.Header>
          <Card.Body pt="0">
            <Blocks blocks={blocks} isLoading={isBlocksLoading} />
          </Card.Body>
          <Card.Footer pt="0">
            <Link asChild color={themeColor} fontSize="sm" fontWeight="medium">
              <ReactRouterLink to="/blocks">
                View All Blocks <LuArrowRight />
              </ReactRouterLink>
            </Link>
          </Card.Footer>
        </Card.Root>

        <Card.Root>
          <Card.Header pb="2">
            <Heading fontSize="lg">Recent Transactions</Heading>
          </Card.Header>
          <Card.Body pt="0">
            {isTxnLoading ? (
              <Stack gap="3" my="3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} height="20px" />
                ))}
              </Stack>
            ) : (
              <Txns txs={txnData?.txns ?? []} />
            )}
          </Card.Body>
          <Card.Footer pt="0">
            <Link asChild color={themeColor} fontSize="sm" fontWeight="medium">
              <ReactRouterLink to="/transactions">
                View All Transactions <LuArrowRight />
              </ReactRouterLink>
            </Link>
          </Card.Footer>
        </Card.Root>
      </SimpleGrid>

      {/* Latest Contracts & Quick Links */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <LatestContracts />
        <QuickLinks />
      </SimpleGrid>
    </VStack>
  )
}

export default Home
