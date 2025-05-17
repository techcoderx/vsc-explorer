import { Card, CardBody, CardHeader, Heading, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { ProgressBarPct } from '../../ProgressPercent'
import { availableRC } from '../../../helpers'
import { fetchL1Rest, useAddrBalance } from '../../../requests'

export const AddressRcInfo = ({ addr }: { addr: string }) => {
  const { balance, isLoading } = useAddrBalance(addr)
  const { data: headBlock } = useQuery({
    queryKey: ['hive-headblock'],
    queryFn: async () => fetchL1Rest<number>(`/hafah-api/headblock`)
  })
  const availRC = balance ? availableRC(balance, headBlock, addr.startsWith('hive:')) : { avail: 0, max: 0 }
  return (
    <Card width={'100%'}>
      <CardHeader marginBottom={'-15px'}>
        <Heading size={'md'} textAlign={'center'}>
          RC Info
        </Heading>
      </CardHeader>
      <CardBody>
        {availRC.max > 0 ? (
          <ProgressBarPct val={(100 * availRC.avail) / availRC.max} fontSize="lg" height={'10px'} width={'100%'} />
        ) : isLoading ? (
          <Text>Loading balances...</Text>
        ) : (
          <Text>You have no RCs available. Please deposit HBD to obtain RCs.</Text>
        )}
      </CardBody>
    </Card>
  )
}
