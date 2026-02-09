import {
  Text,
  Heading,
  Box,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tag,
  Flex,
  Card,
  CardBody,
  Spinner,
  Stack,
  Input,
  HStack,
  Button,
  VStack,
  Radio,
  RadioGroup,
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  FormLabel,
  useDisclosure,
  Select,
  Icon,
  useToast,
  Link,
  FormHelperText,
  useBreakpointValue
} from '@chakra-ui/react'
import { CheckCircleIcon, QuestionIcon, WarningIcon, AddIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router'
import { fetchL1Rest, fetchMembersAtL1Block, getStateKeys, useAddrBalance, useContract } from '../../requests'
import TableRow from '../TableRow'
import { abbreviateHash, beL1BlockUrl, magiAssetDisplay, timeAgo, utf8ToHex } from '../../helpers'
import { themeColorLight } from '../../settings'
import { themeColorScheme } from '../../settings'
import { Flairs } from '../../flairs'
import { cvInfo } from '../../cvRequests'
import { Txns } from '../tables/Transactions'
import { AddressBalanceCard } from './address/Balances'
import { ContractOutputTbl } from '../tables/ContractOutput'
import { L1TxHeader } from '../../types/L1ApiResult'
import { useMemo, useRef, useState } from 'react'
import { BLSSig, CoinLower } from '../../types/Payloads'
import { ParticipatedMembers } from '../BlsAggMembers'
import { Contract as ContractType } from '../../types/L2ApiResult'
import { PageTitle } from '../PageTitle'
import { AccountLink } from '../TableLink'
import { useAioha } from '@aioha/providers/react'
import { AiohaModal } from '../Aioha'
import { KeyTypes } from '@aioha/aioha'
import { FaHive } from 'react-icons/fa6'
import { ContractHistoryTbl } from '../tables/ContractHistory'

const StorageProof = ({ contract }: { contract: ContractType }) => {
  const {
    data: members,
    isLoading: mbLoading,
    isError: mbErr
  } = useQuery({
    queryKey: ['vsc-members-at-l1-block', contract.creation_height],
    queryFn: async () => fetchMembersAtL1Block(contract.creation_height)
  })
  const {
    data: deployTx,
    isLoading: deployTxLoading,
    isError: deployTxErr
  } = useQuery({
    queryKey: ['vsc-l1-tx', contract.tx_id],
    queryFn: async () => fetchL1Rest<L1TxHeader>(`/hafah-api/transactions/${contract.tx_id}?include-virtual=true`)
  })
  const proofSig = useMemo(() => {
    if (!!deployTx) {
      for (let op in deployTx.transaction_json.operations) {
        if (deployTx.transaction_json.operations[op].type === 'custom_json_operation') {
          const json = JSON.parse(deployTx.transaction_json.operations[op].value.json)
          if (
            json.code === contract!.code &&
            typeof json.storage_proof === 'object' &&
            typeof json.storage_proof.signature === 'object' &&
            typeof json.storage_proof.signature.sig === 'string' &&
            typeof json.storage_proof.signature.bv === 'string'
          ) {
            return json.storage_proof.signature as BLSSig
          }
        }
      }
    }
  }, [deployTx])
  return deployTxLoading || mbLoading ? (
    <Text>Loading deployment tx...</Text>
  ) : deployTxErr || mbErr ? (
    <Text>Failed to load deployment tx</Text>
  ) : (
    <ParticipatedMembers
      members={members?.election.members || []}
      weights={members?.election.weights || []}
      sig={proofSig?.sig || ''}
      bv={proofSig?.bv || '0'}
    />
  )
}

const ReadState = ({ contractId }: { contractId: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [format, setFormat] = useState('0')
  const [key, setKey] = useState('')
  const [val, setVal] = useState('')
  const [err, setErr] = useState('')
  const read = async () => {
    setIsLoading(true)
    setErr('')
    try {
      const sk = await getStateKeys(contractId, [key])
      if (!sk.data) {
        setErr('gql error while getting state key')
      } else {
        setVal(sk.data.state[key])
      }
    } catch (e) {
      setErr('Failed to fetch state key')
    }
    setIsLoading(false)
  }
  return (
    <VStack gap={'4'} w={'full'}>
      <HStack gap={'3'} w={'full'}>
        <Input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? read() : null)}
          focusBorderColor={themeColorLight}
        />
        <Button colorScheme={themeColorScheme} onClick={read} disabled={isLoading}>
          <Flex gap={'2'} align={'center'}>
            <Spinner size={'sm'} hidden={!isLoading} />
            <Text>Read</Text>
          </Flex>
        </Button>
      </HStack>
      {!!err && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      )}
      {!!val && (
        <Box alignItems={'left'} w={'full'} px={'1'}>
          <RadioGroup onChange={setFormat} value={format} colorScheme={themeColorScheme}>
            <Stack direction={'row'}>
              <Radio value="0">UTF-8</Radio>
              <Radio value="1">Hex</Radio>
            </Stack>
          </RadioGroup>
        </Box>
      )}
      {!!val && (
        <Card w={'full'}>
          <CardBody>
            <Text>{format === '0' ? val : utf8ToHex(val)}</Text>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}

const CallContract = ({ contractId }: { contractId: string }) => {
  const { data: verifInfo } = useQuery({
    queryKey: ['vsc-cv-verif-info', contractId],
    queryFn: async () => cvInfo(contractId!),
    enabled: !!contractId
  })
  const walletDisclosure = useDisclosure()
  const toast = useToast()
  const navigate = useNavigate()
  const { aioha, user } = useAioha()
  const { balance } = useAddrBalance('hive:' + user)
  const [methodName, setMethodName] = useState('')
  const [payload, setPayload] = useState('')
  const [rcLimit, setRcLimit] = useState('')
  const [keyType, setKeyType] = useState(KeyTypes.Posting)
  const [newIntentAmt, setNewIntentAmt] = useState('')
  const [newIntentToken, setNewIntentToken] = useState<CoinLower>('hive')
  const intents = useRef({ hive: 0, hbd: 0, hbd_savings: 0 })
  const [_, setIntentCleared] = useState(false)
  const addIntent = () => {
    const amt = parseFloat(newIntentAmt)
    if (!user || !balance || !balance.bal) {
      return toast({ title: 'Wallet not connected or balances could not be loaded', status: 'error' })
    } else if (isNaN(amt) || amt <= 0) {
      return toast({ title: 'Amount must be greater than 0', status: 'error' })
    } else if (Math.round(amt * 1000) > balance.bal[newIntentToken]) {
      return toast({ title: 'Insufficient balance', status: 'error' })
    }
    intents.current[newIntentToken] = amt
    setNewIntentAmt('')
  }
  const rmIntent = () => {
    intents.current = { hive: 0, hbd: 0, hbd_savings: 0 }
    setIntentCleared((p) => !p)
  }
  const call = async () => {
    const rcLimitInt = parseInt(rcLimit)
    if (isNaN(rcLimitInt) || rcLimitInt < 100) {
      return toast({ title: 'RC limit must be greater than or equal to 100', status: 'error' })
    }
    const intentsArr = Object.keys(intents.current)
      .filter((a) => intents.current[a as CoinLower] > 0)
      .map((a) => {
        return {
          type: 'transfer.allow',
          args: {
            limit: intents.current[a as CoinLower].toFixed(3),
            token: a
          }
        }
      })
    const callResult = await aioha.vscCallContract(contractId, methodName, payload, rcLimitInt, intentsArr)
    if (!callResult.success) {
      return toast({ title: callResult.error, status: 'error' })
    } else {
      return toast({
        title: 'Transaction broadcasted successfully',
        status: 'success',
        description: (
          <Link
            onClick={(evt) => {
              evt.preventDefault()
              navigate('/tx/' + callResult.result)
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
      <Card>
        <CardBody>
          <Stack direction={'column'} gap={'3'}>
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
              <FormLabel>Method</FormLabel>
              {!verifInfo || !!verifInfo.error || !Array.isArray(verifInfo.exports) || verifInfo.exports.length === 0 ? (
                <Input
                  type="text"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  focusBorderColor={themeColorLight}
                />
              ) : (
                <Select
                  focusBorderColor={themeColorLight}
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value as KeyTypes)}
                >
                  {verifInfo.exports.map((exp, i) => (
                    <option key={i} value={exp}>
                      {exp}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>Payload</FormLabel>
              <Input
                type="text"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                focusBorderColor={themeColorLight}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Intents</FormLabel>
              <Stack direction={useBreakpointValue({ base: 'column', sm: 'row' })}>
                <Stack direction={'row'}>
                  <Input
                    type="number"
                    value={newIntentAmt}
                    onChange={(e) => setNewIntentAmt(e.target.value)}
                    focusBorderColor={themeColorLight}
                    maxW={useBreakpointValue({ base: undefined, sm: '56' })}
                    textAlign={'right'}
                    placeholder={!!balance && !!balance.bal ? `Balance: ${balance.bal[newIntentToken] / 1000}` : undefined}
                  />
                  <Select
                    value={newIntentToken}
                    onChange={(e) => setNewIntentToken(e.target.value as CoinLower)}
                    focusBorderColor={themeColorLight}
                    width="auto"
                    minW={'24'}
                  >
                    <option value="hive">HIVE</option>
                    <option value="hbd">HBD</option>
                    <option value="hbd_savings">sHBD</option>
                  </Select>
                </Stack>
                <Stack direction={'row'}>
                  <Button variant={'outline'} colorScheme={themeColorScheme} onClick={addIntent}>
                    <AddIcon fontSize={'sm'} />
                  </Button>
                  <Button variant={'outline'} colorScheme={themeColorScheme} onClick={rmIntent}>
                    Clear All
                  </Button>
                </Stack>
              </Stack>
              <FormHelperText>
                Current Allowance: {intents.current[newIntentToken].toFixed(3)} {magiAssetDisplay(newIntentToken)}
              </FormHelperText>
            </FormControl>
            {/** TODO: Estimate RC usage by simulating call */}
            <FormControl>
              <FormLabel>RC Limit</FormLabel>
              <Input
                type="number"
                min={100}
                value={rcLimit}
                onChange={(e) => setRcLimit(e.target.value)}
                focusBorderColor={themeColorLight}
                maxW={'56'}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Key Type</FormLabel>
              <Select focusBorderColor={themeColorLight} value={keyType} onChange={(e) => setKeyType(e.target.value as KeyTypes)}>
                <option value={KeyTypes.Posting}>Posting</option>
                <option value={KeyTypes.Active}>Active</option>
              </Select>
            </FormControl>
          </Stack>
          <Button colorScheme={themeColorScheme} mt={'5'} onClick={call}>
            Call Contract
          </Button>
        </CardBody>
      </Card>
      <AiohaModal displayed={walletDisclosure.isOpen} onClose={walletDisclosure.onClose} initPage={0} />
    </>
  )
}

export const Contract = () => {
  const { contractId } = useParams()
  const invalidContractId = !contractId?.startsWith('vsc1')
  const { data, isLoading, isError } = useContract(contractId!, !invalidContractId)
  const ct = data?.data.contract
  const txns = data?.data.txns
  const outputs = data?.data.outputs
  const contract = ct && ct.length > 0 ? ct[0] : null
  const history = ct && ct.length > 0 ? ct : []
  const {
    data: verifInfo,
    error: verifError,
    isLoading: verifLoading
  } = useQuery({
    queryKey: ['vsc-cv-verif-info', contractId],
    queryFn: async () => cvInfo(contractId!),
    enabled: !invalidContractId
  })

  return (
    <>
      <PageTitle title={`Contract ${abbreviateHash(contractId || '', 18, 0)}`} />
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Box mb={'4'}>
          <Text fontSize={'5xl'}>Contract</Text>
          <Text fontSize={'2xl'} opacity={'0.7'}>
            {contractId}
          </Text>
        </Box>
        {Flairs[contractId!] && (
          <Tag colorScheme={themeColorScheme} size={'lg'} variant={'outline'} alignSelf={'end'} mb={'3'}>
            {Flairs[contractId!]}
          </Tag>
        )}
      </Stack>
      <hr />
      {isLoading ? <Skeleton h={'20px'} mt={'20px'} /> : null}
      {!!contract ? (
        <Box mt={'4'}>
          <AddressBalanceCard addr={'contract:' + contract.id} />
          <Tabs mt={'7'} colorScheme={themeColorScheme} variant={'solid-rounded'}>
            <TabList overflowX={'scroll'} whiteSpace={'nowrap'}>
              <Tab>Transactions</Tab>
              <Tab>Outputs</Tab>
              <Tab>Info</Tab>
              <Tab>Storage Proof</Tab>
              <Tab>Read State</Tab>
              <Tab>Call Contract</Tab>
              <Tab>Source Code</Tab>
              <Tab>History</Tab>
            </TabList>
            <TabPanels mt={'2'}>
              <TabPanel pt={'2'} px={'0'}>
                <Txns txs={txns || []} />
              </TabPanel>
              <TabPanel px={'0'} pt={'2'}>
                <ContractOutputTbl outputs={outputs || []} />
              </TabPanel>
              <TabPanel px={'0'}>
                <TableContainer>
                  <Table>
                    <Tbody>
                      <TableRow
                        label="Created At"
                        value={contract ? contract.creation_ts + ' (' + timeAgo(contract.creation_ts) + ')' : ''}
                        isLoading={isLoading}
                      />
                      <TableRow
                        label="Created In L1 Block"
                        value={contract.creation_height}
                        link={beL1BlockUrl(contract.creation_height)}
                        isLoading={isLoading}
                      />
                      <TableRow label="Creation Tx" value={contract.tx_id} link={'/tx/' + contract.tx_id} />
                      <TableRow label="Creator">
                        <AccountLink val={contract.creator} />
                      </TableRow>
                      <TableRow label="Owner">
                        <AccountLink val={contract.owner} />
                      </TableRow>
                      <TableRow label="Bytecode CID">
                        <Flex align={'center'} gap={'2'}>
                          <Text>{contract.code}</Text>
                          {verifInfo && verifInfo.status === 'success' ? (
                            <CheckCircleIcon color={themeColorScheme} aria-label="Contract source code verified" />
                          ) : null}
                        </Flex>
                      </TableRow>
                      <TableRow label="Runtime" value={contract.runtime} />
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel>{!!contract && <StorageProof contract={contract} />}</TabPanel>
              <TabPanel px={0}>
                <ReadState contractId={contract.id} />
              </TabPanel>
              <TabPanel px={0}>
                <CallContract contractId={contract.id} />
              </TabPanel>
              <TabPanel>
                {verifInfo ? (
                  verifInfo.status === 'success' ? (
                    <>
                      <Flex align={'center'} gap={'2'}>
                        <CheckCircleIcon color={themeColorScheme} />
                        <Heading fontSize={'md'}>Contract source code verified</Heading>
                      </Flex>
                      <Text m={'5px 0'}>
                        Magi Blocks has verified that the source code provided to us matches the deployed bytecode for the
                        contract. This does not mean the contract is safe to interact with.
                      </Text>
                      <Card mt={'5'} mb={'5'}>
                        <CardBody>
                          <TableContainer>
                            <Table variant={'unstyled'}>
                              <Tbody>
                                <TableRow label="Language" value={verifInfo.lang} isInCard minimalSpace />
                                {!!verifInfo.license ? (
                                  <TableRow label="License" value={verifInfo.license} isInCard minimalSpace />
                                ) : null}
                                <TableRow label="Verified At" isInCard minimalSpace>
                                  {verifInfo.verified_ts + ' (' + timeAgo(verifInfo.verified_ts) + ')'}
                                </TableRow>
                                <TableRow label="Submitted By" isInCard minimalSpace>
                                  <AccountLink val={'hive:' + verifInfo.verifier} />
                                </TableRow>
                                <TableRow
                                  label="Repository"
                                  value={`${verifInfo.repo_name} (${verifInfo.git_commit.slice(0, 8)})`}
                                  link={`https://github.com/${verifInfo.repo_name}/tree/${verifInfo.git_commit}`}
                                  isInCard
                                  minimalSpace
                                />
                                <TableRow
                                  label="TinyGo Version"
                                  value={`v${verifInfo.tinygo_version} (Go: v${verifInfo.go_version})`}
                                  link={`https://hub.docker.com/layers/tinygo/tinygo/${verifInfo.tinygo_version}`}
                                  isInCard
                                  minimalSpace
                                />
                                <TableRow label="Exports" isInCard minimalSpace>
                                  <Flex gap={3}>
                                    {verifInfo.exports.map((method, i) => (
                                      <Tag colorScheme={themeColorScheme} key={i}>
                                        {method}
                                      </Tag>
                                    ))}
                                  </Flex>
                                </TableRow>
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </CardBody>
                      </Card>
                    </>
                  ) : verifInfo.status === 'queued' ? (
                    <Flex align={'center'} gap={'2'}>
                      <Spinner size={'sm'} />
                      <Text fontSize={'md'}>Contract verification request is currently in queue.</Text>
                    </Flex>
                  ) : verifInfo.status === 'in progress' ? (
                    <Flex align={'center'} gap={'2'}>
                      <Spinner size={'sm'} />
                      <Text fontSize={'md'}>Contract verification request is currently being processed.</Text>
                    </Flex>
                  ) : verifInfo.status === 'failed' ? (
                    <Flex align={'center'} gap={'2'}>
                      <WarningIcon />
                      <Text fontSize={'md'}>Contract verification failed to complete.</Text>
                    </Flex>
                  ) : verifInfo.status === 'not match' ? (
                    <Flex align={'center'} gap={'2'}>
                      <WarningIcon />
                      <Text fontSize={'md'}>
                        Contract verification failed due to non-matching deployed bytecode from compiled source code.
                      </Text>
                    </Flex>
                  ) : verifInfo.status === 'pending' ? (
                    <Flex align={'center'} gap={'2'}>
                      <Spinner size={'sm'} />
                      <Text fontSize={'md'}>Contract verification request is currently pending.</Text>
                    </Flex>
                  ) : null
                ) : verifError ? (
                  <Text>Failed to fetch contract verification status.</Text>
                ) : verifLoading ? (
                  <Flex align={'center'} gap={'2'}>
                    <Spinner size={'sm'} />
                    <Text fontSize={'md'}>Loading contract verification status...</Text>
                  </Flex>
                ) : (
                  <>
                    <Flex align={'center'} gap={'2'}>
                      <QuestionIcon color={themeColorScheme} />
                      <Heading fontSize={'md'}>Contract source code not verified</Heading>
                    </Flex>
                    <Text m={'5px 0'}>Source code for this contract is unknown.</Text>
                  </>
                )}
              </TabPanel>
              <TabPanel pt={'2'} px={'0'}>
                <ContractHistoryTbl history={history} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      ) : isError ? (
        <Text>Failed to fetch contract</Text>
      ) : !isLoading ? (
        <Text>Contract does not exist</Text>
      ) : null}
    </>
  )
}
