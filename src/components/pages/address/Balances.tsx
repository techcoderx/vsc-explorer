import { Stack, Card, CardBody, CardHeader, Heading, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getL2BalanceByL1User } from '../../../requests'
import { roundFloat, thousandSeperator } from '../../../helpers'

export const AddressBalanceCard = ({ addr }: { addr: string }) => {
  const { data: balance } = useQuery({
    queryKey: ['vsc-address-balance', addr],
    queryFn: async () => getL2BalanceByL1User(addr)
  })
  return (
    <Card>
      <CardHeader mb={'-6'}>
        <Heading size={'md'}>Balances</Heading>
      </CardHeader>
      <CardBody>
        <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
          <Stat>
            <StatLabel>Hive</StatLabel>
            <StatNumber>{thousandSeperator(roundFloat((balance?.hive || 0) / 1000, 3)) + ' HIVE'}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Liquid HBD</StatLabel>
            <StatNumber>{thousandSeperator(roundFloat((balance?.hbd || 0) / 1000, 3)) + ' HBD'}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Staked HBD</StatLabel>
            <StatNumber>🤔</StatNumber>
          </Stat>
        </Stack>
      </CardBody>
    </Card>
  )
}
