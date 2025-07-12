import { Card, CardBody, CardHeader, Heading, Text } from '@chakra-ui/react'
import { ProgressBarPct } from '../../ProgressPercent'
import { useAddrBalance } from '../../../requests'

export const AddressRcInfo = ({ addr }: { addr: string }) => {
  const { balance, isLoading } = useAddrBalance(addr)
  return (
    <Card width={'100%'}>
      <CardHeader marginBottom={'-15px'}>
        <Heading size={'md'} textAlign={'center'}>
          RC Info
        </Heading>
      </CardHeader>
      <CardBody>
        {!!balance && !!balance.rc && balance.rc.max_rcs > 0 ? (
          <ProgressBarPct val={(100 * balance.rc.amount) / balance.rc.max_rcs} fontSize="lg" height={'10px'} width={'100%'} />
        ) : isLoading ? (
          <Text>Loading balances...</Text>
        ) : (
          <Text>You have no RCs available. Please deposit HBD to obtain RCs.</Text>
        )}
      </CardBody>
    </Card>
  )
}
