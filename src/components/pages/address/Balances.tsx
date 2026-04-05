import { Stack, Card, Heading, Stat } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { fmtmAmount } from '../../../helpers'
import { useAddrBalance } from '../../../requests'

export const AddressBalanceCard = ({ addr }: { addr: string }) => {
  const { t } = useTranslation('pages')
  const { balance } = useAddrBalance(addr)
  return (
    <Card.Root>
      <Card.Header mb={'-6'}>
        <Heading size={'md'}>{t('balances.title')}</Heading>
      </Card.Header>
      <Card.Body>
        <Stack direction={{ base: 'column', md: 'row' }} justifyContent={'space-between'}>
          <Stat.Root my={'auto'}>
            <Stat.Label>{t('balances.hive')}</Stat.Label>
            <Stat.ValueText>{fmtmAmount(balance?.bal?.hive || 0, 'hive')}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>{t('balances.hbd')}</Stat.Label>
            <Stat.ValueText>{fmtmAmount(balance?.bal?.hbd || 0, 'hbd')}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>{t('balances.liquidStakedHbd')}</Stat.Label>
            <Stat.ValueText>{fmtmAmount(balance?.bal?.hbd_savings || 0, 'hbd')}</Stat.ValueText>
          </Stat.Root>
          {balance && balance.bal && balance.bal.pending_hbd_unstaking > 0 && (
            <Stat.Root>
              <Stat.Label>{t('balances.hbdUnstaking')}</Stat.Label>
              <Stat.ValueText>{fmtmAmount(balance.bal.pending_hbd_unstaking, 'hbd')}</Stat.ValueText>
            </Stat.Root>
          )}
          {balance && balance.bal && balance.bal?.hive_consensus > 0 && (
            <Stat.Root>
              <Stat.Label>{t('balances.consensusStake')}</Stat.Label>
              <Stat.ValueText>{fmtmAmount(balance.bal.hive_consensus, 'hive')}</Stat.ValueText>
            </Stat.Root>
          )}
          {balance && balance.bal && balance.bal.consensus_unstaking > 0 && (
            <Stat.Root>
              <Stat.Label>{t('balances.consensusUnstaking')}</Stat.Label>
              <Stat.ValueText>{fmtmAmount(balance.bal.consensus_unstaking, 'hive')}</Stat.ValueText>
            </Stat.Root>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
