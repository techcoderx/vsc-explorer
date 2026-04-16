import { Stack, Card, Stat, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { fmtmAmount } from '../../../helpers'
import { useAddrBalance } from '../../../requests'
import { useMarketPrices, formatCurrencyValue } from '../../../marketData'

export const AddressBalanceCard = ({ addr }: { addr: string }) => {
  const { t } = useTranslation('pages')
  const { balance } = useAddrBalance(addr)
  const { prices, currency } = useMarketPrices()
  return (
    <Card.Root>
      <Card.Body>
        <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
          <Stat.Root my={'auto'}>
            <Stat.Label>{t('balances.hive')}</Stat.Label>
            <Stat.ValueText>{fmtmAmount(balance?.bal?.hive || 0, 'hive')}</Stat.ValueText>
            {prices.hive !== undefined && (
              <Text fontSize="sm" opacity={0.7}>≈ {formatCurrencyValue((balance?.bal?.hive || 0) / 1000 * prices.hive, currency)}</Text>
            )}
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>{t('balances.hbd')}</Stat.Label>
            <Stat.ValueText>{fmtmAmount(balance?.bal?.hbd || 0, 'hbd')}</Stat.ValueText>
            {prices.hbd !== undefined && (
              <Text fontSize="sm" opacity={0.7}>≈ {formatCurrencyValue((balance?.bal?.hbd || 0) / 1000 * prices.hbd, currency)}</Text>
            )}
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>{t('balances.liquidStakedHbd')}</Stat.Label>
            <Stat.ValueText>{fmtmAmount(balance?.bal?.hbd_savings || 0, 'hbd')}</Stat.ValueText>
            {prices.hbd !== undefined && (
              <Text fontSize="sm" opacity={0.7}>≈ {formatCurrencyValue((balance?.bal?.hbd_savings || 0) / 1000 * prices.hbd, currency)}</Text>
            )}
          </Stat.Root>
          {balance && balance.bal && balance.bal.pending_hbd_unstaking > 0 && (
            <Stat.Root>
              <Stat.Label>{t('balances.hbdUnstaking')}</Stat.Label>
              <Stat.ValueText>{fmtmAmount(balance.bal.pending_hbd_unstaking, 'hbd')}</Stat.ValueText>
              {prices.hbd !== undefined && (
                <Text fontSize="sm" opacity={0.7}>≈ {formatCurrencyValue(balance.bal.pending_hbd_unstaking / 1000 * prices.hbd, currency)}</Text>
              )}
            </Stat.Root>
          )}
          {balance && balance.bal && balance.bal?.hive_consensus > 0 && (
            <Stat.Root>
              <Stat.Label>{t('balances.consensusStake')}</Stat.Label>
              <Stat.ValueText>{fmtmAmount(balance.bal.hive_consensus, 'hive')}</Stat.ValueText>
              {prices.hive !== undefined && (
                <Text fontSize="sm" opacity={0.7}>≈ {formatCurrencyValue(balance.bal.hive_consensus / 1000 * prices.hive, currency)}</Text>
              )}
            </Stat.Root>
          )}
          {balance && balance.bal && balance.bal.consensus_unstaking > 0 && (
            <Stat.Root>
              <Stat.Label>{t('balances.consensusUnstaking')}</Stat.Label>
              <Stat.ValueText>{fmtmAmount(balance.bal.consensus_unstaking, 'hive')}</Stat.ValueText>
              {prices.hive !== undefined && (
                <Text fontSize="sm" opacity={0.7}>≈ {formatCurrencyValue(balance.bal.consensus_unstaking / 1000 * prices.hive, currency)}</Text>
              )}
            </Stat.Root>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
