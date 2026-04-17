import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  Center,
  Flex,
  Field,
  Input,
  Link,
  NativeSelect,
  Spinner,
  Stack,
  Text,
  Heading,
  useBreakpointValue
} from '@chakra-ui/react'
import { PageTitle } from '../../PageTitle'
import { useMagi } from '@aioha/providers/magi/react'
import { Asset, Wallet } from '@aioha/magi'
import { VscStakeType } from '@aioha/aioha'
import { AiohaModal, ConnectWalletButton } from '../../Aioha'
import { useState } from 'react'
import { getConf, themeColorScheme } from '../../../settings'
import { TxnTypes } from '../../../types/L2ApiResult'
import { useNavigate } from 'react-router'
import { useAioha } from '@aioha/providers/react'
import { toaster } from '../../ui/toaster'
import { TFunction } from 'i18next'

const getTxTypes = (t: TFunction): [TxnTypes, string][] => [
  ['transfer', t('broadcast.txTypes.transfer')],
  ['deposit', t('broadcast.txTypes.deposit')],
  ['withdraw', t('broadcast.txTypes.withdraw')],
  ['consensus_stake', t('broadcast.txTypes.consensus_stake')],
  ['consensus_unstake', t('broadcast.txTypes.consensus_unstake')],
  ['stake_hbd', t('broadcast.txTypes.stake_hbd')],
  ['unstake_hbd', t('broadcast.txTypes.unstake_hbd')]
]

const assetToEnum: Record<string, Asset> = {
  hive: Asset.hive,
  hbd: Asset.hbd,
  hbd_savings: Asset.shbd
}

export const Broadcast = () => {
  const { t } = useTranslation('tools')
  const txTypes = getTxTypes(t)
  const { magi, user, wallet } = useMagi()
  const { aioha } = useAioha()
  const [walletOpen, setWalletOpen] = useState(false)
  const [txType, setTxType] = useState<TxnTypes>('transfer')
  const [dest, setDest] = useState<string>('')
  const [amt, setAmt] = useState<string>('')
  const [asset, setAsset] = useState<string>('hive')
  const [memo, setMemo] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const navigate = useNavigate()
  const submitClicked = async () => {
    const to = !!dest ? dest : magi.getUser(true)!
    const amount = parseFloat(amt || '')
    if (isNaN(amount) || amount <= 0) {
      return toaster.error({ title: t('broadcast.errors.amountPositive') })
    }
    if (txType === 'deposit' && asset === 'hbd_savings') {
      return toaster.error({ title: t('broadcast.errors.depositAsset') })
    }
    const currency = assetToEnum[asset]
    setIsSpinning(true)
    let result
    switch (txType) {
      case 'deposit':
        if (wallet !== Wallet.Hive) {
          return toaster.error({ title: t('broadcast.errors.hiveWalletOnly') })
        }
        result = await aioha.transfer(
          getConf().msAccount,
          amount,
          //@ts-expect-error - incorrect type signature in aioha transfer
          asset.toUpperCase() as Asset,
          'to=' + to.replace('hive:', '').replace('did:pkh:eip155:1:', '')
        )
        break
      case 'transfer':
        result = await magi.transfer(to, amount, currency, memo)
        break
      case 'withdraw':
        result = await magi.unmap(to, amount, currency, memo)
        break
      case 'consensus_stake':
        result = await magi.stake(VscStakeType.Consensus, amount, to, memo)
        break
      case 'consensus_unstake':
        result = await magi.unstake(VscStakeType.Consensus, amount, to, memo)
        break
      case 'stake_hbd':
        result = await magi.stake(VscStakeType.HBD, amount, to, memo)
        break
      case 'unstake_hbd':
        result = await magi.unstake(VscStakeType.HBD, amount, to, memo)
        break
      default:
        setIsSpinning(false)
        return toaster.error({ title: t('broadcast.errors.unknownType') })
    }
    setIsSpinning(false)
    if (!result.success) {
      return toaster.error({ title: result.error })
    } else {
      return toaster.success({
        title: t('txBroadcastSuccess', { ns: 'common' }),
        description: (
          <Link
            onClick={(evt) => {
              evt.preventDefault()
              navigate('/tx/' + result.result)
            }}
          >
            {t('viewTransaction', { ns: 'common' })}
          </Link>
        )
      })
    }
  }
  return (
    <>
      <PageTitle title="Broadcast Transaction" />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('broadcast.title')}</Heading>
      <Text mb={'6'}>{t('broadcast.description')}</Text>
      <Center>
        <Stack direction="column" gap={'6'} maxW={'4xl'} w={'100%'}>
          <Card.Root>
            <Card.Body>
              <Stack direction={'column'} gap={'3'} mb={'5'}>
                <Field.Root>
                  <Field.Label>{t('form.username', { ns: 'common' })}</Field.Label>
                  <ConnectWalletButton onClick={() => setWalletOpen(true)} />
                </Field.Root>
                <Field.Root>
                  <Field.Label>{t('form.type', { ns: 'common' })}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
            
                      value={txType}
                      onChange={(e) => setTxType(e.target.value as TxnTypes)}
                    >
                      {txTypes.map((t, i) => (
                        <option key={i} value={t[0]}>
                          {t[1]}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>{t('broadcast.destAddress')}</Field.Label>
                  <Input

                    type="text"
                    placeholder={t('broadcast.destPlaceholder')}
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>{t('form.amount', { ns: 'common' })}</Field.Label>
                  <Stack direction={useBreakpointValue({ base: 'column', sm: 'row' })}>
                    <Stack direction={'row'}>
                      <Input
                        type="number"
                        value={amt}
                        onChange={(e) => setAmt(e.target.value)}
              
                        maxW={useBreakpointValue({ base: undefined, sm: '56' })}
                        textAlign={'right'}
                      />
                      <NativeSelect.Root width="auto" minW={'24'}>
                        <NativeSelect.Field
                          value={asset}
                          onChange={(e) => setAsset(e.target.value)}
                
                        >
                          <option value="hive">HIVE</option>
                          <option value="hbd">HBD</option>
                          <option value="hbd_savings">sHBD</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Stack>
                  </Stack>
                </Field.Root>
                <Field.Root>
                  <Field.Label>{t('form.memo', { ns: 'common' })}</Field.Label>
                  <Input

                    type="text"
                    placeholder={t('form.optional', { ns: 'common' })}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </Field.Root>
              </Stack>
              <Button colorPalette={themeColorScheme} onClick={submitClicked} disabled={isSpinning || !user || !amt} w={'fit-content'}>
                <Flex gap={'2'} align={'center'}>
                  <Spinner size={'sm'} hidden={!isSpinning} />
                  <Text>{t('submit', { ns: 'common' })}</Text>
                </Flex>
              </Button>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Center>
      <AiohaModal displayed={walletOpen} onClose={() => setWalletOpen(false)} initPage={0} />
    </>
  )
}
