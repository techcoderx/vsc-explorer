import {
  Button,
  Card,
  CardBody,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Link,
  Select,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import { PageTitle } from '../../PageTitle'
import { useMagi } from '@aioha/providers/magi/react'
import { Asset, Wallet } from '@aioha/magi'
import { VscStakeType } from '@aioha/aioha'
import { AiohaModal } from '../../Aioha'
import { FaEthereum, FaHive } from 'react-icons/fa6'
import { useState } from 'react'
import { themeColorLight, themeColorScheme } from '../../../settings'
import { TxnTypes } from '../../../types/L2ApiResult'
import { useNavigate } from 'react-router'

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
  const walletDisclosure = useDisclosure()
  const [txType, setTxType] = useState<TxnTypes>('transfer')
  const [dest, setDest] = useState<string>('')
  const [amt, setAmt] = useState<string>()
  const [asset, setAsset] = useState<string>('hive')
  const [memo, setMemo] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const submitClicked = async () => {
    const to = !!dest ? dest : magi.getUser(true)!
    const amount = parseFloat(amt || '')
    if (isNaN(amount) || amount <= 0) {
      return toast({ title: 'Amount must be greater than 0.', status: 'error' })
    }
    if (txType === 'deposit' && asset === 'hbd_savings') {
      return toast({ title: 'Deposit asset must be HIVE or HBD.', status: 'error' })
    }
    const currency = assetToEnum[asset]
    setIsSpinning(true)
    let result
    switch (txType) {
      case 'transfer':
      case 'deposit':
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
        return toast({ title: 'Unknown transaction type', status: 'error' })
    }
    setIsSpinning(false)
    if (!result.success) {
      return toast({ title: result.error, status: 'error' })
    } else {
      return toast({
        title: 'Transaction broadcasted successfully',
        status: 'success',
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
          <Card>
            <CardBody>
              <Stack direction={'column'} gap={'3'} mb={'5'}>
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Button
                    _focus={{ boxShadow: 'none' }}
                    onClick={walletDisclosure.onOpen}
                    leftIcon={user ? <Icon as={walletIcon} fontSize={'lg'} /> : undefined}
                  >
                    {user ?? 'Connect Wallet'}
                  </Button>
                </FormControl>
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    focusBorderColor={themeColorLight}
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as TxnTypes)}
                  >
                    {txTypes.map((t, i) => (
                      <option key={i} value={t[0]}>
                        {t[1]}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Destination Address</FormLabel>
                  <Input
                    focusBorderColor={themeColorLight}
                    type="text"
                    placeholder="Include hive: or did: prefix for non-map, defaults to sender"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <Stack direction={useBreakpointValue({ base: 'column', sm: 'row' })}>
                    <Stack direction={'row'}>
                      <Input
                        type="number"
                        value={amt}
                        onChange={(e) => setAmt(e.target.value)}
                        focusBorderColor={themeColorLight}
                        maxW={useBreakpointValue({ base: undefined, sm: '56' })}
                        textAlign={'right'}
                      />
                      <Select
                        value={asset}
                        onChange={(e) => setAsset(e.target.value)}
                        focusBorderColor={themeColorLight}
                        width="auto"
                        minW={'24'}
                      >
                        <option value="hive">HIVE</option>
                        <option value="hbd">HBD</option>
                        <option value="hbd_savings">sHBD</option>
                      </Select>
                    </Stack>
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>Memo</FormLabel>
                  <Input
                    focusBorderColor={themeColorLight}
                    type="text"
                    placeholder="Optional"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </FormControl>
              </Stack>
              <Button colorScheme={themeColorScheme} onClick={submitClicked} disabled={isSpinning || !user || !amt}>
                <Flex gap={'2'} align={'center'}>
                  <Spinner size={'sm'} hidden={!isSpinning} />
                  <Text>Submit</Text>
                </Flex>
              </Button>
            </CardBody>
          </Card>
        </Stack>
      </Center>
      <AiohaModal displayed={walletDisclosure.isOpen} onClose={walletDisclosure.onClose} initPage={0} />
    </>
  )
}
