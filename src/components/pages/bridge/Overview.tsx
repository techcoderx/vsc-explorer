import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Skeleton,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  TableContainer,
  Table,
  Th,
  Tr,
  Td,
  Text,
  Thead,
  Tbody,
  Tooltip,
  CardFooter,
  Button
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Link as ReactRouterLink } from 'react-router'
import { fetchL1Rest, fetchLatestBridgeTxs, getBridgeTxCounts } from '../../../requests'
import { multisigAccount, themeColorScheme } from '../../../settings'
import { L1Balance } from '../../../types/L1ApiResult'
import { fmtmAmount, thousandSeperator, timeAgo } from '../../../helpers'
import { LedgerActions, LedgerTx } from '../../../types/L2ApiResult'
import { AccountLink, TxLink } from '../../TableLink'

const cardBorder = '1.5px solid rgb(255,255,255,0.16)'
const cardBorderLight = '1.5px solid #e2e8f0'

const BridgeTxsTable = ({ txs }: { txs?: (LedgerTx<'deposit'> | LedgerActions<'withdraw'>)[] }) => {
  return (
    <TableContainer>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th>Tx ID</Th>
            <Th>Age</Th>
            <Th>To User</Th>
            <Th>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {txs?.map((tx, i) => (
            <BridgeTxRow key={i} tx={tx} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

const BridgeTxRow = ({ tx }: { tx: LedgerTx<'deposit'> | LedgerActions<'withdraw'> }) => {
  return (
    <Tr _dark={{ borderTop: cardBorder }} _light={{ borderTop: cardBorderLight }}>
      <Td>
        <TxLink val={tx.id} truncate={10} />
      </Td>
      <Td>
        <Tooltip label={tx.timestamp} placement={'top'}>
          {timeAgo(tx.timestamp + 'Z')}
        </Tooltip>
      </Td>
      <Td>
        <AccountLink val={tx.to} tooltip={true} />
      </Td>
      <Td>{fmtmAmount(tx.amount, tx.asset)}</Td>
    </Tr>
  )
}

const HiveBridgeOverview = () => {
  const { data: l1Acc } = useQuery({
    queryKey: ['hive-account', multisigAccount],
    queryFn: async () => fetchL1Rest<L1Balance>(`/balance-api/accounts/${multisigAccount}/balances`)
  })
  const { data: tally } = useQuery({ queryKey: ['vsc-bridge-tx-count'], queryFn: async () => getBridgeTxCounts() })
  const { data } = useQuery({
    queryKey: ['vsc-latest-bridge-txs'],
    queryFn: async () => fetchLatestBridgeTxs()
  })
  return (
    <>
      <Text fontSize={'5xl'}>Hive Asset Mapping Overview</Text>
      <hr />
      <br />
      <Card mb={'4'}>
        <CardBody>
          <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
            <Stat>
              <StatLabel>HIVE TVL</StatLabel>
              <StatNumber>
                {!!l1Acc ? (
                  fmtmAmount(l1Acc.hive_balance + l1Acc.hive_savings + parseInt(l1Acc.vesting_balance_hive), 'HIVE')
                ) : (
                  <Skeleton height={'20px'} maxW={'40px'} />
                )}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>HBD TVL</StatLabel>
              <StatNumber>
                {!!l1Acc ? fmtmAmount(l1Acc.hbd_balance + l1Acc.hbd_savings, 'HBD') : <Skeleton height={'20px'} maxW={'40px'} />}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Map Txs</StatLabel>
              <StatNumber>{!!tally ? thousandSeperator(tally.deposits) : <Skeleton height={'20px'} maxW={'40px'} />}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Unmap Txs</StatLabel>
              <StatNumber>
                {!!tally ? thousandSeperator(tally.withdrawals) : <Skeleton height={'20px'} maxW={'40px'} />}
              </StatNumber>
            </Stat>
          </Stack>
        </CardBody>
      </Card>
      <hr />
      <Stack direction={{ base: 'column', xl: 'row' }} justifyContent={'space-between'} mt={'4'} spacing={'4'}>
        <Card width={'100%'}>
          <CardHeader>
            <Heading fontSize={'2xl'}>Latest Maps</Heading>
          </CardHeader>
          <CardBody padding={'0'}>
            <BridgeTxsTable txs={data?.deposits || []} />
          </CardBody>
          <CardFooter paddingTop={'3'}>
            <Button as={ReactRouterLink} to={'/bridge/hive/deposits'} colorScheme={themeColorScheme}>
              View More
            </Button>
          </CardFooter>
        </Card>
        <Card width={'100%'}>
          <CardHeader>
            <Heading fontSize={'2xl'}>Latest Unmaps</Heading>
          </CardHeader>
          <CardBody padding={'0'}>
            <BridgeTxsTable txs={data?.withdrawals || []} />
          </CardBody>
          <CardFooter paddingTop={'3'}>
            <Button as={ReactRouterLink} to={'/bridge/hive/withdrawals'} colorScheme={themeColorScheme}>
              View More
            </Button>
          </CardFooter>
        </Card>
      </Stack>
    </>
  )
}

export default HiveBridgeOverview
