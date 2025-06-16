import { useEffect, useState } from 'react'
import { Box, Card, CardBody, CardHeader, Heading, Text, useColorMode } from '@chakra-ui/react'
import type Recharts from 'recharts'
import { useNetworkStats } from '../../../requests'
import { roundFloat, thousandSeperator } from '../../../helpers'

const DailyActiveWitnesses = () => {
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
          label={{ value: `Witnesses`, angle: -90, position: 'insideLeft' }}
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
        <Line type={'monotone'} dataKey={`witnesses`} name={`Witnesses`} stroke="#8884d8" dot={false} />
        <Brush dataKey={'date'} height={30} stroke="#8884d8" fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

const ActiveStake = () => {
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
          tickFormatter={(val) => thousandSeperator(roundFloat(val / 1000, 3))}
          label={{ value: `Staked HIVE`, angle: -90, position: 'insideLeft' }}
          width={80}
        />
        <Tooltip
          formatter={(value, name) => [`${roundFloat(Number(value) / 1000, 3).toLocaleString()} ${name}`]}
          labelFormatter={(date: Date) => `Date: ${date}`}
          contentStyle={{
            backgroundColor: colorMode === 'dark' ? '#1a1a1a' : '#edf2f7',
            color: colorMode === 'dark' ? '#fff' : '#000',
            border: '1px solid #333'
          }}
        />
        <Line type={'monotone'} dataKey={`active_stake`} name={`HIVE`} stroke="#8884d8" dot={false} />
        <Brush dataKey={'date'} height={30} stroke="#8884d8" fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export const WitnessCharts = () => {
  return (
    <>
      <Text fontSize={'5xl'}>Witness Charts</Text>
      <hr />
      <Card my={'6'}>
        <CardHeader>
          <Heading fontSize={'xl'}>Active Stake</Heading>
          <Text>Total eligible HIVE consensus stake for each day</Text>
        </CardHeader>
        <CardBody mt={'-6'}>
          <Box h={'400px'}>
            <ActiveStake />
          </Box>
        </CardBody>
      </Card>
      <Card my={'6'}>
        <CardHeader>
          <Heading fontSize={'xl'}>Active Witnesses</Heading>
          <Text>Number of daily active witnesses</Text>
        </CardHeader>
        <CardBody mt={'-6'}>
          <Box h={'400px'}>
            <DailyActiveWitnesses />
          </Box>
        </CardBody>
      </Card>
    </>
  )
}
