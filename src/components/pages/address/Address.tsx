import {
  Text,
  Grid,
  Tab,
  Tabs,
  TabList,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Link,
  Tooltip,
  Box,
  Badge
} from '@chakra-ui/react'
import {
  useParams,
  Navigate,
  Link as ReactRouterLink,
  Outlet,
  useOutletContext,
  useLocation,
  useNavigate
} from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageNotFound from '../404'
import { fetchL2AccTxHistory, fetchAccEventHistory, fetchAccInfo } from '../../../requests'
import { abbreviateHash, getNextTabRoute, roundFloat, thousandSeperator, timeAgo } from '../../../helpers'
import { themeColorScheme } from '../../../settings'
import { EventTypeNames } from '../../../types/Payloads'
import Pagination from '../../Pagination'
import { AddressBalanceCard } from './Balances'
import { AddressActivityCard } from './Activity'

const count = 100

export const AddressTxs = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const { data: activity } = useQuery({
    queryKey: ['vsc-address-activity', addr],
    queryFn: async () => fetchAccInfo(addr)
  })
  const lastNonce = (activity?.tx_count || 0) - (pageNum - 1) * count
  const { data: txs } = useQuery({
    queryKey: ['vsc-address-tx-history', addr, count, lastNonce],
    queryFn: async () => fetchL2AccTxHistory(addr, count, lastNonce),
    staleTime: 60000
  })
  return (
    <Box>
      <TableContainer mb={'4'}>
        <Table>
          <Thead>
            <Tr>
              <Th>Transaction ID</Th>
              <Th>Age</Th>
              <Th>Block</Th>
              <Th>Method</Th>
              <Th>To Address</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(txs || []).map((tx, i) => {
              const to = tx.tx_type === 'call_contract' ? tx.details.contract_id : tx.details.to
              return (
                <Tr key={i}>
                  <Td>
                    <Tooltip label={tx.id} placement={'top'}>
                      <Link as={ReactRouterLink} to={'/vsc-tx/' + tx.id}>
                        {abbreviateHash(tx.id, 25, 0)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={tx.ts} placement={'top'}>
                      {timeAgo(tx.ts)}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/block/' + tx.block_num}>
                      {thousandSeperator(tx.block_num)}
                    </Link>
                  </Td>
                  <Td>{tx.tx_type === 'call_contract' ? abbreviateHash(tx.details.action, 20, 0) : tx.tx_type}</Td>
                  <Td>
                    <Link as={ReactRouterLink} to={(tx.tx_type === 'call_contract' ? '/contract/' : '/address/') + to}>
                      {abbreviateHash(to, 25, 0)}
                    </Link>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination
        path={`/address/${addr}/txs`}
        currentPageNum={pageNum || 1}
        maxPageNum={Math.ceil((activity?.tx_count || 0) / count)}
      />
    </Box>
  )
}

export const AddressEvents = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const { data: activity } = useQuery({
    queryKey: ['vsc-address-activity', addr],
    queryFn: async () => fetchAccInfo(addr)
  })
  const lastNonce = (activity?.event_count || 0) - (pageNum - 1) * count
  const { data: events } = useQuery({
    queryKey: ['vsc-address-event-history', addr, count, lastNonce],
    queryFn: async () => fetchAccEventHistory(addr, count, lastNonce),
    staleTime: 60000
  })
  return (
    <Box>
      <TableContainer mb={'4'}>
        <Table>
          <Thead>
            <Tr>
              <Th>Transaction ID</Th>
              <Th>Age</Th>
              <Th>Block</Th>
              <Th>Type</Th>
              <Th>Event CID</Th>
              <Th></Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(events || []).map((evt, i) => {
              return (
                <Tr key={i}>
                  <Td>
                    <Tooltip label={evt.id} placement={'top'}>
                      <Link as={ReactRouterLink} to={'/vsc-tx/' + evt.id}>
                        {abbreviateHash(evt.id, 25, 0)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={evt.ts} placement={'top'}>
                      {timeAgo(evt.ts)}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Link as={ReactRouterLink} to={'/block/' + evt.block_num}>
                      {thousandSeperator(evt.block_num)}
                    </Link>
                  </Td>
                  <Td>
                    <Badge colorScheme={themeColorScheme}>{EventTypeNames[evt.event.t]}</Badge>
                  </Td>
                  <Td>
                    <Tooltip label={evt.event_cid} placement={'top'}>
                      <Link as={ReactRouterLink} to={'/event/' + evt.event_cid}>
                        {abbreviateHash(evt.id, 25, 0)}
                      </Link>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Badge colorScheme={evt.event.amt < 0 ? 'red' : 'green'} minW={'10'} textAlign={'center'}>
                      {evt.event.amt < 0 ? 'OUT' : 'IN'}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    {roundFloat(Math.abs(evt.event.amt / 1000), 3)} {evt.event.tk}
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination
        path={`/address/${addr}/events`}
        currentPageNum={pageNum || 1}
        maxPageNum={Math.ceil((activity?.event_count || 0) / count)}
      />
    </Box>
  )
}

const tabNames = ['txs', 'events']

export const Address = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { addr } = useParams()
  const isL1 = addr!.startsWith('hive:')
  const validAddr = isL1 || addr!.startsWith('did:')
  const segments = pathname.split('/')
  const tabIndex = tabNames.indexOf(segments.length >= 4 ? segments[3] : tabNames[0])
  if (!validAddr) return <PageNotFound />
  else if (isL1) return <Navigate to={'/@' + addr!.replace('hive:', '')} replace />
  return (
    <>
      <Text fontSize={'5xl'}>Address</Text>
      <Text fontSize={'2xl'} opacity={'0.7'} mb={'4'}>
        {addr}
      </Text>
      <hr />
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={'5'} mt={'4'}>
        <AddressBalanceCard addr={addr!} />
        <AddressActivityCard addr={addr!} />
      </Grid>
      <Tabs
        mt={'7'}
        variant={'solid-rounded'}
        index={tabIndex}
        onChange={(newIdx: number) => navigate(getNextTabRoute(tabNames, segments, newIdx), { preventScrollReset: true })}
      >
        <TabList>
          <Tab>Transactions</Tab>
          <Tab>Events</Tab>
        </TabList>
        <Box pt={'4'}>
          <Outlet context={{ addr }} />
        </Box>
      </Tabs>
    </>
  )
}
