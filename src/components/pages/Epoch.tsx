import { Link, Heading, Text, Box, Grid, GridItem, Stack, Table, Tabs, Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import PageNotFound from './404'
import { fetchBlocksInEpoch, fetchEpoch, fetchElectionSettlement, fetchTssCommitments } from '../../requests'
import Pagination, { PrevNextBtns } from '../Pagination'
import { beL1BlockUrl, fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import TableRow from '../TableRow'
import { ProgressBarPct } from '../ProgressPercent'
import { themeColorScheme } from '../../settings'
import { ParticipatedMembers } from '../BlsAggMembers'
import { LuInfo } from 'react-icons/lu'
import { Blocks as BlocksTbl } from '../tables/Blocks'
import { TssCommitments as TssCommitmentsTbl } from '../tables/TssCommitments'
import { PageTitle } from '../PageTitle'
import { AccountLink } from '../TableLink'

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
  const { data: tssCommitments, isLoading: isTssLoading } = useQuery({
    queryKey: ['vsc-tss-commitments-epoch', epchNum],
    queryFn: async () => fetchTssCommitments(epchNum),
    enabled: !invalidEpochNum
  })
  const {
    data: settlement,
    isLoading: isSettlementLoading,
    isError: isSettlementError
  } = useQuery({
    queryKey: ['vsc-epoch-settlement', epchNum],
    queryFn: async () => fetchElectionSettlement(epchNum),
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
          <Tabs.Root lazyMount mt={'7'} colorPalette={themeColorScheme} variant={'enclosed'} defaultValue="0">
            <Tabs.List overflowX={'auto'} whiteSpace={'nowrap'} maxW={'100%'} display={'flex'} css={{ '& > button': { flexShrink: 0 } }}>
              <Tabs.Trigger value="0">{t('epoch.blocksTab', { count: epoch?.blocks_info?.count || 0 })}</Tabs.Trigger>
              <Tabs.Trigger value="1">{t('epoch.participationTab')}</Tabs.Trigger>
              <Tabs.Trigger value="2">{t('epoch.tssCommitmentsTab', { count: tssCommitments?.length || 0 })}</Tabs.Trigger>
              {settlement ? <Tabs.Trigger value="3">{t('epoch.settlementTab')}</Tabs.Trigger> : null}
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
            <Tabs.Content value="2">
              <TssCommitmentsTbl commitments={tssCommitments} isLoading={isTssLoading} />
            </Tabs.Content>
            <Tabs.Content value="3">
              {isSettlementLoading ? (
                <Table.Root mt={'20px'}>
                  <Table.Body>
                    <TableRow label={t('epoch.settlementBucketBalance')} isLoading />
                    <TableRow label={t('epoch.settlementTotalDistributed')} isLoading />
                    <TableRow label={t('epoch.settlementResidualHbd')} isLoading />
                    <TableRow label={t('epoch.settlementSnapshotRange')} isLoading />
                    <TableRow label={t('epoch.settlementPrevEpoch')} isLoading />
                  </Table.Body>
                </Table.Root>
              ) : isSettlementError ? (
                <Text>{t('epoch.settlementLoadingError')}</Text>
              ) : settlement ? (
                <>
                  <Table.Root mt={'20px'}>
                    <Table.Body>
                      <TableRow
                        label={t('epoch.settlementBucketBalance')}
                        value={fmtmAmount(settlement.bucket_balance_hbd, 'HBD')}
                      />
                      <TableRow
                        label={t('epoch.settlementTotalDistributed')}
                        value={fmtmAmount(settlement.total_distributed_hbd, 'HBD')}
                      />
                      <TableRow
                        label={t('epoch.settlementResidualHbd')}
                        value={fmtmAmount(settlement.residual_hbd, 'HBD')}
                      />
                      <TableRow
                        label={t('epoch.settlementSnapshotRange')}
                        value={`${thousandSeperator(settlement.snapshot_range_from)} - ${thousandSeperator(settlement.snapshot_range_to)}`}
                      />
                      <TableRow
                        label={t('epoch.settlementPrevEpoch')}
                        value={thousandSeperator(settlement.prev_epoch)}
                        link={'/epoch/' + settlement.prev_epoch}
                      />
                    </Table.Body>
                  </Table.Root>

                  <Heading size="lg" mt={'5'}>{t('epoch.settlementDetails')}</Heading>
                  <Table.ScrollArea my={'3'} w={'full'}>
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>{t('epoch.settlementAccount')}</Table.ColumnHeader>
                          <Table.ColumnHeader>{t('epoch.settlementReductionBps')}</Table.ColumnHeader>
                          <Table.ColumnHeader>{t('epoch.settlementHbdAmount')}</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {(() => {
                          const hivePrefixed = (a: string) => (a.startsWith('hive:') ? a : 'hive:' + a)
                          const merged = new Map<string, { bps?: number; hbd?: number }>()
                          for (const rr of settlement.reward_reductions) {
                            const key = hivePrefixed(rr.account)
                            const entry = merged.get(key) || {}
                            entry.bps = rr.bps
                            merged.set(key, entry)
                          }
                          for (const dist of settlement.distributions) {
                            const key = hivePrefixed(dist.account)
                            const entry = merged.get(key) || {}
                            entry.hbd = dist.hbd_amount
                            merged.set(key, entry)
                          }
                          const rows = Array.from(merged.entries()).sort((a, b) => a[0].localeCompare(b[0]))
                          if (rows.length === 0) {
                            return (
                              <Table.Row>
                                <Table.Cell colSpan={3}>
                                  <Text>No settlement details</Text>
                                </Table.Cell>
                              </Table.Row>
                            )
                          }
                          return rows.map(([account, entry]) => (
                            <Table.Row key={account}>
                              <Table.Cell>
                                <AccountLink val={account} truncate={16} />
                              </Table.Cell>
                              <Table.Cell>
                                <Text>
                                  {entry.bps !== undefined ? `${entry.bps} bps (${(entry.bps / 100).toFixed(2)}%)` : '-'}
                                </Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Text>{entry.hbd !== undefined ? fmtmAmount(entry.hbd, 'HBD') : '-'}</Text>
                              </Table.Cell>
                            </Table.Row>
                          ))
                        })()}
                      </Table.Body>
                    </Table.Root>
                  </Table.ScrollArea>
                </>
              ) : null}
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      )}
    </>
  )
}

export default Epoch
