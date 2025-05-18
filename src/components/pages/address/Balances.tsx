import { Stack, Card, CardBody, CardHeader, Heading, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { fmtmAmount } from '../../../helpers'
import { useAddrBalance } from '../../../requests'

export const AddressBalanceCard = ({ addr }: { addr: string }) => {
  const { balance } = useAddrBalance(addr)
  return (
    <Card>
      <CardHeader mb={'-6'}>
        <Heading size={'md'}>Balances</Heading>
      </CardHeader>
      <CardBody>
        <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
          <Stat my={'auto'}>
            <StatLabel>Hive</StatLabel>
            <StatNumber>{fmtmAmount(balance?.bal?.hive || 0, 'hive')}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>HBD</StatLabel>
            <StatNumber>{fmtmAmount(balance?.bal?.hbd || 0, 'hbd')}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Staked HBD</StatLabel>
            <StatNumber>{fmtmAmount(balance?.bal?.hbd_savings || 0, 'hbd')}</StatNumber>
          </Stat>
          {balance && balance.bal && balance.bal?.hive_consensus > 0 && (
            <Stat>
              <StatLabel>Consensus Stake</StatLabel>
              <StatNumber>{fmtmAmount(balance.bal.hive_consensus, 'hive')}</StatNumber>
            </Stat>
          )}
          {balance && balance.bal && balance.bal.consensus_unstaking > 0 && (
            <Stat>
              <StatLabel>Consensus Unstaking</StatLabel>
              <StatNumber>{fmtmAmount(balance.bal.consensus_unstaking, 'hive')}</StatNumber>
            </Stat>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
