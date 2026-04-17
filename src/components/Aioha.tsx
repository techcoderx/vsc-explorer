import { useAioha } from '@aioha/providers/react'
import { useMagi } from '@aioha/providers/magi/react'
import { Wallet } from '@aioha/magi'
import { KeyTypes, Providers } from '@aioha/aioha'
import { useAppKit, useDisconnect as useAppKitDisconnect } from '@reown/appkit/react'
import { useDisconnect } from 'wagmi'
import {
  Alert,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Image,
  Input,
  Spinner,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { themeColorScheme } from '../settings'
import { FaBitcoin, FaChevronLeft, FaChevronRight, FaEthereum, FaHive } from 'react-icons/fa6'
import { useColorMode } from './ui/color-mode'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const QRCode = lazy(() => import('react-qr-code').then((m) => ({ default: m.QRCode })))

const ImageServer = 'https://images.hive.blog'

const ProviderInfo: {
  [provider in Providers]: {
    name: string
    icon: string
    iconDark?: string
  }
} = {
  [Providers.Keychain]: {
    name: 'Keychain',
    icon: '/img/aioha/keychain.svg'
  },
  [Providers.PeakVault]: {
    name: 'Peak Vault',
    icon: '/img/aioha/peakvault.svg'
  },
  [Providers.HiveAuth]: {
    name: 'HiveAuth',
    icon: '/img/aioha/hiveauth-light.svg',
    iconDark: '/img/aioha/hiveauth-dark.svg'
  },
  [Providers.Ledger]: {
    name: 'Ledger',
    icon: '/img/aioha/ledger-light.svg',
    iconDark: '/img/aioha/ledger-dark.svg'
  },
  [Providers.HiveSigner]: {
    name: 'HiveSigner', // not used
    icon: ''
  },
  [Providers.MetaMaskSnap]: {
    name: 'MetaMask',
    // badge: 'Hive Snap',
    icon: '/img/aioha/metamask.svg'
    // url: 'https://snaps.metamask.io/snap/npm/hiveio/metamask-snap',
    // discovery: true
  },
  [Providers.ViewOnly]: {
    name: 'View Only',
    icon: ''
  },
  [Providers.Custom]: {
    name: 'Other Wallet',
    icon: ''
  }
}

const ProvidersSeq: Providers[] = [
  Providers.Keychain,
  Providers.PeakVault,
  Providers.MetaMaskSnap,
  Providers.HiveAuth,
  Providers.Ledger
] // in this particular order

const abbreviateAddr = (addr: string) => (addr.length > 12 ? addr.slice(0, 6) + '...' + addr.slice(-4) : addr)

export const ConnectWalletButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('common')
  const { user, wallet } = useMagi()
  const walletIcon = wallet === Wallet.Ethereum ? FaEthereum : wallet === Wallet.Bitcoin ? FaBitcoin : FaHive
  return (
    <Button variant={'outline'} colorPalette={'gray'} _focus={{ boxShadow: 'none' }} onClick={onClick}>
      {user ? <Box as={walletIcon} fontSize={'lg'} /> : null}
      {user ?? t('connectWallet')}
    </Button>
  )
}

