import {
  Link,
  Text,
  Box,
  Grid,
  GridItem,
  Stack,
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Skeleton,
  Tooltip
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import PageNotFound from './404'
import { fetchBlocksInEpoch, fetchEpoch } from '../../requests'
import { PrevNextBtns } from '../Pagination'
import {
  abbreviateHash,
  getVotedMembers,
  getBitsetStrFromHex,
  getPercentFromBitsetStr,
  thousandSeperator,
  timeAgo
} from '../../helpers'
import TableRow from '../TableRow'
import { ProgressBarPct } from '../ProgressPercent'
import { l1Explorer, themeColorScheme } from '../../settings'
import { ParticipatedMembers } from '../BlsAggMembers'

const Epoch = () => {
  const { epochNum } = useParams()
  const epchNum = parseInt(epochNum!)
  const invalidEpochNum = isNaN(epchNum) || epchNum < 0
  const {
    data: epoch,
    isLoading: isEpochLoading,
    isError: isEpochError
  } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-epoch', epchNum],
    queryFn: async () => fetchEpoch(epchNum),
    enabled: !invalidEpochNum
  })
  const {
    data: blocks,
    isLoading: isBlocksLoading,
    isError: isBlocksError
  } = useQuery({
    cacheTime: 60000,
    queryKey: ['vsc-block-in-epoch', epchNum, 0, 200],
    queryFn: async () => fetchBlocksInEpoch(epchNum),
    enabled: !invalidEpochNum
  })
  const blockCount = (blocks && blocks.length) ?? 0
  const votedMembers = getVotedMembers((epoch && epoch.bv) ?? '0', (epoch && epoch.members_at_start) ?? [])
  if (invalidEpochNum) return <PageNotFound />
  return (
    <>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize="5xl">Epoch #{thousandSeperator(epchNum)}</Text>
        <PrevNextBtns toPrev={epchNum > 0 ? '/epoch/' + (epchNum! - 1) : undefined} toNext={'/epoch/' + (epchNum! + 1)} />
      </Stack>
      <hr />
      {isEpochError || epoch?.error ? (
        <Text>Failed to load epoch, error: {epoch ? epoch.error : 'Failed to fetch from HAF node'}</Text>
      ) : (
        <Box>
          <Table mt={'20px'}>
            <Tbody>
              <TableRow label="Epoch Number" value={epochNum} isLoading={isEpochLoading} />
              <TableRow
                label="Timestamp"
                value={epoch ? epoch.ts + ' (' + timeAgo(epoch.ts) + ')' : ''}
                isLoading={isEpochLoading}
              />
              <TableRow label="L1 Tx" value={epoch?.l1_tx} isLoading={isEpochLoading} link={'/tx/' + epoch?.l1_tx} />
              <TableRow
                label="L1 Block"
                value={epoch?.l1_block_num}
                isLoading={isEpochLoading}
                link={l1Explorer + '/b/' + epoch?.l1_block_num}
              />
              <TableRow label="Proposer" value={epoch?.proposer} isLoading={isEpochLoading} link={'/@' + epoch?.proposer} />
              <TableRow label="Election Data CID" value={epoch?.data_cid} isLoading={isEpochLoading} />
              <TableRow label="Participation">
                <ProgressBarPct fontSize={'md'} val={getPercentFromBitsetStr(getBitsetStrFromHex((epoch && epoch.bv) ?? '0'))} />
              </TableRow>
              <TableRow label={`Elected Members (${epoch?.election.length})`} isLoading={isEpochLoading}>
                <Grid
                  templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
                  gap={3}
                >
                  {epoch?.election.map((m, i) => {
                    return (
                      <GridItem key={i}>
                        <Link as={ReactRouterLink} to={'/@' + m}>
                          {m}
                        </Link>
                      </GridItem>
                    )
                  })}
                </Grid>
              </TableRow>
            </Tbody>
          </Table>
          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'enclosed'}>
            <TabList>
              <Tab>Blocks ({blockCount})</Tab>
              <Tab>Participating Members ({votedMembers.length})</Tab>
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel>
                {isBlocksLoading ? (
                  <Skeleton height={'20px'} />
                ) : isBlocksError || !Array.isArray(blocks) ? (
                  <Text>Failed to load blocks in epoch</Text>
                ) : (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Id</Th>
                        <Th>Age</Th>
                        <Th>Proposer</Th>
                        <Th>Txs</Th>
                        <Th>Block Hash</Th>
                        <Th>Voted</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {blocks.map((item, i) => (
                        <Tr key={i}>
                          <Td>
                            <Link as={ReactRouterLink} to={'/block/' + item.id}>
                              {item.id}
                            </Link>
                          </Td>
                          <Td sx={{ whiteSpace: 'nowrap' }}>
                            <Tooltip label={item.ts} placement="top">
                              {timeAgo(item.ts)}
                            </Tooltip>
                          </Td>
                          <Td>
                            <Link as={ReactRouterLink} to={'/@' + item.proposer}>
                              {item.proposer}
                            </Link>
                          </Td>
                          <Td>{item.txs}</Td>
                          <Td>
                            <Link as={ReactRouterLink} to={'/block-by-hash/' + item.block_hash}>
                              {abbreviateHash(item.block_hash)}
                            </Link>
                          </Td>
                          <Td maxW={'200px'}>
                            <ProgressBarPct val={getPercentFromBitsetStr(getBitsetStrFromHex(item.bv))} />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </TabPanel>
              <TabPanel>
                <ParticipatedMembers
                  bvHex={(epoch && epoch.bv) ?? '0'}
                  sig={(epoch && epoch.sig) ?? ''}
                  members={votedMembers}
                  isLoading={isEpochLoading}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </>
  )
}

export default Epoch
