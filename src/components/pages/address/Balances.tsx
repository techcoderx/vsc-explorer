import { Stack, Card, CardBody, CardHeader, Heading, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { fmtmAmount } from '../../../helpers'
import { getL2BalanceByL1User } from '../../../requests'

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
          <Stat my={'auto'}>
            <StatLabel>Hive</StatLabel>
            <StatNumber>{fmtmAmount(balance?.hive || 0, 'hive')}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>HBD</StatLabel>
            <StatNumber>{fmtmAmount(balance?.hbd || 0, 'hbd')}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Staked HBD</StatLabel>
            <StatNumber>{fmtmAmount(balance?.hbd_savings || 0, 'hbd')}</StatNumber>
          </Stat>
          {balance && balance.hive_consensus > 0 && (
            <Stat>
              <StatLabel>Consensus Stake</StatLabel>
              <StatNumber>{fmtmAmount(balance.hive_consensus, 'hive')}</StatNumber>
            </Stat>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
