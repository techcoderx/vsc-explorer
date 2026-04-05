import { useEffect, useState } from 'react'
import { Box, Card, Heading, Text } from '@chakra-ui/react'
import { useColorMode } from '../../ui/color-mode'
import { useTranslation } from 'react-i18next'
import type Recharts from 'recharts'
import { useNetworkStats } from '../../../requests'
import { thousandSeperator } from '../../../helpers'
import { PageTitle } from '../../PageTitle'

const DailyTxs = () => {
  const { colorMode } = useColorMode()
  const [recharts, setRecharts] = useState<typeof Recharts>()
  const networkStats = useNetworkStats() || []
  useEffect(() => {
    import('recharts').then((module) => setRecharts(module))
  }, [])
  if (!recharts) {
    return <Box>Loading recharts...</Box>
  }
  const { Brush, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } = recharts
  return (
    <ResponsiveContainer width="100%">
      <ComposedChart data={networkStats} margin={{ top: 10, right: 20, left: 20, bottom: 10 }} stackOffset="sign">
        <CartesianGrid strokeDasharray={'3 3'} opacity={'0.25'} />
        <XAxis dataKey="date" minTickGap={40} />
        <YAxis
          tickFormatter={(val) => thousandSeperator(val)}
          label={{ value: `Transactions`, angle: -90, position: 'insideLeft' }}
          width={80}
        />
        <Tooltip
          formatter={(value, name) => [`${Number(value).toLocaleString()} ${name}`]}
          labelFormatter={(date: Date) => `Date: ${date}`}
          contentStyle={{
            backgroundColor: 'var(--magi-tooltip)',
            color: colorMode === 'dark' ? '#fff' : '#000',
            border: '1px solid #333'
          }}
        />
        <Line type="monotone" dataKey={`txs`} name={`Txs`} stroke="#8884d8" dot={false} />
        <Brush dataKey={'date'} height={30} stroke="#8884d8" fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export const TxCharts = () => {
  const { t } = useTranslation('pages')
  return (
    <>
      <PageTitle title={t('charts.txCharts')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('charts.txCharts')}</Heading>
      <hr />
      <Card.Root my={'6'}>
        <Card.Header pb={'4'}>
          <Heading fontSize={'xl'}>{t('charts.txCount')}</Heading>
          <Text>{t('charts.txCountDesc')}</Text>
        </Card.Header>
        <Card.Body pt={'0'}>
          <Box h={'400px'}>
            <DailyTxs />
          </Box>
        </Card.Body>
      </Card.Root>
    </>
  )
}
