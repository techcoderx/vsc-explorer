import { Box, Card, Heading, Text } from '@chakra-ui/react'
import { ProgressBarPct } from '../../ProgressPercent'
import { useAddrBalance } from '../../../requests'

export const AddressRcInfo = ({ addr }: { addr: string }) => {
  const { balance, isLoading } = useAddrBalance(addr)
  return (
    <Card.Root>
      <Card.Header mb={'-4'}>
        <Heading size={'md'} textAlign={'center'}>
          RC Info
        </Heading>
      </Card.Header>
      <Card.Body>
        {!!balance && !!balance.rc && balance.rc.max_rcs > 0 ? (
          <Box>
            <ProgressBarPct val={(100 * balance.rc.amount) / balance.rc.max_rcs} fontSize="lg" height={'10px'} width={'100%'} />
            <Text fontSize={'sm'} mt={'-2'}>
              {balance.rc.amount / 1000} / {balance.rc.max_rcs / 1000}
            </Text>
          </Box>
        ) : isLoading ? (
          <Text>Loading balances...</Text>
        ) : (
          <Text>You have no RCs available. Please deposit HBD to obtain RCs.</Text>
        )}
      </Card.Body>
    </Card.Root>
  )
}
