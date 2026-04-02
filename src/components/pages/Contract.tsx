import {
  Text,
  Heading,
  Box,
  Skeleton,
  Table,
  Tabs,
  Tag,
  Flex,
  Card,
  Spinner,
  Stack,
  Input,
  HStack,
  Button,
  VStack,
  RadioGroup,
  Alert,
  Field,
  NativeSelect,
  Link,
  useBreakpointValue
} from '@chakra-ui/react'
import { LuCircleCheck, LuCircleHelp, LuTriangleAlert, LuPlus } from 'react-icons/lu'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import {
  fetchL1Rest,
  fetchL2TxnsBy,
  fetchMembersAtL1Block,
  getStateKeys,
  simulateContractCalls,
  useAddrBalance,
  useContract,
  useHistoryStats
} from '../../requests'
import TableRow from '../TableRow'
import { abbreviateHash, beL1BlockUrl, magiAssetDisplay, timeAgo, utf8ToHex } from '../../helpers'
import { themeColorScheme } from '../../settings'
import { Flairs } from '../../flairs'
import { cvInfo } from '../../cvRequests'
import { Txns } from '../tables/Transactions'
import { AddressBalanceCard } from './address/Balances'
import { ContractOutputTbl } from '../tables/ContractOutput'
import Pagination from '../Pagination'
import { TxFilterBar, TxFilterToggle } from '../TxFilterBar'
import { useFilterOpen } from '../../hooks/useFilterOpen'
import { parseFiltersFromSearchParams, buildTxFilterOptions, buildHistoryStatOpts, useBlockRange } from '../../txFilterHelpers'
import { L1TxHeader } from '../../types/L1ApiResult'
import { useMemo, useRef, useState } from 'react'
import { BLSSig, CoinLower } from '../../types/Payloads'
import { ParticipatedMembers } from '../BlsAggMembers'
import { Contract as ContractType } from '../../types/L2ApiResult'
import { PageTitle } from '../PageTitle'
import { AccountLink } from '../TableLink'
import { useMagi } from '@aioha/providers/magi/react'
import { Wallet, KeyTypes } from '@aioha/magi'
import { AiohaModal } from '../Aioha'
import { FaEthereum, FaHive } from 'react-icons/fa6'
import { ContractHistoryTbl } from '../tables/ContractHistory'
import { toaster } from '../ui/toaster'
import { btnGroupCss } from '../../styles/btnGroup'

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
    if (deployTx) {
      for (const op in deployTx.transaction_json.operations) {
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
  }, [deployTx, contract])
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
    } catch {
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
        />
        <Button colorPalette={themeColorScheme} onClick={read} disabled={isLoading}>
          <Flex gap={'2'} align={'center'}>
            <Spinner size={'sm'} hidden={!isLoading} />
            <Text>Read</Text>
          </Flex>
        </Button>
      </HStack>
      {!!err && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Description>{err}</Alert.Description>
        </Alert.Root>
      )}
      {!!val && (
        <Box alignItems={'left'} w={'full'} px={'1'}>
          <RadioGroup.Root
            onValueChange={(details) => setFormat(details.value ?? '0')}
            value={format}
            colorPalette={themeColorScheme}
          >
            <Stack direction={'row'}>
              <RadioGroup.Item value="0">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>UTF-8</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="1">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>Hex</RadioGroup.ItemText>
              </RadioGroup.Item>
            </Stack>
          </RadioGroup.Root>
        </Box>
      )}
      {!!val && (
        <Card.Root w={'full'}>
          <Card.Body>
            <Text>{format === '0' ? val : utf8ToHex(val)}</Text>
          </Card.Body>
        </Card.Root>
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
  const [walletOpen, setWalletOpen] = useState(false)
  const navigate = useNavigate()
  const { magi, user, wallet } = useMagi()
  const userPrefixed = magi.getUser(true)
  const { balance } = useAddrBalance(userPrefixed ?? '')
  const [methodName, setMethodName] = useState('')
  const [payload, setPayload] = useState('')
  const [keyType, setKeyType] = useState(KeyTypes.Posting)
  const [newIntentAmt, setNewIntentAmt] = useState('')
  const [newIntentToken, setNewIntentToken] = useState<CoinLower>('hive')
  const intents = useRef({ hive: 0, hbd: 0, hbd_savings: 0 })
  const [, setIntentCleared] = useState(false)
  const addIntent = () => {
    const amt = parseFloat(newIntentAmt)
    if (!user || !balance || !balance.bal) {
      return toaster.error({ title: 'Wallet not connected or balances could not be loaded' })
    } else if (isNaN(amt) || amt <= 0) {
      return toaster.error({ title: 'Amount must be greater than 0' })
    } else if (Math.round(amt * 1000) > balance.bal[newIntentToken]) {
      return toaster.error({ title: 'Insufficient balance' })
    }
    intents.current[newIntentToken] = amt
    setNewIntentAmt('')
  }
  const rmIntent = () => {
    intents.current = { hive: 0, hbd: 0, hbd_savings: 0 }
    setIntentCleared((p) => !p)
  }
  const call = async () => {
    if (!user) {
      return toaster.error({ title: 'Please connect your wallet first' })
    }
    if (!methodName) {
      return toaster.error({ title: 'Call method is required' })
    }
    const effectiveKeyType = wallet === Wallet.Hive ? keyType : KeyTypes.Active
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
    const simResult = await simulateContractCalls({
      tx_id: '',
      ...(effectiveKeyType === KeyTypes.Active
        ? { required_auths: [userPrefixed!] }
        : { required_posting_auths: [userPrefixed!] }),
      calls: [
        {
          contract_id: contractId,
          action: methodName,
          payload: payload,
          rc_limit: 100000,
          intents: intentsArr.length > 0 ? intentsArr : undefined
        }
      ]
    })
    const sim = simResult.data.simulateContractCalls[0]
    if (!sim.success) {
      return toaster.error({ title: 'Contract Call Simulation Failed', description: sim.err_msg || sim.err })
    }
    const rcLimitInt = Math.ceil(parseInt(sim.rc_used) * 1.25)
    const callResult = await magi.call(contractId, methodName, payload, rcLimitInt, intentsArr, effectiveKeyType)
    if (!callResult.success) {
      return toaster.error({ title: callResult.error })
    } else {
      return toaster.success({
        title: 'Transaction broadcasted successfully',
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
      <Card.Root>
        <Card.Body>
          <Stack direction={'column'} gap={'3'}>
            <Field.Root>
              <Field.Label>Username</Field.Label>
              <Button
                variant={'outline'}
                colorPalette={'gray'}
                _focus={{ boxShadow: 'none' }}
                onClick={() => setWalletOpen(true)}
              >
                {user ? <Box as={wallet === Wallet.Ethereum ? FaEthereum : FaHive} fontSize={'lg'} /> : null}
                {user ?? 'Connect Wallet'}
              </Button>
            </Field.Root>
            <Field.Root>
              <Field.Label>Method</Field.Label>
              {!verifInfo || !!verifInfo.error || !Array.isArray(verifInfo.exports) || verifInfo.exports.length === 0 ? (
                <Input type="text" value={methodName} onChange={(e) => setMethodName(e.target.value)} />
              ) : (
                <NativeSelect.Root>
                  <NativeSelect.Field value={methodName} onChange={(e) => setMethodName(e.target.value as KeyTypes)}>
                    {verifInfo.exports.map((exp, i) => (
                      <option key={i} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>Payload</Field.Label>
              <Input type="text" value={payload} onChange={(e) => setPayload(e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Intents</Field.Label>
              <Stack direction={useBreakpointValue({ base: 'column', sm: 'row' })}>
                <Stack direction={'row'}>
                  <Input
                    type="number"
                    value={newIntentAmt}
                    onChange={(e) => setNewIntentAmt(e.target.value)}
                    maxW={useBreakpointValue({ base: undefined, sm: '56' })}
                    textAlign={'right'}
                    placeholder={!!balance && !!balance.bal ? `Balance: ${balance.bal[newIntentToken] / 1000}` : undefined}
                  />
                  <NativeSelect.Root width="auto" minW={'24'}>
                    <NativeSelect.Field value={newIntentToken} onChange={(e) => setNewIntentToken(e.target.value as CoinLower)}>
                      <option value="hive">HIVE</option>
                      <option value="hbd">HBD</option>
                      <option value="hbd_savings">sHBD</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Stack>
                <Stack direction={'row'}>
                  <Button variant={'outline'} colorPalette={themeColorScheme} onClick={addIntent}>
                    <LuPlus fontSize={'sm'} />
                  </Button>
                  <Button variant={'outline'} colorPalette={themeColorScheme} onClick={rmIntent}>
                    Clear All
                  </Button>
                </Stack>
              </Stack>
              <Field.HelperText>
                {/* eslint-disable-next-line react-hooks/refs */}
                Current Allowance: {intents.current[newIntentToken].toFixed(3)} {magiAssetDisplay(newIntentToken)}
              </Field.HelperText>
            </Field.Root>
            {wallet === Wallet.Hive && (
              <Field.Root>
                <Field.Label>Key Type</Field.Label>
                <Box css={btnGroupCss}>
                  <Button
                    colorPalette={keyType === KeyTypes.Posting ? themeColorScheme : 'gray'}
                    variant="outline"
                    onClick={() => setKeyType(KeyTypes.Posting)}
                  >
                    Posting
                  </Button>
                  <Button
                    colorPalette={keyType === KeyTypes.Active ? themeColorScheme : 'gray'}
                    variant="outline"
                    onClick={() => setKeyType(KeyTypes.Active)}
                  >
                    Active
                  </Button>
                </Box>
              </Field.Root>
            )}
          </Stack>
          <Button colorPalette={themeColorScheme} mt={'5'} onClick={call} w={'fit-content'}>
            Call Contract
          </Button>
        </Card.Body>
      </Card.Root>
      <AiohaModal displayed={walletOpen} onClose={() => setWalletOpen(false)} initPage={0} />
    </>
  )
}

const txCount = 100

export const Contract = () => {
  const { contractId } = useParams()
  const [searchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useFilterOpen()
  const [activeTab, setActiveTab] = useState('0')
  const invalidContractId = !contractId?.startsWith('vsc1')
  const { data, isLoading, isError } = useContract(contractId!, !invalidContractId)
  const ct = data?.data.contract
  const outputs = data?.data.outputs

  const filters = parseFiltersFromSearchParams(searchParams)
  const blockRange = useBlockRange(filters)
  const filterOpts = buildTxFilterOptions(filters, blockRange, { byContract: contractId })
  const txPage = parseInt(searchParams.get('page') || '1')
  const txOffset = (txPage - 1) * txCount
  const { data: txData } = useQuery({
    queryKey: ['vsc-contract-txns', contractId, txOffset, txCount, filterOpts],
    queryFn: () => fetchL2TxnsBy(txOffset, txCount, filterOpts),
    enabled: !invalidContractId
  })
  const txns = txData?.txns
  const txStats = useHistoryStats('txs', buildHistoryStatOpts(filters, blockRange, { contract: contractId }), !invalidContractId)

  const buildTxPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    return `/contract/${contractId}` + (qs ? '?' + qs : '')
  }
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
          <Tag.Root colorPalette={themeColorScheme} size={'lg'} variant={'outline'} alignSelf={'end'} mb={'3'}>
            {Flairs[contractId!]}
          </Tag.Root>
        )}
      </Stack>
      <hr />
      {isLoading ? <Skeleton h={'20px'} mt={'20px'} /> : null}
      {!!contract ? (
        <Box mt={'4'}>
          <AddressBalanceCard addr={'contract:' + contract.id} />
          <Tabs.Root value={activeTab} onValueChange={(d) => setActiveTab(d.value)} mt={'7'} colorPalette={themeColorScheme} variant={'enclosed'}>
            <Tabs.List overflowX={'auto'} whiteSpace={'nowrap'} maxW={'100%'} display={'flex'} css={{ '& > button': { flexShrink: 0 } }}>
              <Tabs.Trigger value="0">Transactions</Tabs.Trigger>
              <Tabs.Trigger value="1">Outputs</Tabs.Trigger>
              <Tabs.Trigger value="2">Info</Tabs.Trigger>
              <Tabs.Trigger value="3">Storage Proof</Tabs.Trigger>
              <Tabs.Trigger value="4">Read State</Tabs.Trigger>
              <Tabs.Trigger value="5">Call Contract</Tabs.Trigger>
              <Tabs.Trigger value="6">Source Code</Tabs.Trigger>
              <Tabs.Trigger value="7">History</Tabs.Trigger>
              {activeTab === '0' && (
                <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
                  <TxFilterToggle open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />
                </Box>
              )}
            </Tabs.List>
            <Tabs.Content value="0" pt={'2'} px={'0'}>
              <TxFilterBar open={filtersOpen} basePath={`/contract/${contractId}`} />
              <Txns txs={txns || []} pov={contractId} />
              <Pagination
                path={`/contract/${contractId}`}
                currentPageNum={txPage}
                maxPageNum={Math.ceil((txStats?.count || 0) / txCount)}
                buildLink={buildTxPageLink}
              />
            </Tabs.Content>
            <Tabs.Content value="1" px={'0'} pt={'2'}>
              <ContractOutputTbl outputs={outputs || []} />
            </Tabs.Content>
            <Tabs.Content value="2" px={'0'}>
              <Table.ScrollArea>
                <Table.Root>
                  <Table.Body>
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
                          <LuCircleCheck color={themeColorScheme} aria-label="Contract source code verified" />
                        ) : null}
                      </Flex>
                    </TableRow>
                    <TableRow label="Runtime" value={contract.runtime} />
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Tabs.Content>
            <Tabs.Content value="3">{!!contract && <StorageProof contract={contract} />}</Tabs.Content>
            <Tabs.Content value="4" px={0}>
              <ReadState contractId={contract.id} />
            </Tabs.Content>
            <Tabs.Content value="5" px={0}>
              <CallContract contractId={contract.id} />
            </Tabs.Content>
            <Tabs.Content value="6">
              {verifInfo ? (
                verifInfo.status === 'success' ? (
                  <>
                    <Flex align={'center'} gap={'2'}>
                      <LuCircleCheck color={themeColorScheme} />
                      <Heading fontSize={'md'}>Contract source code verified</Heading>
                    </Flex>
                    <Text m={'5px 0'}>
                      Magi Blocks has verified that the source code provided to us matches the deployed bytecode for the contract.
                      This does not mean the contract is safe to interact with.
                    </Text>
                    <Card.Root mt={'5'} mb={'5'}>
                      <Card.Body>
                        <Table.ScrollArea>
                          <Table.Root>
                            <Table.Body>
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
                              {verifInfo.contract_dir ? (
                                <TableRow label="Contract Directory" value={verifInfo.contract_dir} isInCard minimalSpace />
                              ) : null}
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
                                    <Tag.Root colorPalette={themeColorScheme} key={i}>
                                      {method}
                                    </Tag.Root>
                                  ))}
                                </Flex>
                              </TableRow>
                            </Table.Body>
                          </Table.Root>
                        </Table.ScrollArea>
                      </Card.Body>
                    </Card.Root>
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
                    <LuTriangleAlert />
                    <Text fontSize={'md'}>Contract verification failed to complete.</Text>
                  </Flex>
                ) : verifInfo.status === 'not match' ? (
                  <Flex align={'center'} gap={'2'}>
                    <LuTriangleAlert />
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
                    <LuCircleHelp color={themeColorScheme} />
                    <Heading fontSize={'md'}>Contract source code not verified</Heading>
                  </Flex>
                  <Text m={'5px 0'}>Source code for this contract is unknown.</Text>
                </>
              )}
            </Tabs.Content>
            <Tabs.Content value="7" pt={'2'} px={'0'}>
              <ContractHistoryTbl history={history} />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      ) : isError ? (
        <Text>Failed to fetch contract</Text>
      ) : !isLoading ? (
        <Text>Contract does not exist</Text>
      ) : null}
    </>
  )
}
