import { Heading, Text, Table, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchElections, fetchProps } from '../../requests'
import { fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import { ProgressBarPct } from '../ProgressPercent'
import PageNotFound from './404'
import Pagination from '../Pagination'
import { PageTitle } from '../PageTitle'
import { Tooltip } from '../ui/tooltip'

const count = 100

const Elections = () => {
  const { t } = useTranslation('pages')
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data: prop } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    enabled: !invalidPage
  })
  const lastEpoch = (prop?.epoch || 0) - (pageNumber - 1) * count
  const {
    data: epochs,
    isLoading: isEpochsLoading,
    isSuccess: isEpochsSuccess
  } = useQuery({
    queryKey: ['vsc-epochs', lastEpoch, count],
    queryFn: async () => fetchElections(lastEpoch!, count),
    enabled: !!prop && typeof prop.epoch === 'number' && !invalidPage
  })
  if (invalidPage) return <PageNotFound />
  return (
    <>
      <PageTitle title={t('elections.title')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('elections.title')}</Heading>
      <hr />
      <br />
      <Table.ScrollArea mb={'15px'}>
        <Table.Root variant={'line'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('elections.epoch', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('elections.age', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('elections.proposer', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('elections.blocks', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('elections.members', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('elections.totalWeight', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('elections.voted', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('elections.blockVotes', { ns: 'tables' })}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isEpochsLoading ? (
              <Table.Row>
                {[...Array(8)].map((_, i) => (
                  <Table.Cell key={i}>
                    <Skeleton height="20px" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ) : isEpochsSuccess ? (
              epochs.map((epoch, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Link asChild>
                      <ReactRouterLink to={'/epoch/' + epoch.epoch}>
                        {thousandSeperator(epoch.epoch)}
                      </ReactRouterLink>
                    </Link>
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    {epoch.be_info ? (
                      <Tooltip positioning={{ placement: 'top' }} content={epoch.be_info.ts}>
                        {timeAgo(epoch.be_info.ts)}
                      </Tooltip>
                    ) : (
                      <Text fontStyle={'italic'} opacity={'0.7'}>
                        {t('indexing', { ns: 'common' })}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link asChild>
                      <ReactRouterLink to={'/address/hive:' + epoch.proposer}>
                        {epoch.proposer}
                      </ReactRouterLink>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{epoch.blocks_info?.count || 0}</Table.Cell>
                  <Table.Cell>{epoch.members.length}</Table.Cell>
                  <Table.Cell>{fmtmAmount(epoch.total_weight, 'HIVE')}</Table.Cell>
                  <Table.Cell maxW={'200px'}>
                    {epoch.epoch === 0 ? (
                      <Text>{t('na', { ns: 'common' })}</Text>
                    ) : epoch.be_info ? (
                      <ProgressBarPct val={(epoch.be_info.voted_weight / epoch.be_info.eligible_weight) * 100} />
                    ) : (
                      <Text fontStyle={'italic'} opacity={'0.7'}>
                        {t('indexing', { ns: 'common' })}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell maxW={'200px'}>
                    <ProgressBarPct
                      val={(100 * (epoch.blocks_info?.total_votes || 0)) / (epoch.total_weight * (epoch.blocks_info?.count || 1))}
                    />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row></Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Pagination path="/elections" currentPageNum={pageNumber} maxPageNum={Math.ceil((prop?.epoch || 0) / count)} />
    </>
  )
}

export default Elections
