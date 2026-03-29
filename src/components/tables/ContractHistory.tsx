import { Table, Tag } from '@chakra-ui/react'
import { Contract } from '../../types/L2ApiResult'
import { AccountLink, TxLink } from '../TableLink'
import { abbreviateHash, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'
import { Tooltip } from '../ui/tooltip'

export const ContractHistoryTbl = ({ history }: { history: Contract[] }) => {
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Transaction ID</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Deployer</Table.ColumnHeader>
            <Table.ColumnHeader>Owner</Table.ColumnHeader>
            <Table.ColumnHeader>Code</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {history.map((h, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <TxLink val={h.tx_id} />
              </Table.Cell>
              <Table.Cell>
                <Tooltip positioning={{ placement: 'top' }} content={h.creation_ts}>
                  {timeAgo(h.creation_ts)}
                </Tooltip>
              </Table.Cell>
              <Table.Cell>
                <AccountLink val={h.creator} />
              </Table.Cell>
              <Table.Cell>
                <AccountLink val={h.owner} />
              </Table.Cell>
              <Table.Cell>
                <Tooltip positioning={{ placement: 'top' }} content={h.code}>
                  {i === 0 ? (
                    <Tag.Root variant={'outline'} colorPalette={themeColorScheme}>
                      Latest
                    </Tag.Root>
                  ) : (
                    abbreviateHash(h.code, 20, 0)
                  )}
                </Tooltip>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
