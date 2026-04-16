import { Box, Tabs, Table, Text } from '@chakra-ui/react'
import { useOutletContext } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAddrBalance } from '../../../requests'
import { useBtcBalanceByAccount } from '../../../hasuraRequests'
import { fmtmAmount, formatSats } from '../../../helpers'
import { themeColorScheme } from '../../../settings'
import { TokensTable } from './TokenBalances'
import { useMarketPrices, formatCurrencyValue } from '../../../marketData'

const NativeAssetsTable = ({ addr }: { addr: string }) => {
  const { t } = useTranslation('pages')
  const { balance, isLoading: nativeLoading } = useAddrBalance(addr)
  const { data: btcBalance, isLoading: btcLoading } = useBtcBalanceByAccount(addr)
  const { prices, currency, isLoading: pricesLoading } = useMarketPrices()
  const isLoading = nativeLoading || btcLoading

  const rows: { label: string; value: string; fiatValue: number }[] = []
  if (balance?.bal) {
    rows.push({
      label: t('balances.hive'),
      value: fmtmAmount(balance.bal.hive || 0, 'hive'),
      fiatValue: (balance.bal.hive || 0) / 1000 * (prices.hive ?? 0)
    })
    rows.push({
      label: t('balances.hbd'),
      value: fmtmAmount(balance.bal.hbd || 0, 'hbd'),
      fiatValue: (balance.bal.hbd || 0) / 1000 * (prices.hbd ?? 0)
    })
    rows.push({
      label: t('balances.liquidStakedHbd'),
      value: fmtmAmount(balance.bal.hbd_savings || 0, 'hbd'),
      fiatValue: (balance.bal.hbd_savings || 0) / 1000 * (prices.hbd ?? 0)
    })
    if (balance.bal.pending_hbd_unstaking > 0) {
      rows.push({
        label: t('balances.hbdUnstaking'),
        value: fmtmAmount(balance.bal.pending_hbd_unstaking, 'hbd'),
        fiatValue: balance.bal.pending_hbd_unstaking / 1000 * (prices.hbd ?? 0)
      })
    }
    if (balance.bal.hive_consensus > 0) {
      rows.push({
        label: t('balances.consensusStake'),
        value: fmtmAmount(balance.bal.hive_consensus, 'hive'),
        fiatValue: balance.bal.hive_consensus / 1000 * (prices.hive ?? 0)
      })
    }
    if (balance.bal.consensus_unstaking > 0) {
      rows.push({
        label: t('balances.consensusUnstaking'),
        value: fmtmAmount(balance.bal.consensus_unstaking, 'hive'),
        fiatValue: balance.bal.consensus_unstaking / 1000 * (prices.hive ?? 0)
      })
    }
  }
  if (btcBalance && parseInt(btcBalance.balance_sats) > 0) {
    rows.push({
      label: t('balancesTab.btc'),
      value: formatSats(btcBalance.balance_sats),
      fiatValue: parseInt(btcBalance.balance_sats) / 1e8 * (prices.btc ?? 0)
    })
  }

  rows.sort((a, b) => b.fiatValue - a.fiatValue)

  const showValueColumn = !pricesLoading && (prices.hive !== undefined || prices.btc !== undefined)

  return (
    <Box>
      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('balancesTab.asset')}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('balancesTab.balance')}</Table.ColumnHeader>
              {showValueColumn && <Table.ColumnHeader>{t('balancesTab.value')}</Table.ColumnHeader>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? null : rows.length ? (
              rows.map((row, i) => (
                <Table.Row key={i}>
                  <Table.Cell>{row.label}</Table.Cell>
                  <Table.Cell>{row.value}</Table.Cell>
                  {showValueColumn && (
                    <Table.Cell>
                      {row.fiatValue > 0 ? formatCurrencyValue(row.fiatValue, currency) : '-'}
                    </Table.Cell>
                  )}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={showValueColumn ? 3 : 2}>
                  <Text opacity="0.6">{t('balancesTab.noNativeBalances')}</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  )
}

export const AddressBalances = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { t } = useTranslation('pages')

  return (
    <Tabs.Root defaultValue="native" colorPalette={themeColorScheme} variant="line" mt="3">
      <Tabs.List>
        <Tabs.Trigger value="native">{t('balancesTab.nativeAssets')}</Tabs.Trigger>
        <Tabs.Trigger value="tokens">{t('balancesTab.tokens')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="native">
        <NativeAssetsTable addr={addr} />
      </Tabs.Content>
      <Tabs.Content value="tokens">
        <TokensTable addr={addr} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
