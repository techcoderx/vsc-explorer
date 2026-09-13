import { Flex, Table, Tag } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Contract } from '../../types/L2ApiResult'
import { AccountLink, TxLink } from '../TableLink'
import { abbreviateHash, timeAgo } from '../../helpers'
import { themeColorScheme } from '../../settings'
import { Tooltip } from '../ui/tooltip'

export const ContractHistoryTbl = ({
  history,
  pending = [],
  activeTxId
}: {
  history: Contract[]
  pending?: Contract[]
  activeTxId?: string
}) => {
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
          {pending.map((p, i) => (
            <Table.Row key={'p' + i}>
              <Table.Cell>
                <TxLink val={p.tx_id} />
              </Table.Cell>
              <Table.Cell>
                <Tooltip positioning={{ placement: 'top' }} content={p.creation_ts}>
                  {timeAgo(p.creation_ts)}
                </Tooltip>
              </Table.Cell>
              <Table.Cell>
                <AccountLink val={p.creator} />
              </Table.Cell>
              <Table.Cell>
                <AccountLink val={p.owner} />
              </Table.Cell>
              <Table.Cell>
                <Flex align={'center'} gap={'2'}>
                  <Tooltip positioning={{ placement: 'top' }} content={p.code}>
                    {abbreviateHash(p.code, 20, 0)}
                  </Tooltip>
                  <Tooltip positioning={{ placement: 'top' }} content={p.activation_ts}>
                    <Tag.Root variant={'outline'} colorPalette={'yellow'}>
                      {t('contractHistory.pending')}
                    </Tag.Root>
                  </Tooltip>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
          {history.map((h, i) => (
            <Table.Row key={'h' + i}>
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
                  {h.tx_id === activeTxId || (activeTxId === undefined && i === 0) ? (
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