export const AiohaModal = ({
  displayed,
  onClose,
  initPage = 1, // set to 0 to show evm/hive wallet selection
  disabledProviders = []
}: {
  displayed: boolean
  onClose: () => void
  initPage?: number
  disabledProviders?: Providers[]
}) => {
  const { aioha, user: hiveUser } = useAioha()
  const { user: magiUser, wallet } = useMagi()
  const { open: openAppKit } = useAppKit()
  const { disconnect: disconnectEvm } = useDisconnect()
  const { disconnect: disconnectAppKit } = useAppKitDisconnect()
  const { colorMode } = useColorMode()
  const [page, setPage] = useState(initPage)
  const [selectedProv, setSelectedProv] = useState<Providers | null>(null)
  const [usernameInput, setUsernameInput] = useState<string>('')
  const [inProgress, setInProgress] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [hiveAuthPl, setHiveAuthPl] = useState<{ payload: string; cancel: () => void }>()
  useEffect(() => {
    const handler = (payload: string, _: unknown, cancel: () => void) => {
      setError('')
      setHiveAuthPl({ payload, cancel })
      setPage(3)
    }
    aioha.on('hiveauth_login_request', handler)
    return () => {
      aioha.off('hiveauth_login_request', handler)
    }
  }, [aioha])
  const proceedLogin = async () => {
    setError('')
    setInProgress(true)
    const login = await aioha.login(selectedProv!, usernameInput, {
      msg: 'Magi Blocks Login',
      keyType: KeyTypes.Posting,
      metamask: {
        validateUser: true
      }
    })
    if (!login.success) {
      setError(login.error)
      setPage(2)
      setInProgress(false)
    } else {
      setInProgress(false)
      setUsernameInput('')
      setSelectedProv(null)
      onClose()
    }
  }
  const isConnected = !!magiUser || !!hiveUser
  return (
    <Dialog.Root open={displayed} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          {!isConnected && <Dialog.Header>Connect Wallet</Dialog.Header>}
          <Dialog.CloseTrigger _focus={{ boxShadow: 'none' }} />
          <Dialog.Body>
            {!isConnected ? (
              page === 0 ? (
                <Stack direction={'column'} gap={'3'}>
                  <Button variant={'outline'} colorPalette={'gray'} onClick={() => setPage(1)}>
                    <Box as={FaHive} fontSize={'2xl'} />
                    <Text textAlign={'left'} w={'full'}>
                      Hive
                    </Text>
                  </Button>
                  <Button
                    variant={'outline'}
                    colorPalette={'gray'}
                    onClick={() => {
                      onClose()
                      openAppKit({ namespace: 'eip155' })
                    }}
                  >
                    <Box as={FaEthereum} fontSize={'2xl'} />
                    <Text textAlign={'left'} w={'full'}>
                      Ethereum
                    </Text>
                  </Button>
                  <Button
                    variant={'outline'}
                    colorPalette={'gray'}
                    onClick={() => {
                      onClose()
                      openAppKit({ namespace: 'bip122' })
                    }}
                  >
                    <Box as={FaBitcoin} fontSize={'2xl'} />
                    <Text textAlign={'left'} w={'full'}>
                      Bitcoin
                    </Text>
                  </Button>
                </Stack>
              ) : page === 1 ? (
                <VStack gap={'3'} alignItems={'flex-start'}>
                  {initPage === 0 && (
                    <Button variant={'outline'} onClick={() => setPage(0)}>
                      <FaChevronLeft />
                      Back
                    </Button>
                  )}
                  {ProvidersSeq.map(
                    (prov, i) =>
                      !disabledProviders.includes(prov) &&
                      aioha.isProviderEnabled(prov) && (
                        <Button
                          key={i}
                          variant={'outline'}
                          colorPalette={'gray'}
                          w={'full'}
                          h={'12'}
                          justifyContent={'flex-start'}
                          onClick={() => {
                            setSelectedProv(prov)
                            setError('')
                            setPage(2)
                          }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Flex direction={'row'} align={'center'} gap={'4'}>
                            <Image src={(colorMode === 'dark' && ProviderInfo[prov].iconDark) || ProviderInfo[prov].icon} w={'8'} />
                            <Text>{ProviderInfo[prov].name}</Text>
                          </Flex>
                        </Button>
                      )
                  )}
                </VStack>
              ) : page === 2 ? (
                <Box>
                  {error && (
                    <Alert.Root status="error" mb={'3'}>
                      <Alert.Indicator />
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Root>
                  )}
                  <Button variant={'outline'} onClick={() => setPage(1)}>
                    <FaChevronLeft />
                    Back
                  </Button>
                  <Flex direction={'row'} mt={'3'} gap={'2'}>
                    <Input
                      placeholder="Enter Hive Username"
                      value={usernameInput}
                      onKeyDown={(evt) => (evt.key === 'Enter' ? proceedLogin() : null)}
                      onChange={(evt) => setUsernameInput(evt.target.value)}
                    />
                    <IconButton
                      colorPalette={themeColorScheme}
                      onClick={proceedLogin}
                      aria-label="Proceed"
                      disabled={usernameInput.length === 0}
                    >
                      {!inProgress ? <FaChevronRight /> : <Spinner size={'sm'} />}
                    </IconButton>
                  </Flex>
                </Box>
              ) : page === 3 ? (
                <Box>
                  <Text>Scan the QR code using a HiveAuth-compatible mobile app.</Text>
                  <Flex direction={'column'} gap={'6'} alignItems={'center'} mt={'4'}>
                    <a href={hiveAuthPl!.payload}>
                      <Box w={'64'} h={'64'} p={'2'} backgroundColor={'white'}>
                        <Suspense fallback={<Spinner />}>
                          <QRCode value={hiveAuthPl!.payload} style={{ width: '100%', height: '100%' }} />
                        </Suspense>
                      </Box>
                    </a>
                    <Button variant={'outline'} colorPalette={'gray'} onClick={hiveAuthPl!.cancel}>Cancel</Button>
                  </Flex>
                </Box>
              ) : null
            ) : wallet === Wallet.Ethereum ? (
              <Flex direction={'column'} gap={'3'} alignItems={'center'} mt={'8'}>
                <Box as={FaEthereum} fontSize={'5xl'} />
                <Heading fontSize={'lg'}>{abbreviateAddr(magiUser!)}</Heading>
                <Button
                  variant={'outline'}
                  colorPalette={'gray'}
                  onClick={() => {
                    disconnectEvm()
                    onClose()
                    setPage(initPage)
                  }}
                >
                  Disconnect
                </Button>
              </Flex>
            ) : wallet === Wallet.Bitcoin ? (
              <Flex direction={'column'} gap={'3'} alignItems={'center'} mt={'8'}>
                <Box as={FaBitcoin} fontSize={'5xl'} />
                <Heading fontSize={'lg'}>{abbreviateAddr(magiUser!)}</Heading>
                <Button
                  variant={'outline'}
                  colorPalette={'gray'}
                  onClick={() => {
                    disconnectAppKit()
                    onClose()
                    setPage(initPage)
                  }}
                >
                  Disconnect
                </Button>
              </Flex>
            ) : (
              <Flex direction={'column'} gap={'3'} alignItems={'center'} mt={'8'}>
                <Image
                  src={`${ImageServer}/u/${hiveUser}/avatar`}
                  alt={`${hiveUser}'s avatar`}
                  width={'16'}
                  height={'16'}
                />
                <Heading fontSize={'lg'}>{hiveUser}</Heading>
                <Button
                  variant={'outline'}
                  colorPalette={'gray'}
                  onClick={async () => {
                    await aioha.logout()
                    onClose()
                    setPage(1)
                  }}
                >
                  Disconnect
                </Button>
              </Flex>
            )}
          </Dialog.Body>
          <Dialog.Footer></Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
