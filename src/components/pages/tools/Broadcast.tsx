import {
  Button,
  Card,
  Center,
  Flex,
  Field,
  Box,
  Input,
  Link,
  NativeSelect,
  Spinner,
  Stack,
  Text,
  useBreakpointValue
} from '@chakra-ui/react'
import { PageTitle } from '../../PageTitle'
import { useMagi } from '@aioha/providers/magi/react'
import { Asset, Wallet } from '@aioha/magi'
import { VscStakeType } from '@aioha/aioha'
import { AiohaModal } from '../../Aioha'
import { FaEthereum, FaHive } from 'react-icons/fa6'
import { useState } from 'react'
import { getConf, themeColorScheme } from '../../../settings'
import { TxnTypes } from '../../../types/L2ApiResult'
import { useNavigate } from 'react-router'
import { useAioha } from '@aioha/providers/react'
import { toaster } from '../../ui/toaster'

const txTypes: [TxnTypes, string][] = [
  ['transfer', 'Transfer'],
  ['deposit', 'Map'],
  ['withdraw', 'Unmap'],
  ['consensus_stake', 'Consensus Stake'],
  ['consensus_unstake', 'Consensus Unstake'],
  ['stake_hbd', 'Stake HBD'],
  ['unstake_hbd', 'Unstake HBD']
]

const assetToEnum: Record<string, Asset> = {
  hive: Asset.hive,
  hbd: Asset.hbd,
  hbd_savings: Asset.shbd
}

export const Broadcast = () => {
  const { magi, user, wallet } = useMagi()
  const { aioha } = useAioha()
  const [walletOpen, setWalletOpen] = useState(false)
  const [txType, setTxType] = useState<TxnTypes>('transfer')
  const [dest, setDest] = useState<string>('')
  const [amt, setAmt] = useState<string>()
  const [asset, setAsset] = useState<string>('hive')
  const [memo, setMemo] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const navigate = useNavigate()
  const submitClicked = async () => {
    const to = !!dest ? dest : magi.getUser(true)!
    const amount = parseFloat(amt || '')
    if (isNaN(amount) || amount <= 0) {
      return toaster.error({ title: 'Amount must be greater than 0.' })
    }
    if (txType === 'deposit' && asset === 'hbd_savings') {
      return toaster.error({ title: 'Deposit asset must be HIVE or HBD.' })
    }
    const currency = assetToEnum[asset]
    setIsSpinning(true)
    let result
    switch (txType) {
      case 'deposit':
        if (wallet !== Wallet.Hive) {
          return toaster.error({ title: 'Can only map from Hive wallets.' })
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
        result = await magi.transfer(to, amount, currency, memo || undefined)
        break
      case 'withdraw':
        result = await magi.unmap(to, amount, currency, memo || undefined)
        break
      case 'consensus_stake':
        result = await magi.stake(VscStakeType.Consensus, amount, to, memo || undefined)
        break
      case 'consensus_unstake':
        result = await magi.unstake(VscStakeType.Consensus, amount, to, memo || undefined)
        break
      case 'stake_hbd':
        result = await magi.stake(VscStakeType.HBD, amount, to, memo || undefined)
        break
      case 'unstake_hbd':
        result = await magi.unstake(VscStakeType.HBD, amount, to, memo || undefined)
        break
      default:
        setIsSpinning(false)
        return toaster.error({ title: 'Unknown transaction type' })
    }
    setIsSpinning(false)
    if (!result.success) {
      return toaster.error({ title: result.error })
    } else {
      return toaster.success({
        title: 'Transaction broadcasted successfully',
        description: (
          <Link
            onClick={(evt) => {
              evt.preventDefault()
              navigate('/tx/' + result.result)
            }}
          >
            View transaction
          </Link>
        )
      })
    }
  }
  const walletIcon = wallet === Wallet.Ethereum ? FaEthereum : FaHive
  return (
    <>
      <PageTitle title="Broadcast Transaction" />
      <Text fontSize={'5xl'}>Broadcast Transaction</Text>
      <Text mb={'6'}>Sign and broadcast a Magi transaction.</Text>
      <Center>
        <Stack direction="column" gap={'6'} maxW={'4xl'} w={'100%'}>
          <Card.Root>
            <Card.Body>
              <Stack direction={'column'} gap={'3'} mb={'5'}>
                <Field.Root>
                  <Field.Label>Username</Field.Label>
                  <Button
                    variant={'outline'}
                    colorPalette={'gray'}
                    _focus={{ boxShadow: 'none' }}
                    onClick={() => setWalletOpen(true)}
                  >
                    {user ? <Box as={walletIcon} fontSize={'lg'} /> : null}
                    {user ?? 'Connect Wallet'}
                  </Button>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Type</Field.Label>
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
                  <Field.Label>Destination Address</Field.Label>
                  <Input
          
                    type="text"
                    placeholder="Include hive: or did: prefix for non-map, defaults to sender"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Amount</Field.Label>
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
                  <Field.Label>Memo</Field.Label>
                  <Input
          
                    type="text"
                    placeholder="Optional"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </Field.Root>
              </Stack>
              <Button colorPalette={themeColorScheme} onClick={submitClicked} disabled={isSpinning || !user || !amt} w={'fit-content'}>
                <Flex gap={'2'} align={'center'}>
                  <Spinner size={'sm'} hidden={!isSpinning} />
                  <Text>Submit</Text>
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
