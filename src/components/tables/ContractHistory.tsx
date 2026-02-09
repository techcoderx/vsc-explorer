import { Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tooltip, Tr } from '@chakra-ui/react'
import { Contract } from '../../types/L2ApiResult'
import { AccountLink, TxLink } from '../TableLink'
import { abbreviateHash, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'

export const ContractHistoryTbl = ({ history }: { history: Contract[] }) => {
  return (
    <TableContainer my={'3'}>
      <Table>
        <Thead>
          <Tr>
            <Th>Transaction ID</Th>
            <Th>Age</Th>
            <Th>Deployer</Th>
            <Th>Owner</Th>
            <Th>Code</Th>
          </Tr>
        </Thead>
        <Tbody>
          {history.map((h, i) => (
            <Tr key={i}>
              <Td>
                <TxLink val={h.tx_id} />
              </Td>
              <Td>
                <Tooltip placement="top" label={h.creation_ts}>
                  {timeAgo(h.creation_ts)}
                </Tooltip>
              </Td>
              <Td>
                <AccountLink val={h.creator} />
              </Td>
              <Td>
                <AccountLink val={h.owner} />
              </Td>
              <Td>
                <Tooltip placement="top" label={h.code}>
                  {i === 0 ? (
                    <Tag variant={'outline'} colorScheme={themeColorScheme}>
                      Latest
                    </Tag>
                  ) : (
                    abbreviateHash(h.code, 20, 0)
                  )}
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
