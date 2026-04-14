import { Card, Heading, Skeleton, Stack, Stat, Table, Text, CardFooter, Button, Link } from '@chakra-ui/react'
import { Tooltip } from '../../ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import { Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { fetchL1Rest, fetchLatestBridgeTxs, getBridgeTxCounts } from '../../../requests'
import { getConf, themeColorScheme } from '../../../settings'
import { L1Balance } from '../../../types/L1ApiResult'
import { fmtmAmount, thousandSeperator, timeAgo } from '../../../helpers'
import { LedgerActions, LedgerTx } from '../../../types/L2ApiResult'
import { AccountLink, TxLink } from '../../TableLink'
import { PageTitle } from '../../PageTitle'

const cardBorder = '1.5px solid rgb(255,255,255,0.16)'
const cardBorderLight = '1.5px solid #e2e8f0'

const BridgeTxsTable = ({ txs }: { txs?: (LedgerTx<'deposit'> | LedgerActions<'withdraw'>)[] }) => {
  const { t } = useTranslation('tables')
  return (
    <Table.ScrollArea>
      <Table.Root variant={'line'}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t('bridge.txId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('bridge.age')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('bridge.toUser')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('bridge.amount')}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {txs?.map((tx, i) => (
            <BridgeTxRow key={i} tx={tx} />
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

const BridgeTxRow = ({ tx }: { tx: LedgerTx<'deposit'> | LedgerActions<'withdraw'> }) => {
  return (
    <Table.Row _dark={{ borderTop: cardBorder }} _light={{ borderTop: cardBorderLight }}>
      <Table.Cell>
        <TxLink val={tx.id.split(':')[0]} truncate={10} />
      </Table.Cell>
      <Table.Cell>
        <Tooltip content={tx.timestamp} positioning={{ placement: 'top' }}>
          {timeAgo(tx.timestamp + 'Z')}
        </Tooltip>
      </Table.Cell>
      <Table.Cell>
        <AccountLink val={tx.to} />
      </Table.Cell>
      <Table.Cell>{fmtmAmount(tx.amount, tx.asset)}</Table.Cell>
    </Table.Row>
  )
}

const HiveBridgeOverview = () => {
  const { t } = useTranslation('pages')
  const conf = getConf()
  const { data: l1Acc } = useQuery({
    queryKey: ['hive-account', conf.msAccount],
    queryFn: async () => fetchL1Rest<L1Balance>(`/balance-api/accounts/${conf.msAccount}/balances`)
  })
  const { data: tally } = useQuery({ queryKey: ['vsc-bridge-tx-count'], queryFn: async () => getBridgeTxCounts() })
  const { data } = useQuery({
    queryKey: ['vsc-latest-bridge-txs'],
    queryFn: async () => fetchLatestBridgeTxs()
  })
  return (
    <>
      <PageTitle title={t('bridge.title')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('bridge.title')}</Heading>
      <hr />
      <br />
      <Card.Root mb={'4'}>
        <Card.Body>
          <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
            <Stat.Root>
              <Stat.Label>{t('bridge.hiveTvl')}</Stat.Label>
              <Stat.ValueText>
                {!!l1Acc ? (
                  fmtmAmount(l1Acc.hive_balance + l1Acc.hive_savings + parseInt(l1Acc.vesting_balance_hive), 'HIVE')
                ) : (
                  <Skeleton height={'20px'} maxW={'40px'} />
                )}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>{t('bridge.hbdTvl')}</Stat.Label>
              <Stat.ValueText>
                {!!l1Acc ? fmtmAmount(l1Acc.hbd_balance + l1Acc.hbd_savings, 'HBD') : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>{t('bridge.mapTxs')}</Stat.Label>
              <Stat.ValueText>{!!tally ? thousandSeperator(tally.deposits) : <Skeleton height={'20px'} maxW={'40px'} />}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>{t('bridge.unmapTxs')}</Stat.Label>
              <Stat.ValueText>
                {!!tally ? thousandSeperator(tally.withdrawals) : <Skeleton height={'20px'} maxW={'40px'} />}
              </Stat.ValueText>
            </Stat.Root>
          </Stack>
        </Card.Body>
      </Card.Root>
      <hr />
      <Stack direction={{ base: 'column', xl: 'row' }} justifyContent={'space-between'} my={'4'} gap={'4'}>
        <Card.Root width={'100%'}>
          <Card.Header>
            <Heading fontSize={'2xl'}>{t('bridge.latestMaps')}</Heading>
          </Card.Header>
          <Card.Body padding={'0'}>
            <BridgeTxsTable txs={data?.deposits || []} />
          </Card.Body>
          <CardFooter paddingTop={'3'}>
            <Button asChild colorPalette={themeColorScheme}>
              <ReactRouterLink to={'/nam/hive/maps'}>{t('bridge.viewMore')}</ReactRouterLink>
            </Button>
          </CardFooter>
        </Card.Root>
        <Card.Root width={'100%'}>
          <Card.Header>
            <Heading fontSize={'2xl'}>{t('bridge.latestUnmaps')}</Heading>
          </Card.Header>
          <Card.Body padding={'0'}>
            <BridgeTxsTable txs={data?.withdrawals || []} />
          </Card.Body>
          <CardFooter paddingTop={'3'}>
            <Button asChild colorPalette={themeColorScheme}>
              <ReactRouterLink to={'/nam/hive/unmaps'}>{t('bridge.viewMore')}</ReactRouterLink>
            </Button>
          </CardFooter>
        </Card.Root>
      </Stack>
      <Text>
        <Link asChild>
          <ReactRouterLink target="_blank" rel="noopener noreferrer" to={'https://peakd.com/vsc/@vsc.network/introducing-native-asset-mapping'} aria-label="Learn more about native asset mapping here (opens in new tab)">
            {t('bridge.learnMore')}
          </ReactRouterLink>
        </Link>
      </Text>
    </>
  )
}

export default HiveBridgeOverview
