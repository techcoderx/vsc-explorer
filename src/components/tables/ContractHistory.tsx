import { Table, Tag } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Contract } from '../../types/L2ApiResult'
import { AccountLink, TxLink } from '../TableLink'
import { abbreviateHash, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'
import { Tooltip } from '../ui/tooltip'

export const ContractHistoryTbl = ({ history }: { history: Contract[] }) => {
  const { t } = useTranslation('tables')
  return (
    <Table.ScrollArea my={'3'}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t('contractHistory.txId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('contractHistory.age')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('contractHistory.deployer')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('contractHistory.owner')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('contractHistory.code')}</Table.ColumnHeader>
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
                      {t('contractHistory.latest')}
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
