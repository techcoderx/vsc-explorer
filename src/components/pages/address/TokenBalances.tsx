import { Box, Table, Text } from '@chakra-ui/react'
import { useOutletContext } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useTokenBalancesByAccount } from '../../../hasuraRequests'
import { formatTokenAmount } from '../../../helpers'
import { ContractLink } from '../../TableLink'

export const AddressTokenBalances = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { t } = useTranslation('tables')
  const { data: balances, isLoading } = useTokenBalancesByAccount(addr)
  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('tokens.contractId')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.balance')}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? null : balances?.length ? (
              balances.map((bal, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <ContractLink val={bal.contract_id} truncate={20} />
                  </Table.Cell>
                  <Table.Cell>{formatTokenAmount(bal.balance, 0)}</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={2}>
                  <Text opacity="0.6">{t('tokens.noBalances')}</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  )
}
