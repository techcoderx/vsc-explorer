import { useEffect, useState } from 'react'
import { Box, Card, CardBody, CardHeader, Heading, Text, useColorMode } from '@chakra-ui/react'
import type Recharts from 'recharts'
import { useNetworkStats } from '../../../requests'
import { thousandSeperator } from '../../../helpers'

const DailyActiveUsers = () => {
  const { colorMode } = useColorMode()
  const [recharts, setRecharts] = useState<typeof Recharts>()
  const networkStats = useNetworkStats() || []
  useEffect(() => {
    import('recharts').then((module) => setRecharts(module))
  }, [])
  if (!recharts) {
    return <Box>Loading recharts...</Box>
  }
  const { Bar, Brush, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } = recharts
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
            backgroundColor: colorMode === 'dark' ? '#1a1a1a' : '#edf2f7',
            color: colorMode === 'dark' ? '#fff' : '#000',
            border: '1px solid #333'
          }}
        />
        <Bar stackId={'a'} dataKey={`active_l1_addresses`} name={`Hive Accounts`} fill="#8884d8" />
        <Bar stackId={'a'} dataKey={`active_l2_addresses`} name={`Offchain Accounts`} fill="#82ca9d" />
        <Brush dataKey={'date'} height={30} stroke="#8884d8" fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export const AddressCharts = () => {
  return (
    <>
      <Text fontSize={'5xl'}>Address Charts</Text>
      <hr />
      <Card my={'6'}>
        <CardHeader>
          <Heading fontSize={'xl'}>Daily Active Users</Heading>
          <Text>Number of daily unique transacting addresses</Text>
        </CardHeader>
        <CardBody mt={'-6'}>
          <Box h={'400px'}>
            <DailyActiveUsers />
          </Box>
        </CardBody>
      </Card>
    </>
  )
}
