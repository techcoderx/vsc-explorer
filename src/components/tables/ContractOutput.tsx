import { Link, Table } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { ContractOutput } from '../../types/L2ApiResult'
import { abbreviateHash, timeAgo } from '../../helpers'
import { CheckXIcon } from '../CheckXIcon'
import { ContractLink, TxLink } from '../TableLink'
import { Tooltip } from '../ui/tooltip'

export const ContractOutputTbl = ({ outputs }: { outputs: ContractOutput[] }) => {
  return (
    <Table.ScrollArea my={'3'} w={'full'}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>Id</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Contract ID</Table.ColumnHeader>
            <Table.ColumnHeader>Input Tx</Table.ColumnHeader>
            <Table.ColumnHeader>Output</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.isArray(outputs) &&
            outputs.map((out, i) =>
              out.inputs.map((input, j) => (
                <Table.Row key={`${i}-${j}`}>
                  <Table.Cell>
                    <CheckXIcon ok={out.results[j].ok} />
                  </Table.Cell>
                  <Table.Cell>
                    {j === 0 ? (
                      <Link asChild>
                        <ReactRouterLink to={`/tools/dag?cid=${out.id}`}>
                          <Tooltip positioning={{ placement: 'top' }} content={out.id}>
                            {abbreviateHash(out.id, 20, 0)}
                          </Tooltip>
                        </ReactRouterLink>
                      </Link>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    {j === 0 ? (
                      <Tooltip content={out.timestamp} positioning={{ placement: 'top' }}>
                        {timeAgo(out.timestamp)}
                      </Tooltip>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell>{j === 0 ? <ContractLink val={out.contract_id} /> : null}</Table.Cell>
                  <Table.Cell>
                    <TxLink val={input.split('-')[0]} />
                  </Table.Cell>
                  <Table.Cell>
                    <Tooltip positioning={{ placement: 'top' }} content={out.results[j].ret}>
                      {abbreviateHash(out.results[j].ret, 15, 0)}
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
