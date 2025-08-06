import { useMemo, useEffect, useState } from 'react'
import { Box, Card, CardBody, CardHeader, Heading, Text, useColorMode } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import type Recharts from 'recharts'
import { BalHistory } from '../../../types/L1ApiResult'
import { fetchL1Rest, useNetworkStats } from '../../../requests'
import { multisigAccount } from '../../../settings'
import { roundFloat, thousandSeperator } from '../../../helpers'
import { Coin } from '../../../types/Payloads'
import { PageTitle } from '../../PageTitle'

type TotalTVL = {
  date: string
  hiveTotal: number
  hbdTotal: number
}

export const HiveBridgeTVL = () => {
  const { colorMode } = useColorMode()
  const [hiddenLines, setHiddenLines] = useState<{ hiveTotal: boolean; hbdTotal: boolean }>({
    hiveTotal: false,
    hbdTotal: false
  })
  const [recharts, setRecharts] = useState<typeof Recharts>()

  useEffect(() => {
    import('recharts').then((module) => setRecharts(module))
  }, [])

  const { data: hiveHistory } = useQuery({
    queryKey: ['bridge-tvl-hive'],
    queryFn: async () =>
      fetchL1Rest<BalHistory[]>(
        `/balance-api/accounts/${multisigAccount}/aggregated-history?coin-type=HIVE&granularity=daily&direction=asc&from-block=2025-04-01`
      )
  })
  const { data: hbdHistory } = useQuery({
    queryKey: ['bridge-tvl-hbd'],
    queryFn: async () =>
      fetchL1Rest<BalHistory[]>(
        `/balance-api/accounts/${multisigAccount}/aggregated-history?coin-type=HBD&granularity=daily&direction=asc&from-block=2025-04-01`
      )
  })

  const combinedData = useMemo<TotalTVL[]>(() => {
    if (!hiveHistory || !hbdHistory) return []

    return hiveHistory
      .map((hiveEntry): TotalTVL | null => {
        const hbdEntry = hbdHistory.find((entry) => entry.date === hiveEntry.date)
        if (!hbdEntry) return null

        return {
          date: hiveEntry.date.split('T')[0],
          hiveTotal: (parseFloat(hiveEntry.balance.balance) + parseFloat(hiveEntry.balance.savings_balance)) / 1000,
          hbdTotal: (parseFloat(hbdEntry.balance.balance) + parseFloat(hbdEntry.balance.savings_balance)) / 1000
        }
      })
      .filter((item) => item !== null)
  }, [hiveHistory, hbdHistory])

  if (!recharts) {
    return <Box>Loading recharts...</Box>
  }

  const { Brush, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts

  return (
    combinedData && (
      <ResponsiveContainer width="100%">
        <LineChart data={combinedData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray={'3 3'} opacity={'0.25'} />
          <XAxis dataKey="date" minTickGap={40} />
          <YAxis
            tickFormatter={(val) => thousandSeperator(val)}
            label={{ value: 'TVL (HIVE/HBD)', angle: -90, position: 'insideLeft' }}
            width={80}
          />
          <Tooltip
            formatter={(value, name) => [`${Number(value).toLocaleString()} ${name}`]}
            labelFormatter={(date: string) => `Date: ${date}`}
            contentStyle={{
              backgroundColor: colorMode === 'dark' ? '#1a1a1a' : '#edf2f7',
              color: colorMode === 'dark' ? '#fff' : '#000',
              border: '1px solid #333'
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            onClick={(e: any) => {
              if (typeof e.dataKey === 'string' && (e.dataKey === 'hiveTotal' || e.dataKey === 'hbdTotal')) {
                setHiddenLines((prev) => ({
                  ...prev,
                  [e.dataKey as 'hiveTotal' | 'hbdTotal']: !prev[e.dataKey as 'hiveTotal' | 'hbdTotal']
                }))
              }
            }}
          />
          <Line type="monotone" dataKey="hiveTotal" name="HIVE" dot={false} stroke="#8884d8" hide={hiddenLines.hiveTotal} />
          <Line type="monotone" dataKey="hbdTotal" name="HBD" dot={false} stroke="#82ca9d" hide={hiddenLines.hbdTotal} />
          <Brush dataKey={'date'} height={30} stroke="#8884d8" fill="transparent" />
        </LineChart>
      </ResponsiveContainer>
    )
  )
}

type NetFlow = {
  date: string
  hiveNet: number
  hbdNet: number
  hiveDeposits: number
  hbdDeposits: number
  hiveWithdrawals: number
  hbdWithdrawals: number
}

export const BridgeNetFlow = ({ coin }: { coin: Coin }) => {
  const { colorMode } = useColorMode()
  const [recharts, setRecharts] = useState<typeof Recharts>()
  const networkStats = useNetworkStats() || []
  const [hiddenLines, setHiddenLines] = useState<{ deposits: boolean; withdrawals: boolean; net: boolean }>({
    deposits: false,
    withdrawals: false,
    net: false
  })
  useEffect(() => {
    import('recharts').then((module) => setRecharts(module))
  }, [])
  const netFlowStats = useMemo<NetFlow[]>(() => {
    return networkStats.map((s) => {
      return {
        date: s.date,
        hiveNet: roundFloat((s.deposits_hive - s.withdrawals_hive) / 1000, 3),
        hbdNet: roundFloat((s.deposits_hbd - s.withdrawals_hbd) / 1000, 3),
        hiveDeposits: roundFloat(s.deposits_hive / 1000, 3),
        hbdDeposits: roundFloat(s.deposits_hbd / 1000, 3),
        hiveWithdrawals: -roundFloat(s.withdrawals_hive / 1000, 3),
        hbdWithdrawals: -roundFloat(s.withdrawals_hbd / 1000, 3)
      }
    })
  }, [networkStats])
  if (!recharts) {
    return <Box>Loading recharts...</Box>
  }
  const { Bar, Brush, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } = recharts
  return (
    <ResponsiveContainer width="100%">
      <ComposedChart data={netFlowStats} margin={{ top: 10, right: 20, left: 20, bottom: 10 }} stackOffset="sign">
        <CartesianGrid strokeDasharray={'3 3'} opacity={'0.25'} />
        <XAxis dataKey="date" minTickGap={40} />
        <YAxis
          tickFormatter={(val) => thousandSeperator(val)}
          label={{ value: `Amount (${coin})`, angle: -90, position: 'insideLeft' }}
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
        <Legend
          verticalAlign="top"
          height={36}
          onClick={(e: any) => {
            if (typeof e.dataKey === 'string') {
              const k = e.dataKey.replace(coin.toLowerCase(), '').toLowerCase() as 'deposits' | 'withdrawals' | 'net'
              if (typeof hiddenLines[k] === 'boolean')
                setHiddenLines((prev) => ({
                  ...prev,
                  [k]: !prev[k]
                }))
            }
          }}
        />
        <Bar
          stackId={'a'}
          dataKey={`${coin.toLowerCase()}Deposits`}
          name={`${coin} Inflows`}
          fill="#8884d8"
          hide={hiddenLines.deposits}
        />
        <Bar
          stackId={'a'}
          dataKey={`${coin.toLowerCase()}Withdrawals`}
          name={`${coin} Outflows`}
          fill="#82ca9d"
          hide={hiddenLines.withdrawals}
        />
        <Line
          type="monotone"
          dataKey={`${coin.toLowerCase()}Net`}
          name={`${coin} Net Flow`}
          dot={false}
          stroke="#fbb6ce"
          hide={hiddenLines.net}
        />
        <Brush dataKey={'date'} height={30} stroke="#8884d8" fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export const BridgeCharts = () => {
  return (
    <>
      <PageTitle title="Native Asset Mapping (NAM) Charts" />
      <Text fontSize={'5xl'}>Native Asset Mapping (NAM) Charts</Text>
      <hr />
      <Card my={'6'}>
        <CardHeader>
          <Heading fontSize={'xl'}>HIVE and HBD TVL</Heading>
          <Text>History of HIVE and HBD balances in gateway account over time</Text>
        </CardHeader>
        <CardBody mt={'-6'}>
          <Box h={'400px'}>
            <HiveBridgeTVL />
          </Box>
        </CardBody>
      </Card>
      <Card my={'6'}>
        <CardHeader>
          <Heading fontSize={'xl'}>HIVE Net Flow</Heading>
          <Text>History of HIVE net flows over time</Text>
        </CardHeader>
        <CardBody mt={'-6'}>
          <Box h={'400px'}>
            <BridgeNetFlow coin="HIVE" />
          </Box>
        </CardBody>
      </Card>
      <Card my={'6'}>
        <CardHeader>
          <Heading fontSize={'xl'}>HBD Net Flow</Heading>
          <Text>History of HBD net flows over time</Text>
        </CardHeader>
        <CardBody mt={'-6'}>
          <Box h={'400px'}>
            <BridgeNetFlow coin="HBD" />
          </Box>
        </CardBody>
      </Card>
    </>
  )
}
