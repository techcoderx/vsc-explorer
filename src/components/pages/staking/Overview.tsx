import { Card, CardFooter, Heading, Button, Link, Skeleton, Stack, Stat, Table } from '@chakra-ui/react'
import { Tooltip } from '../../ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import { Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getLedgerClaims } from '../../../requests'
import { themeColorScheme } from '../../../settings'
import { fmtmAmount, roundFloat, thousandSeperator, timeAgo } from '../../../helpers'
import { LedgerClaimRecord } from '../../../types/L2ApiResult'
import { TxLink } from '../../TableLink'
import { PageTitle } from '../../PageTitle'

const ClaimsTable = ({ claims }: { claims?: LedgerClaimRecord[] }) => {
  const { t } = useTranslation('tables')
  return (
    <Table.ScrollArea>
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

const StakingOverview = () => {
  const { t } = useTranslation('pages')
  const { data } = useQuery({
    queryKey: ['vsc-latest-claims'],
    queryFn: async () => getLedgerClaims(0, 25)
  })
  const latest = data?.claims?.[0]
  return (
    <>
      <PageTitle title={t('staking.title')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('staking.title')}</Heading>
      <hr />
      <br />
      <Card.Root mb={'4'}>
        <Card.Body>
          <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
            <Stat.Root>
              <Stat.Label>{t('staking.latestApr')}</Stat.Label>
              <Stat.ValueText>
                {latest ? `${roundFloat(latest.observed_apr * 100, 2)}%` : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>{t('staking.totalInterest')}</Stat.Label>
              <Stat.ValueText>
                {latest ? fmtmAmount(latest.amount, 'hbd') : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>{t('staking.recipients')}</Stat.Label>
              <Stat.ValueText>
                {latest ? thousandSeperator(latest.received_n) : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
          </Stack>
        </Card.Body>
      </Card.Root>
      <hr />
      <Card.Root my={'4'}>
        <Card.Header>
          <Heading fontSize={'2xl'}>{t('staking.claimsTitle')}</Heading>
        </Card.Header>
        <Card.Body padding={'0'}>
          <ClaimsTable claims={data?.claims || []} />
        </Card.Body>
        <CardFooter paddingTop={'3'}>
          <Button asChild colorPalette={themeColorScheme}>
            <ReactRouterLink to={'/staking/hbd/claims'}>{t('staking.viewAllClaims')}</ReactRouterLink>
          </Button>
        </CardFooter>
      </Card.Root>
    </>
  )
}

export default StakingOverview
