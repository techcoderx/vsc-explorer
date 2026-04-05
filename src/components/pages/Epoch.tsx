import { Link, Heading, Text, Box, Grid, GridItem, Stack, Table, Tabs, Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import PageNotFound from './404'
import { fetchBlocksInEpoch, fetchEpoch } from '../../requests'
import Pagination, { PrevNextBtns } from '../Pagination'
import { beL1BlockUrl, fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import TableRow from '../TableRow'
import { ProgressBarPct } from '../ProgressPercent'
import { themeColorScheme } from '../../settings'
import { ParticipatedMembers } from '../BlsAggMembers'
import { LuInfo } from 'react-icons/lu'
import { Blocks as BlocksTbl } from '../tables/Blocks'
import { PageTitle } from '../PageTitle'

const blockBatch = 100

const Epoch = () => {
  const { t } = useTranslation('pages')
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
      <PageTitle title={t('epoch.title', { num: thousandSeperator(epchNum) })} />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Heading as="h1" size="5xl" fontWeight="normal">{t('epoch.title', { num: thousandSeperator(epchNum) })}</Heading>
        <PrevNextBtns toPrev={epchNum > 0 ? '/epoch/' + (epchNum! - 1) : undefined} toNext={'/epoch/' + (epchNum! + 1)} />
      </Stack>
      <hr />
      {isEpochError || epoch?.error ? (
        <Text>{epoch ? epoch.error : 'Failed to fetch epoch from backend'}</Text>
      ) : (
        <Box>
          <Table.Root mt={'20px'}>
            <Table.Body>
              <TableRow label={t('epoch.epochNumber')} value={epochNum} isLoading={isEpochLoading} />
              {epoch && epoch.be_info ? (
                <TableRow label={t('epoch.timestamp')} isLoading={isEpochLoading}>
                  <Text>
                    {epoch.be_info.ts} ({timeAgo(epoch.be_info.ts)})
                  </Text>
                </TableRow>
              ) : null}
              <TableRow label={t('epoch.l1Tx')} value={epoch?.tx_id} isLoading={isEpochLoading} link={'/tx/' + epoch?.tx_id} />
              <TableRow
                label={t('epoch.l1Block')}
                value={epoch?.block_height}
                isLoading={isEpochLoading}
                link={beL1BlockUrl(epoch?.block_height || 0)}
              />
              <TableRow
                label={t('epoch.proposer')}
                value={epoch?.proposer}
                isLoading={isEpochLoading}
                link={'/address/hive:' + epoch?.proposer}
              />
              <TableRow
                label={t('epoch.electionDataCid')}
                value={epoch?.data}
                link={'/tools/dag?cid=' + epoch?.data}
                isLoading={isEpochLoading}
              />
              <TableRow label={t('epoch.totalWeight')} value={fmtmAmount(epoch?.total_weight || 0, 'HIVE')} isLoading={isEpochLoading} />
              {epoch && epoch.be_info && epoch.be_info.eligible_weight > 0 ? (
                <TableRow label={t('epoch.participation')}>
                  <ProgressBarPct fontSize={'md'} val={(epoch.be_info.voted_weight / epoch.be_info.eligible_weight) * 100} />
                </TableRow>
              ) : null}
              <TableRow label={t('epoch.avgBlockVotes')}>
                <ProgressBarPct
                  fontSize={'md'}
                  val={
                    (100 * (epoch?.blocks_info?.total_votes || 0)) /
                    ((epoch?.blocks_info?.count || 1) * (epoch?.total_weight || 1))
                  }
                />
              </TableRow>
              <TableRow label={t('epoch.electedMembers', { count: epoch?.members.length })} isLoading={isEpochLoading}>
                <Grid
                  templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
                  gap={3}
                >
                  {epoch?.members.map((m, i) => {
                    return (
                      <GridItem key={i}>
                        <Link asChild>
                          <ReactRouterLink to={'/address/hive:' + m.account}>
                            {m.account}
                            <Text display={'inline'} fontSize={'small'}>
                              {' '}
                              ({epoch?.weights[i]})
                            </Text>
                          </ReactRouterLink>
                        </Link>
                      </GridItem>
                    )
                  })}
                </Grid>
              </TableRow>
            </Table.Body>
          </Table.Root>
          <Tabs.Root mt={'7'} colorPalette={themeColorScheme} variant={'enclosed'} defaultValue="0">
            <Tabs.List overflowX={'auto'} whiteSpace={'nowrap'} maxW={'100%'} display={'flex'} css={{ '& > button': { flexShrink: 0 } }}>
              <Tabs.Trigger value="0">{t('epoch.blocksTab', { count: epoch?.blocks_info?.count || 0 })}</Tabs.Trigger>
              <Tabs.Trigger value="1">{t('epoch.participationTab')}</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="0">
              <BlocksTbl blocks={blocks} />
              <Pagination
                currentPageNum={pageNum}
                maxPageNum={Math.ceil((epoch?.blocks_info?.count || 1) / blockBatch)}
                path={`/epoch/${epochNum}`}
              />
            </Tabs.Content>
            <Tabs.Content value="1">
              {hasVotes ? (
                <ParticipatedMembers
                  bv={epoch.be_info!.signature!.bv}
                  sig={epoch.be_info!.signature!.sig}
                  members={prevEpoch.members}
                  weights={prevEpoch.weights}
                />
              ) : epchNum === 0 ? (
                <Flex align={'center'} gap={'2'}>
                  <LuInfo color={themeColorScheme} />
                  <Text fontSize={'md'}>{t('epoch.blsNotRequired')}</Text>
                </Flex>
              ) : null}
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      )}
    </>
  )
}

export default Epoch
