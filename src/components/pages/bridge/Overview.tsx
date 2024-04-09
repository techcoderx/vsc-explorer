import { Card, CardBody, CardHeader, Heading, Link, Skeleton, Stack, Stat, StatLabel, StatNumber, Table, Th, Tr, Td, Text, Thead, Tbody, Tooltip, CardFooter, Button } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Link as ReactRouterLink } from 'react-router-dom'
import { fetchL1, fetchLatestDepositsHive, fetchLatestWithdrawalsHive } from '../../../requests'
import { multisigAccount, themeColorScheme } from '../../../settings'
import { L1Account } from '../../../types/L1ApiResult'
import { thousandSeperator, timeAgo } from '../../../helpers'
import { HiveBridgeTx } from '../../../types/HafApiResult'

const cardBorder = '1.5px solid rgb(255,255,255,0.16)'
const cardBorderLight = '1.5px solid #e2e8f0'

const BridgeTxsTable = ({txs}: { txs?: HiveBridgeTx[]}) => {
  return (
    <Table variant={'simple'}>
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>Age</Th>
          <Th>To User</Th>
          <Th>Amount</Th>
        </Tr>
      </Thead>
      <Tbody>
        {txs?.map((tx, i) => (
          <Tr key={i} _dark={{borderTop: cardBorder}} _light={{borderTop: cardBorderLight}}>
            <Td><Link as={ReactRouterLink} to={'/tx/'+tx.in_op}>{tx.id}</Link></Td>
            <Td>
              <Tooltip label={tx.ts} placement={'top'}>{timeAgo(tx.ts)}</Tooltip>
            </Td>
            <Td><Link as={ReactRouterLink} to={'/@'+tx.username}>{tx.username}</Link></Td>
            <Td>{thousandSeperator(tx.amount)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

const HiveBridgeOverview = () => {
  const { data: l1Acc, isSuccess: isL1AccSuccess } = useQuery({
    cacheTime: 15000,
    queryKey: ['hive-account', multisigAccount],
    queryFn: async () => fetchL1<L1Account[]>('condenser_api.get_accounts', [[multisigAccount]])
  })
  const { data: deposits, isSuccess: isDepSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-list-deposits-hive', null, 10],
    queryFn: async () => fetchLatestDepositsHive(null, 10)
  })
  const { data: withdrawals, isSuccess: isWithdSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-list-withdrawals-hive', null, 10],
    queryFn: async () => fetchLatestWithdrawalsHive(null, 10)
  })
  return (
    <>
      <Text fontSize={'5xl'}>Hive Bridge Overview</Text>
      <hr/><br/>
      <Card mb={'4'}>
        <CardBody>
          <Stack direction={{base: 'column', md: 'row'}} justifyContent={'space-between'}>
            <Stat>
              <StatLabel>HIVE TVL</StatLabel>
              <StatNumber>
                {
                  isL1AccSuccess && !l1Acc.error
                  ? thousandSeperator((parseFloat(l1Acc.result[0].balance)+parseFloat(l1Acc.result[0].savings_balance)).toFixed(3))+' HIVE'
                  : <Skeleton height={'20px'} maxW={'40px'}/>
                }
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>HBD TVL</StatLabel>
              <StatNumber>
                {
                  isL1AccSuccess && !l1Acc.error
                  ? thousandSeperator((parseFloat(l1Acc.result[0].hbd_balance)+parseFloat(l1Acc.result[0].savings_hbd_balance)).toFixed(3))+' HBD'
                  : <Skeleton height={'20px'} maxW={'40px'}/>
                }
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Deposit Txs</StatLabel>
              <StatNumber>
                { isDepSuccess
                  ? thousandSeperator(deposits.length > 0 ? deposits[0].id : 0)
                  : <Skeleton height={'20px'} maxW={'40px'}/>
                }
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Withdrawal Txs</StatLabel>
              <StatNumber>
                { isWithdSuccess
                  ? thousandSeperator(withdrawals.length > 0 ? withdrawals[0].id : 0)
                  : <Skeleton height={'20px'} maxW={'40px'}/>
                }
              </StatNumber>
            </Stat>
          </Stack>
        </CardBody>
      </Card>
      <hr/>
      <Stack direction={{base: 'column', xl: 'row'}} justifyContent={'space-between'} mt={'4'} spacing={'4'}>
        <Card width={'100%'}>
          <CardHeader><Heading fontSize={'2xl'}>Latest Deposits</Heading></CardHeader>
          <CardBody padding={'0'}>
            <BridgeTxsTable txs={deposits}/>
          </CardBody>
          <CardFooter paddingTop={'3'}>
            <Button as={ReactRouterLink} to={'/bridge/hive/deposits'} colorScheme={themeColorScheme}>View More</Button>
          </CardFooter>
        </Card>
        <Card width={'100%'}>
          <CardHeader><Heading fontSize={'2xl'}>Latest Withdrawals</Heading></CardHeader>
          <CardBody padding={'0'}>
            <BridgeTxsTable txs={withdrawals}/>
          </CardBody>
          <CardFooter paddingTop={'3'}>
            <Button as={ReactRouterLink} to={'/bridge/hive/withdrawals'} colorScheme={themeColorScheme}>View More</Button>
          </CardFooter>
        </Card>
      </Stack>
    </>
  )
}

export default HiveBridgeOverview