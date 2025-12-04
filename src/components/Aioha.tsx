import { useAioha } from '@aioha/providers/react'
import { KeyTypes, Providers } from '@aioha/aioha'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useColorMode,
  VStack
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { themeColorLight, themeColorScheme } from '../settings'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { QRCode } from 'react-qr-code'

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

const ProvidersSeq: Providers[] = [Providers.Keychain, Providers.PeakVault, Providers.HiveAuth, Providers.Ledger] // in this particular order

export const AiohaModal = ({ displayed, onClose }: { displayed: boolean; onClose: () => void }) => {
  const { aioha, user } = useAioha()
  const { colorMode } = useColorMode()
  const [page, setPage] = useState(1)
  const [selectedProv, setSelectedProv] = useState<Providers | null>(null)
  const [usernameInput, setUsernameInput] = useState<string>('')
  const [inProgress, setInProgress] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [hiveAuthPl, setHiveAuthPl] = useState<{ payload: string; cancel: () => void }>()
  useEffect(() => {
    const handler = (payload: string, _: any, cancel: () => void) => {
      setError('')
      setHiveAuthPl({ payload, cancel })
      setPage(3)
    }
    aioha.on('hiveauth_login_request', handler)
    return () => {
      aioha.off('hiveauth_login_request', handler)
    }
  }, [])
  const proceedLogin = async () => {
    setError('')
    setInProgress(true)
    const login = await aioha.login(selectedProv!, usernameInput, {
      msg: 'Magi Blocks Login',
      keyType: KeyTypes.Posting
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
  return (
    <Modal isOpen={displayed} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {!user && <ModalHeader>Connect Wallet</ModalHeader>}
        <ModalCloseButton _focus={{ boxShadow: 'none' }} />
        <ModalBody>
          {!user ? (
            page === 1 ? (
              <VStack gap={'3'}>
                {ProvidersSeq.map(
                  (prov, i) =>
                    aioha.isProviderEnabled(prov) && (
                      <Button
                        key={i}
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
                  <Alert status="error" mb={'3'}>
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button leftIcon={<Icon as={FaChevronLeft} />} variant={'outline'} onClick={() => setPage(1)}>
                  Back
                </Button>
                <Flex direction={'row'} mt={'3'} gap={'2'}>
                  <Input
                    focusBorderColor={themeColorLight}
                    placeholder="Enter Hive Username"
                    value={usernameInput}
                    onKeyDown={(evt) => (evt.key === 'Enter' ? proceedLogin() : null)}
                    onChange={(evt) => setUsernameInput(evt.target.value)}
                  />
                  <IconButton
                    colorScheme={themeColorScheme}
                    icon={!inProgress ? <Icon as={FaChevronRight} /> : <Spinner size={'sm'} />}
                    onClick={proceedLogin}
                    aria-label="Proceed"
                    disabled={usernameInput.length === 0}
                  />
                </Flex>
              </Box>
            ) : page === 3 ? (
              <Box>
                <Text>Scan the QR code using a HiveAuth-compatible mobile app.</Text>
                <Flex direction={'column'} gap={'6'} alignItems={'center'} mt={'4'}>
                  <a href={hiveAuthPl!.payload}>
                    <Box w={'64'} h={'64'} p={'2'} backgroundColor={'white'}>
                      <QRCode value={hiveAuthPl!.payload} style={{ width: '100%', height: '100%' }} />
                    </Box>
                  </a>
                  <Button onClick={hiveAuthPl!.cancel}>Cancel</Button>
                </Flex>
              </Box>
            ) : null
          ) : (
            <Flex direction={'column'} gap={'3'} alignItems={'center'} mt={'8'}>
              <Image src={`${ImageServer}/u/${user}/avatar`} alt={`${user}'s avatar`} width={'16'} height={'16'} />
              <Heading fontSize={'lg'}>{user}</Heading>
              <Button
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
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  )
}
