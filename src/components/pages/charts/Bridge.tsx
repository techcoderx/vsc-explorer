import { useMemo, useEffect, useState } from 'react'
import { Box, Card, CardBody, CardHeader, Heading, Text, useColorMode } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import type Recharts from 'recharts'
import { BalHistory } from '../../../types/L1ApiResult'
import { fetchL1Rest } from '../../../requests'
import { multisigAccount } from '../../../settings'
import { thousandSeperator } from '../../../helpers'

type CombinedDataEntry = {
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

  const combinedData = useMemo<CombinedDataEntry[]>(() => {
    if (!hiveHistory || !hbdHistory) return []

    return hiveHistory
      .map((hiveEntry): CombinedDataEntry | null => {
        const hbdEntry = hbdHistory.find((entry) => entry.date === hiveEntry.date)
        if (!hbdEntry) return null

        return {
          date: hiveEntry.date,
          hiveTotal: (parseFloat(hiveEntry.balance.balance) + parseFloat(hiveEntry.balance.savings_balance)) / 1000,
          hbdTotal: (parseFloat(hbdEntry.balance.balance) + parseFloat(hbdEntry.balance.savings_balance)) / 1000
        }
      })
      .filter((item) => item !== null)
  }, [hiveHistory, hbdHistory])

  if (!recharts) {
    return <Box>Loading recharts...</Box>
  }

  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts

  return (
    combinedData && (
      <ResponsiveContainer width="100%">
        <LineChart data={combinedData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray={'3 3'} />
          <XAxis dataKey="date" minTickGap={40} tickFormatter={(date: string) => date.split('T')[0]} />
          <YAxis
            tickFormatter={(val) => thousandSeperator(val)}
            label={{ value: 'TVL (HIVE/HBD)', angle: -90, position: 'insideLeft' }}
            width={80}
          />
          <Tooltip
            formatter={(value, name) => [`${Number(value).toLocaleString()} ${name}`]}
            labelFormatter={(date: string) => `Date: ${date.split('T')[0]}`}
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
        </LineChart>
      </ResponsiveContainer>
    )
  )
}

export const BridgeStats = () => {
  return (
    <>
      <Text fontSize={'5xl'}>Bridge Charts</Text>
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
    </>
  )
}
