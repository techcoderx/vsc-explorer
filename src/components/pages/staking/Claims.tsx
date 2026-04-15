import { Card, Heading, Link, Skeleton, Stack, Stat, Table } from '@chakra-ui/react'
import { Tooltip } from '../../ui/tooltip'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getLedgerClaims, getInterestPayments } from '../../../requests'
import { themeColorScheme } from '../../../settings'
import { fmtmAmount, roundFloat, thousandSeperator, timeAgo } from '../../../helpers'
import { LedgerClaimRecord } from '../../../types/L2ApiResult'
import { AccountLink, TxLink } from '../../TableLink'
import { PageTitle } from '../../PageTitle'
import Pagination from '../../Pagination'
import PageNotFound from '../404'
import { Link as ReactRouterLink } from 'react-router'

const claimsCount = 100
const maxPage = 100

const ClaimsTable = ({ claims }: { claims?: LedgerClaimRecord[] }) => {
  const { t } = useTranslation('tables')
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root variant={'line'}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t('claims.blockHeight')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('claims.age')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('claims.totalInterest')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('claims.recipients')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('claims.observedApr')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('claims.txId')}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {claims?.map((claim, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Link asChild colorPalette={themeColorScheme}>
                  <ReactRouterLink to={`/staking/hbd/claim/${claim.block_height}`}>
                    {thousandSeperator(claim.block_height)}
                  </ReactRouterLink>
                </Link>
              </Table.Cell>
              <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                <Tooltip content={claim.timestamp} positioning={{ placement: 'top' }}>
                  {timeAgo(claim.timestamp + 'Z')}
                </Tooltip>
              </Table.Cell>
              <Table.Cell>{fmtmAmount(claim.amount, 'hbd')}</Table.Cell>
              <Table.Cell>{thousandSeperator(claim.received_n)}</Table.Cell>
              <Table.Cell>{roundFloat(claim.observed_apr * 100, 2)}%</Table.Cell>
              <Table.Cell>
                <TxLink val={claim.tx_id} truncate={10} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

export const StakingClaims = () => {
  const { t } = useTranslation('pages')
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const offset = (pageNumber - 1) * claimsCount
  const { data } = useQuery({
    queryKey: ['vsc-list-claims', offset, claimsCount],
    queryFn: async () => getLedgerClaims(offset, claimsCount),
    enabled: !invalidPage
  })

  if (invalidPage) return <PageNotFound />

  return (
    <>
      <PageTitle title={t('staking.claimsTitle')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('staking.claimsTitle')}</Heading>
      <hr />
      <br />
      <ClaimsTable claims={data?.claims || []} />
      <Pagination path={'/staking/hbd/claims'} currentPageNum={pageNumber} maxPageNum={maxPage} />
    </>
  )
}

const interestCount = 100

export const ClaimDetail = () => {
  const { t } = useTranslation('pages')
  const { t: tTbl } = useTranslation('tables')
  const { blockHeight, page } = useParams()
  const bh = parseInt(blockHeight || '0')
  const pageNumber = parseInt(page || '1')
  const invalidPage = !blockHeight || isNaN(bh) || bh < 1 || (page && isNaN(pageNumber)) || pageNumber < 1

  const offset = (pageNumber - 1) * interestCount
  const { data: claimData } = useQuery({
    queryKey: ['vsc-claim-detail', bh],
    queryFn: async () => getLedgerClaims(0, 1, { fromBlock: bh, toBlock: bh }),
    enabled: !invalidPage
  })
  const { data: interestData } = useQuery({
    queryKey: ['vsc-interest-payments', bh, offset, interestCount],
    queryFn: async () => getInterestPayments(offset, interestCount, bh),
    enabled: !invalidPage
  })

  if (invalidPage) return <PageNotFound />

  const claim = claimData?.claims?.[0]
  const interests = interestData?.interests || []

  return (
    <>
      <PageTitle title={t('staking.claimDetailTitle', { block: thousandSeperator(bh) })} />
      <Heading as="h1" size="5xl" fontWeight="normal">
        {t('staking.claimDetailTitle', { block: thousandSeperator(bh) })}
      </Heading>
      <hr />
      <br />
      <Card.Root mb={'4'}>
        <Card.Body>
          <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
            <Stat.Root>
              <Stat.Label>{t('staking.totalInterest')}</Stat.Label>
              <Stat.ValueText>
                {claim ? fmtmAmount(claim.amount, 'hbd') : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>{t('staking.recipients')}</Stat.Label>
              <Stat.ValueText>
                {claim ? thousandSeperator(claim.received_n) : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>{t('staking.latestApr')}</Stat.Label>
              <Stat.ValueText>
                {claim ? `${roundFloat(claim.observed_apr * 100, 2)}%` : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
          </Stack>
        </Card.Body>
      </Card.Root>
      <hr />
      <Heading fontSize={'2xl'} my={'4'}>
        {t('staking.interestPayments', { count: interests.length })}
      </Heading>
      <Table.ScrollArea my={'3'}>
        <Table.Root variant={'line'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{tTbl('claims.txId')}</Table.ColumnHeader>
              <Table.ColumnHeader>{tTbl('claims.age')}</Table.ColumnHeader>
              <Table.ColumnHeader>{tTbl('claims.recipient')}</Table.ColumnHeader>
              <Table.ColumnHeader>{tTbl('claims.amount')}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {interests.map((item, i) => {
              const [id] = item.id.split('#')[0].split('-')
              return (
                <Table.Row key={i}>
                  <Table.Cell>
                    <TxLink val={id} truncate={25} />
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={item.timestamp} positioning={{ placement: 'top' }}>
                      {timeAgo(item.timestamp + 'Z')}
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>
                    <AccountLink val={item.to} />
                  </Table.Cell>
                  <Table.Cell>{fmtmAmount(item.amount, item.asset)}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Pagination
        path={`/staking/hbd/claim/${bh}`}
        currentPageNum={pageNumber}
        maxPageNum={claim ? Math.max(1, Math.ceil(claim.received_n / interestCount)) : 1}
      />
    </>
  )
}
