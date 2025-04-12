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
  Tooltip,
  TableContainer,
  Flex
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router'
import PageNotFound from './404'
import { fetchBlocksInEpoch, fetchEpoch } from '../../requests'
import { PrevNextBtns } from '../Pagination'
import { abbreviateHash, base64UrlToHex, getVotedMembers, thousandSeperator, timeAgo } from '../../helpers'
import TableRow from '../TableRow'
import { ProgressBarPct } from '../ProgressPercent'
import { l1Explorer, themeColorScheme } from '../../settings'
import { ParticipatedMembers } from '../BlsAggMembers'
import { InfoIcon } from '@chakra-ui/icons'

const Epoch = () => {
  const { epochNum } = useParams()
  const epchNum = parseInt(epochNum!)
  const invalidEpochNum = isNaN(epchNum) || epchNum < 0
  const {
    data: epoch,
    isLoading: isEpochLoading,
    isError: isEpochError
  } = useQuery({
    queryKey: ['vsc-epoch', epchNum],
    queryFn: async () => fetchEpoch(epchNum),
    enabled: !invalidEpochNum
  })
  const { data: prevEpoch } = useQuery({
    queryKey: ['vsc-epoch', epchNum - 1],
    queryFn: async () => fetchEpoch(epchNum - 1),
    enabled: !invalidEpochNum && epchNum > 0
  })
  const {
    data: blocks,
    isLoading: isBlocksLoading,
    isError: isBlocksError
  } = useQuery({
    queryKey: ['vsc-block-in-epoch', epchNum, 100, null],
    queryFn: async () => fetchBlocksInEpoch(epchNum),
    enabled: !invalidEpochNum
  })
  const blockCount = (blocks && blocks.length) ?? 0
  const txId = epoch && epoch.be_info ? epoch.be_info.trx_id : ''
  const hasVotes = !!epoch && !!epoch.be_info && !!epoch.be_info.signature && !!prevEpoch
  const { votedMembers } = hasVotes
    ? getVotedMembers(base64UrlToHex(epoch!.be_info!.signature!.bv), prevEpoch.members, prevEpoch.weights)
    : { votedMembers: [] }
  if (invalidEpochNum) return <PageNotFound />
  return (
    <>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize="5xl">Epoch #{thousandSeperator(epchNum)}</Text>
        <PrevNextBtns toPrev={epchNum > 0 ? '/epoch/' + (epchNum! - 1) : undefined} toNext={'/epoch/' + (epchNum! + 1)} />
      </Stack>
      <hr />
      {isEpochError || epoch?.error ? (
        <Text>{epoch ? epoch.error : 'Failed to fetch epoch from VSC-HAF node'}</Text>
      ) : (
        <Box>
          <Table mt={'20px'}>
            <Tbody>
              <TableRow label="Epoch Number" value={epochNum} isLoading={isEpochLoading} />
              <TableRow
                label="Timestamp"
                value={epoch && epoch.be_info ? epoch.be_info.ts + ' (' + timeAgo(epoch.be_info.ts) + ')' : ''}
                isLoading={isEpochLoading}
              />
              <TableRow label="L1 Tx" value={txId} isLoading={isEpochLoading} link={'/tx/' + txId} />
              <TableRow
                label="L1 Block"
                value={epoch?.block_height}
                isLoading={isEpochLoading}
                link={l1Explorer + '/b/' + epoch?.block_height}
              />
              <TableRow label="Proposer" value={epoch?.proposer} isLoading={isEpochLoading} link={'/@' + epoch?.proposer} />
              <TableRow label="Election Data CID" value={epoch?.data} isLoading={isEpochLoading} />
              {epoch && epoch.be_info && epoch.be_info.eligible_weight > 0 ? (
                <TableRow label="Participation">
                  <ProgressBarPct fontSize={'md'} val={(epoch.be_info.voted_weight / epoch.be_info.eligible_weight) * 100} />
                </TableRow>
              ) : null}
              <TableRow label={`Elected Members (${epoch?.members.length})`} isLoading={isEpochLoading}>
                <Grid
                  templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
                  gap={3}
                >
                  {epoch?.members.map((m, i) => {
                    return (
                      <GridItem key={i}>
                        <Link as={ReactRouterLink} to={'/@' + m.account}>
                          {m.account}
                          <Text display={'inline'} fontSize={'small'}>
                            {' '}
                            ({epoch?.weights[i]})
                          </Text>
                        </Link>
                      </GridItem>
                    )
                  })}
                </Grid>
              </TableRow>
            </Tbody>
          </Table>
          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'solid-rounded'}>
            <TabList>
              <Tab>Blocks ({blockCount})</Tab>
              <Tab>Participation</Tab>
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel>
                {isBlocksLoading ? (
                  <Skeleton height={'20px'} />
                ) : isBlocksError || !Array.isArray(blocks) ? (
                  <Text>Failed to load blocks in epoch</Text>
                ) : (
                  <TableContainer>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Id</Th>
                          <Th>Age</Th>
                          <Th>Proposer</Th>
                          {/* <Th>Txs</Th> */}
                          <Th>Block Hash</Th>
                          <Th>Voted</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {blocks.map((item, i) => (
                          <Tr key={i}>
                            <Td>
                              <Link as={ReactRouterLink} to={'/block/' + item.be_info.block_id}>
                                {item.be_info.block_id}
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
                            {/* <Td>{item.txs}</Td> */}
                            <Td>
                              <Link as={ReactRouterLink} to={'/block-by-hash/' + item.block}>
                                {abbreviateHash(item.block)}
                              </Link>
                            </Td>
                            <Td maxW={'200px'}>
                              <ProgressBarPct val={(item.be_info.voted_weight / item.be_info.eligible_weight) * 100} />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
              <TabPanel>
                {hasVotes ? (
                  <ParticipatedMembers
                    bvHex={base64UrlToHex(epoch.be_info!.signature!.bv)}
                    sig={epoch.be_info!.signature!.sig}
                    members={votedMembers.map((m) => m.account)}
                    isLoading={isEpochLoading}
                  />
                ) : epchNum === 0 ? (
                  <Flex align={'center'} gap={'2'}>
                    <InfoIcon color={themeColorScheme} />
                    <Text fontSize={'md'}>BLS signature was not required for the first election.</Text>
                  </Flex>
                ) : null}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </>
  )
}

export default Epoch
