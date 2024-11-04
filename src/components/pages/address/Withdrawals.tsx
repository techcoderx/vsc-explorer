import { Box, Link, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tooltip, Badge } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useOutletContext, useParams, Link as ReactRouterLink } from 'react-router-dom'
import Pagination from '../../Pagination'
import { fetchAccInfo, fetchWithdrawReqsByAddr } from '../../../requests'
import { abbreviateHash, timeAgo, thousandSeperator } from '../../../helpers'
import { themeColorScheme } from '../../../settings'

const count = 100

export const AddressWithdrawals = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const { data: activity } = useQuery({
    queryKey: ['vsc-address-activity', addr],
    queryFn: async () => fetchAccInfo(addr)
  })
  const lastNonce = (activity?.withdraw_req_count || 0) - (pageNum - 1) * count
  const { data: txs } = useQuery({
    queryKey: ['vsc-address-withdrawals', addr, count, lastNonce],
    queryFn: async () => fetchWithdrawReqsByAddr(addr, count, lastNonce),
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
              <Th>To User</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(txs || []).map((tx, i) => {
              return (
                <Tr key={i}>
                  <Td>
                    <Tooltip label={tx.tx_hash} placement={'top'}>
                      <Link as={ReactRouterLink} to={'/vsc-tx/' + tx.tx_hash}>
                        {abbreviateHash(tx.tx_hash, 25, 0)}
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
                  <Td>
                    <Link as={ReactRouterLink} to={'/@' + tx.to}>
                      {tx.to}
                    </Link>
                  </Td>
                  <Td>{tx.amount}</Td>
                  <Td>
                    <Badge colorScheme={themeColorScheme}>{tx.status}</Badge>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination
        path={`/address/${addr}/withdrawals`}
        currentPageNum={pageNum || 1}
        maxPageNum={Math.ceil((activity?.withdraw_req_count || 0) / count)}
      />
    </Box>
  )
}
