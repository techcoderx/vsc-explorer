import {
  Link,
  Text,
  Box,
  Grid,
  GridItem,
  Stack,
  Table,
  Tbody,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Flex
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router'
import PageNotFound from './404'
import { fetchBlocksInEpoch, fetchEpoch } from '../../requests'
import Pagination, { PrevNextBtns } from '../Pagination'
import { fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import TableRow from '../TableRow'
import { ProgressBarPct } from '../ProgressPercent'
import { l1Explorer, themeColorScheme } from '../../settings'
import { ParticipatedMembers } from '../BlsAggMembers'
import { InfoIcon } from '@chakra-ui/icons'
import { Blocks as BlocksTbl } from '../tables/Blocks'

const blockBatch = 100

const Epoch = () => {
  const { epochNum, page } = useParams()
  const pageNum = parseInt(page || '1')
  const epchNum = parseInt(epochNum!)
  const invalidEpochNum = isNaN(epchNum) || epchNum < 0
  const offset = (pageNum - 1) * blockBatch
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
  const { data: blocks } = useQuery({
    queryKey: ['vsc-blocks-in-epoch', epchNum, blockBatch, offset],
    queryFn: async () => fetchBlocksInEpoch(epchNum, blockBatch, offset),
    enabled: !invalidEpochNum
  })
  const hasVotes = !!epoch && !!epoch.be_info && !!epoch.be_info.signature && !!prevEpoch
  if (invalidEpochNum) return <PageNotFound />
  return (
    <>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize="5xl">Epoch #{thousandSeperator(epchNum)}</Text>
        <PrevNextBtns toPrev={epchNum > 0 ? '/epoch/' + (epchNum! - 1) : undefined} toNext={'/epoch/' + (epchNum! + 1)} />
      </Stack>
      <hr />
      {isEpochError || epoch?.error ? (
        <Text>{epoch ? epoch.error : 'Failed to fetch epoch from backend'}</Text>
      ) : (
        <Box>
          <Table mt={'20px'}>
            <Tbody>
              <TableRow label="Epoch Number" value={epochNum} isLoading={isEpochLoading} />
              {epoch && epoch.be_info ? (
                <TableRow label="Timestamp" isLoading={isEpochLoading}>
                  <Text>
                    {epoch.be_info.ts} ({timeAgo(epoch.be_info.ts)})
                  </Text>
                </TableRow>
              ) : null}
              <TableRow label="L1 Tx" value={epoch?.tx_id} isLoading={isEpochLoading} link={'/tx/' + epoch?.tx_id} />
              <TableRow
                label="L1 Block"
                value={epoch?.block_height}
                isLoading={isEpochLoading}
                link={l1Explorer + '/b/' + epoch?.block_height}
              />
              <TableRow
                label="Proposer"
                value={epoch?.proposer}
                isLoading={isEpochLoading}
                link={'/address/hive:' + epoch?.proposer}
              />
              <TableRow
                label="Election Data CID"
                value={epoch?.data}
                link={'/tools/dag?cid=' + epoch?.data}
                isLoading={isEpochLoading}
              />
              <TableRow label="Total Weight" value={fmtmAmount(epoch?.total_weight || 0, 'HIVE')} isLoading={isEpochLoading} />
              {epoch && epoch.be_info && epoch.be_info.eligible_weight > 0 ? (
                <TableRow label="Participation">
                  <ProgressBarPct fontSize={'md'} val={(epoch.be_info.voted_weight / epoch.be_info.eligible_weight) * 100} />
                </TableRow>
              ) : null}
              <TableRow label="Avg Block Votes">
                <ProgressBarPct
                  fontSize={'md'}
                  val={
                    (100 * (epoch?.blocks_info?.total_votes || 0)) /
                    ((epoch?.blocks_info?.count || 1) * (epoch?.total_weight || 1))
                  }
                />
              </TableRow>
              <TableRow label={`Elected Members (${epoch?.members.length})`} isLoading={isEpochLoading}>
                <Grid
                  templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
                  gap={3}
                >
                  {epoch?.members.map((m, i) => {
                    return (
                      <GridItem key={i}>
                        <Link as={ReactRouterLink} to={'/address/hive:' + m.account}>
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
              <Tab>Blocks ({epoch?.blocks_info?.count || 0})</Tab>
              <Tab>Participation</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <BlocksTbl blocks={blocks} />
                <Pagination
                  currentPageNum={pageNum}
                  maxPageNum={Math.ceil((epoch?.blocks_info?.count || 1) / blockBatch)}
                  path={`/epoch/${epochNum}`}
                />
              </TabPanel>
              <TabPanel>
                {hasVotes ? (
                  <ParticipatedMembers
                    bv={epoch.be_info!.signature!.bv}
                    sig={epoch.be_info!.signature!.sig}
                    members={prevEpoch.members}
                    weights={prevEpoch.weights}
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
