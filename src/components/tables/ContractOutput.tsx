import { Link, Table, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { ContractOutput } from '../../types/L2ApiResult'
import { abbreviateHash, timeAgo } from '../../helpers'
import { CheckXIcon } from '../CheckXIcon'
import { ContractLink, TxLink } from '../TableLink'

export const ContractOutputTbl = ({ outputs }: { outputs: ContractOutput[] }) => {
  return (
    <TableContainer my={'3'} w={'full'}>
      <Table>
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Id</Th>
            <Th>Age</Th>
            <Th>Contract ID</Th>
            <Th>Input Tx</Th>
            <Th>Output</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(outputs) &&
            outputs.map((out, i) =>
              out.inputs.map((input, j) => (
                <Tr key={`${i}-${j}`}>
                  <Td>
                    <CheckXIcon ok={out.results[j].ok} />
                  </Td>
                  <Td>
                    {j === 0 ? (
                      <Link as={ReactRouterLink} to={`/tools/dag?cid=${out.id}`}>
                        <Tooltip placement="top" label={out.id}>
                          {abbreviateHash(out.id, 20, 0)}
                        </Tooltip>
                      </Link>
                    ) : null}
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    {j === 0 ? (
                      <Tooltip label={out.timestamp} placement="top">
                        {timeAgo(out.timestamp)}
                      </Tooltip>
                    ) : null}
                  </Td>
                  <Td>{j === 0 ? <ContractLink val={out.contract_id} tooltip /> : null}</Td>
                  <Td>
                    <TxLink val={input.split('-')[0]} tooltip />
                  </Td>
                  <Td>
                    <Tooltip placement="top" label={out.results[j].ret}>
                      {abbreviateHash(out.results[j].ret, 15, 0)}
                    </Tooltip>
                  </Td>
                </Tr>
              ))
            )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
