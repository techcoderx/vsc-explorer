import { Stack, Card, CardBody, CardHeader, Heading, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { fetchAccInfo } from '../../../requests'
import { thousandSeperator, timeAgo } from '../../../helpers'

export const AddressActivityCard = ({ addr }: { addr: string }) => {
  const { data: activity } = useQuery({
    queryKey: ['vsc-address-activity', addr],
    queryFn: async () => fetchAccInfo(addr)
  })
  return (
    <Card>
      <CardHeader mb={'-6'}>
        <Heading size={'md'}>Activity</Heading>
      </CardHeader>
      <CardBody>
        <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
          <Stat>
            <StatLabel>Tx Count</StatLabel>
            <StatNumber>{thousandSeperator(activity?.tx_count || 0)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Last Activity</StatLabel>
            <StatNumber>{timeAgo(activity?.last_activity || '1970-01-01T00:00:00Z', true)}</StatNumber>
          </Stat>
        </Stack>
      </CardBody>
    </Card>
  )
}
