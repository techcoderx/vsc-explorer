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
import { useAioha } from '@aioha/providers/react'
import { AiohaModal } from '../../Aioha'
import { FaHive } from 'react-icons/fa6'
import { useState } from 'react'
import { getConf, themeColorLight, themeColorScheme } from '../../../settings'
import { TxnTypes } from '../../../types/L2ApiResult'
import { CoinLower } from '../../../types/Payloads'
import { Asset, KeyTypes } from '@aioha/aioha'
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

export const Broadcast = () => {
  const { aioha, user } = useAioha()
  const walletDisclosure = useDisclosure()
  const [txType, setTxType] = useState<TxnTypes>('transfer')
  const [to, setTo] = useState<string>('')
  const [amt, setAmt] = useState<string>()
  const [asset, setAsset] = useState<CoinLower>('hive')
  const [memo, setMemo] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const conf = getConf()
  const submitClicked = async () => {
    const amount = parseFloat(amt || '')
    if (isNaN(amount) || amount < 0) {
      return toast({ title: 'Amount must be greater than 0.', status: 'error' })
    }
    if (txType === 'deposit' && asset === 'hbd_savings') {
      return toast({ title: 'Deposit asset must be HIVE or HBD.', status: 'error' })
    }
    const amtStr = amount.toFixed(3)
    setIsSpinning(true)
    const result =
      txType !== 'deposit'
        ? await aioha.customJSON(KeyTypes.Active, 'vsc.' + txType, {
            net_id: conf.netId,
            from: 'hive:' + user,
            to,
            amount: amtStr,
            asset,
            memo
          })
        : await aioha.transfer(
            conf.msAccount,
            amount,
            asset.toUpperCase() as Asset,
            'to=' + to.replace('hive:', '').replace('did:pkh:eip155:1:', '')
          )
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
                    leftIcon={user ? <Icon as={FaHive} fontSize={'lg'} /> : undefined}
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
                    placeholder="Include hive: or did: prefix for non-map"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
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
                        onChange={(e) => setAsset(e.target.value as CoinLower)}
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
              <Button colorScheme={themeColorScheme} onClick={submitClicked} disabled={isSpinning || !user || !to || !amt}>
                <Flex gap={'2'} align={'center'}>
                  <Spinner size={'sm'} hidden={!isSpinning} />
                  <Text>Submit</Text>
                </Flex>
              </Button>
            </CardBody>
          </Card>
        </Stack>
      </Center>
      <AiohaModal displayed={walletDisclosure.isOpen} onClose={walletDisclosure.onClose} />
    </>
  )
}
