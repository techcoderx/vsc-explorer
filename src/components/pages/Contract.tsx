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
  getDeposits,
  getStateKeys,
  getWithdrawals,
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
import { buildTxFilterOptions, buildHistoryStatOpts, useBlockRange } from '../../txFilterHelpers'
import { L1TxHeader } from '../../types/L1ApiResult'
import { useTranslation } from 'react-i18next'
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
import { LedgerTxsTbl, LedgerActionsTbl } from '../tables/Ledgers'
import { LedgerFilterBar, LedgerFilterToggle } from '../LedgerFilterBar'
import { emptyLedgerFilters, countActiveFilters, buildLedgerGqlOpts, buildLedgerStatOpts, LedgerFilterState } from '../../ledgerFilterHelpers'
import { TxFilterState, emptyTxFilters, countActiveTxFilters } from '../../types/TxFilters'
import { toaster } from '../ui/toaster'
import { btnGroupCss } from '../../styles/btnGroup'

const StorageProof = ({ contract }: { contract: ContractType }) => {
  const { t } = useTranslation('contract')
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
    <Text>{t('storageProofLoading')}</Text>
  ) : deployTxErr || mbErr ? (
    <Text>{t('storageProofError')}</Text>
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
  const { t } = useTranslation('contract')
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
        setErr(t('readState.gqlError'))
      } else {
        setVal(sk.data.state[key])
      }
    } catch {
      setErr(t('readState.fetchError'))
    }
    setIsLoading(false)
  }
  return (
    <VStack gap={'4'} w={'full'}>
      <HStack gap={'3'} w={'full'}>
        <Input
          type="text"
          placeholder={t('readState.key')}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? read() : null)}
        />
        <Button colorPalette={themeColorScheme} onClick={read} disabled={isLoading}>
          <Flex gap={'2'} align={'center'}>
            <Spinner size={'sm'} hidden={!isLoading} />
            <Text>{t('read', { ns: 'common' })}</Text>
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
                <RadioGroup.ItemText>{t('readState.utf8')}</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="1">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>{t('readState.hex')}</RadioGroup.ItemText>
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
  const { t } = useTranslation('contract')
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
      return toaster.error({ title: t('callContract.walletNotConnected') })
    } else if (isNaN(amt) || amt <= 0) {
      return toaster.error({ title: t('callContract.amountMustBePositive') })
    } else if (Math.round(amt * 1000) > balance.bal[newIntentToken]) {
      return toaster.error({ title: t('callContract.insufficientBalance') })
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
      return toaster.error({ title: t('callContract.pleaseConnectWallet') })
    }
    if (!methodName) {
      return toaster.error({ title: t('callContract.methodRequired') })
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
      return toaster.error({ title: t('callContract.simulationFailed'), description: sim.err_msg || sim.err })
    }
    const rcLimitInt = Math.ceil(parseInt(sim.rc_used) * 1.25)
    const callResult = await magi.call(contractId, methodName, payload, rcLimitInt, intentsArr, effectiveKeyType)
    if (!callResult.success) {
      return toaster.error({ title: callResult.error })
    } else {
      return toaster.success({
        title: t('txBroadcastSuccess', { ns: 'common' }),
        description: (
          <Link
            onClick={(evt) => {
              evt.preventDefault()
              navigate('/tx/' + callResult.result)
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
      <Card.Root>
        <Card.Body>
          <Stack direction={'column'} gap={'3'}>
            <Field.Root>
              <Field.Label>{t('form.username', { ns: 'common' })}</Field.Label>
              <Button
                variant={'outline'}
                colorPalette={'gray'}
                _focus={{ boxShadow: 'none' }}
                onClick={() => setWalletOpen(true)}
              >
                {user ? <Box as={wallet === Wallet.Ethereum ? FaEthereum : FaHive} fontSize={'lg'} /> : null}
                {user ?? t('connectWallet', { ns: 'common' })}
              </Button>
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('form.method', { ns: 'common' })}</Field.Label>
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
              <Field.Label>{t('form.payload', { ns: 'common' })}</Field.Label>
              <Input type="text" value={payload} onChange={(e) => setPayload(e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('form.intents', { ns: 'common' })}</Field.Label>
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
                    {t('clearAll', { ns: 'common' })}
                  </Button>
                </Stack>
              </Stack>
              <Field.HelperText>
                {/* eslint-disable-next-line react-hooks/refs */}
                {t('callContract.currentAllowance')}: {intents.current[newIntentToken].toFixed(3)} {magiAssetDisplay(newIntentToken)}
              </Field.HelperText>
            </Field.Root>
            {wallet === Wallet.Hive && (
              <Field.Root>
                <Field.Label>{t('form.keyType', { ns: 'common' })}</Field.Label>
                <Box css={btnGroupCss}>
                  <Button
                    colorPalette={keyType === KeyTypes.Posting ? themeColorScheme : 'gray'}
                    variant="outline"
                    onClick={() => setKeyType(KeyTypes.Posting)}
                  >
                    {t('form.posting', { ns: 'common' })}
                  </Button>
                  <Button
                    colorPalette={keyType === KeyTypes.Active ? themeColorScheme : 'gray'}
                    variant="outline"
                    onClick={() => setKeyType(KeyTypes.Active)}
                  >
                    {t('form.active', { ns: 'common' })}
                  </Button>
                </Box>
              </Field.Root>
            )}
          </Stack>
          <Button colorPalette={themeColorScheme} mt={'5'} onClick={call} w={'fit-content'}>
            {t('tabs.callContract')}
          </Button>
        </Card.Body>
      </Card.Root>
      <AiohaModal displayed={walletOpen} onClose={() => setWalletOpen(false)} initPage={0} />
    </>
  )
}

const txCount = 100

export const Contract = () => {
  const { t } = useTranslation('contract')
  const { contractId } = useParams()
  const [searchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('0')
  const [txFilters, setTxFilters] = useState<TxFilterState>(emptyTxFilters)
  const [ledgerFilters, setLedgerFilters] = useState<LedgerFilterState>(emptyLedgerFilters)
  const [actionFilters, setActionFilters] = useState<LedgerFilterState>(emptyLedgerFilters)
  const invalidContractId = !contractId?.startsWith('vsc1')
  const { data, isLoading, isError } = useContract(contractId!, !invalidContractId)
  const ct = data?.data.contract
  const outputs = data?.data.outputs

  const blockRange = useBlockRange(txFilters)
  const filterOpts = buildTxFilterOptions(txFilters, blockRange, { byContract: contractId })
  const txPage = parseInt(searchParams.get('page') || '1')
  const txOffset = (txPage - 1) * txCount
  const { data: txData } = useQuery({
    queryKey: ['vsc-contract-txns', contractId, txOffset, txCount, filterOpts],
    queryFn: () => fetchL2TxnsBy(txOffset, txCount, filterOpts),
    enabled: !invalidContractId
  })
  const txns = txData?.txns
  const txStats = useHistoryStats('txs', buildHistoryStatOpts(txFilters, blockRange, { contract: contractId }), !invalidContractId)

  const contractAddr = 'contract:' + contractId
  const ledgerBlockRange = useBlockRange(ledgerFilters)
  const ledgerGqlOpts = buildLedgerGqlOpts(ledgerFilters, ledgerBlockRange, { byToFrom: contractAddr })
  const ledgerPage = parseInt(searchParams.get('lpage') || '1')
  const ledgerOffset = (ledgerPage - 1) * txCount
  const { data: ledgerData } = useQuery({
    queryKey: ['vsc-contract-ledgers', contractId, ledgerOffset, txCount, ledgerGqlOpts],
    queryFn: () => getDeposits(ledgerOffset, txCount, ledgerGqlOpts),
    enabled: !invalidContractId
  })
  const ledgerStats = useHistoryStats('ledger_txs', buildLedgerStatOpts(ledgerFilters, ledgerBlockRange, { user: contractAddr }), !invalidContractId)

  const actionBlockRange = useBlockRange(actionFilters)
  const actionGqlOpts = buildLedgerGqlOpts(actionFilters, actionBlockRange, { byAccount: contractAddr })
  const actionsPage = parseInt(searchParams.get('apage') || '1')
  const actionsOffset = (actionsPage - 1) * txCount
  const { data: actionsData } = useQuery({
    queryKey: ['vsc-contract-actions', contractId, actionsOffset, txCount, actionGqlOpts],
    queryFn: () => getWithdrawals(actionsOffset, txCount, actionGqlOpts),
    enabled: !invalidContractId
  })
  const actionsStats = useHistoryStats('ledger_actions', buildLedgerStatOpts(actionFilters, actionBlockRange, { user: contractAddr }), !invalidContractId)

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
  const buildLedgerPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('lpage', String(page))
    } else {
      params.delete('lpage')
    }
    const qs = params.toString()
    return `/contract/${contractId}` + (qs ? '?' + qs : '')
  }
  const buildActionsPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('apage', String(page))
    } else {
      params.delete('apage')
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
          <Heading as="h1" size="5xl" fontWeight="normal">{t('title')}</Heading>
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
              <Tabs.Trigger value="0">{t('tabs.transactions')}</Tabs.Trigger>
              <Tabs.Trigger value="1">{t('tabs.outputs')}</Tabs.Trigger>
              <Tabs.Trigger value="8">{t('tabs.ledgerOps')}</Tabs.Trigger>
              <Tabs.Trigger value="9">{t('tabs.actions')}</Tabs.Trigger>
              <Tabs.Trigger value="2">{t('tabs.info')}</Tabs.Trigger>
              <Tabs.Trigger value="3">{t('tabs.storageProof')}</Tabs.Trigger>
              <Tabs.Trigger value="4">{t('tabs.readState')}</Tabs.Trigger>
              <Tabs.Trigger value="5">{t('tabs.callContract')}</Tabs.Trigger>
              <Tabs.Trigger value="6">{t('tabs.sourceCode')}</Tabs.Trigger>
              <Tabs.Trigger value="7">{t('tabs.history')}</Tabs.Trigger>
              {activeTab === '0' && (
                <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
                  <TxFilterToggle activeCount={countActiveTxFilters(txFilters)} open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />
                </Box>
              )}
              {activeTab === '8' && (
                <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
                  <LedgerFilterToggle activeCount={countActiveFilters(ledgerFilters)} open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />
                </Box>
              )}
              {activeTab === '9' && (
                <Box marginStart={'auto'} flexShrink={0} my={'auto'}>
                  <LedgerFilterToggle activeCount={countActiveFilters(actionFilters)} open={filtersOpen} onToggle={() => setFiltersOpen((p) => !p)} />
                </Box>
              )}
            </Tabs.List>
            <Tabs.Content value="0" pt={'2'} px={'0'}>
              <TxFilterBar open={filtersOpen} onApply={setTxFilters} onReset={() => setTxFilters(emptyTxFilters)} />
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
            <Tabs.Content value="8" pt={'2'} px={'0'}>
              <LedgerFilterBar
                open={filtersOpen}
                variant="ledger_txs"
                onApply={setLedgerFilters}
                onReset={() => setLedgerFilters(emptyLedgerFilters)}
              />
              <LedgerTxsTbl txs={ledgerData?.deposits || []} />
              <Pagination
                path={`/contract/${contractId}`}
                currentPageNum={ledgerPage}
                maxPageNum={Math.min(100, Math.ceil((ledgerStats?.count || 0) / txCount))}
                buildLink={buildLedgerPageLink}
              />
            </Tabs.Content>
            <Tabs.Content value="9" pt={'2'} px={'0'}>
              <LedgerFilterBar
                open={filtersOpen}
                variant="ledger_actions"
                onApply={setActionFilters}
                onReset={() => setActionFilters(emptyLedgerFilters)}
              />
              <LedgerActionsTbl actions={actionsData?.withdrawals || []} />
              <Pagination
                path={`/contract/${contractId}`}
                currentPageNum={actionsPage}
                maxPageNum={Math.min(100, Math.ceil((actionsStats?.count || 0) / txCount))}
                buildLink={buildActionsPageLink}
              />
            </Tabs.Content>
            <Tabs.Content value="2" px={'0'}>
              <Table.ScrollArea>
                <Table.Root>
                  <Table.Body>
                    <TableRow
                      label={t('info.createdAt')}
                      value={contract ? contract.creation_ts + ' (' + timeAgo(contract.creation_ts) + ')' : ''}
                      isLoading={isLoading}
                    />
                    <TableRow
                      label={t('info.createdInL1Block')}
                      value={contract.creation_height}
                      link={beL1BlockUrl(contract.creation_height)}
                      isLoading={isLoading}
                    />
                    <TableRow label={t('info.creationTx')} value={contract.tx_id} link={'/tx/' + contract.tx_id} />
                    <TableRow label={t('info.creator')}>
                      <AccountLink val={contract.creator} />
                    </TableRow>
                    <TableRow label={t('info.owner')}>
                      <AccountLink val={contract.owner} />
                    </TableRow>
                    <TableRow label={t('info.bytecodeCid')}>
                      <Flex align={'center'} gap={'2'}>
                        <Text>{contract.code}</Text>
                        {verifInfo && verifInfo.status === 'success' ? (
                          <LuCircleCheck color={themeColorScheme} aria-label={t('verification.verified')} />
                        ) : null}
                      </Flex>
                    </TableRow>
                    <TableRow label={t('info.runtime')} value={contract.runtime} />
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
                      <Heading fontSize={'md'}>{t('verification.verified')}</Heading>
                    </Flex>
                    <Text m={'5px 0'}>
                      {t('verification.verifiedDescription')}
                    </Text>
                    <Card.Root mt={'5'} mb={'5'}>
                      <Card.Body>
                        <Table.ScrollArea>
                          <Table.Root>
                            <Table.Body>
                              <TableRow label={t('verification.language')} value={verifInfo.lang} isInCard minimalSpace />
                              {!!verifInfo.license ? (
                                <TableRow label={t('verification.license')} value={verifInfo.license} isInCard minimalSpace />
                              ) : null}
                              <TableRow label={t('verification.verifiedAt')} isInCard minimalSpace>
                                {verifInfo.verified_ts + ' (' + timeAgo(verifInfo.verified_ts) + ')'}
                              </TableRow>
                              <TableRow label={t('verification.submittedBy')} isInCard minimalSpace>
                                <AccountLink val={'hive:' + verifInfo.verifier} />
                              </TableRow>
                              <TableRow
                                label={t('verification.repository')}
                                value={`${verifInfo.repo_name} (${verifInfo.git_commit.slice(0, 8)})`}
                                link={`https://github.com/${verifInfo.repo_name}/tree/${verifInfo.git_commit}`}
                                isInCard
                                minimalSpace
                              />
                              {verifInfo.contract_dir ? (
                                <TableRow label={t('verification.contractDirectory')} value={verifInfo.contract_dir} isInCard minimalSpace />
                              ) : null}
                              {verifInfo.go_mod_dir ? (
                                <TableRow label={t('verification.goModuleDirectory')} value={verifInfo.go_mod_dir} isInCard minimalSpace />
                              ) : null}
                              <TableRow
                                label={t('verification.tinyGoVersion')}
                                value={`v${verifInfo.tinygo_version} (Go: v${verifInfo.go_version})`}
                                link={`https://hub.docker.com/layers/tinygo/tinygo/${verifInfo.tinygo_version}`}
                                isInCard
                                minimalSpace
                              />
                              <TableRow label={t('verification.exports')} isInCard minimalSpace>
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
                    <Text fontSize={'md'}>{t('verification.queued')}</Text>
                  </Flex>
                ) : verifInfo.status === 'in progress' ? (
                  <Flex align={'center'} gap={'2'}>
                    <Spinner size={'sm'} />
                    <Text fontSize={'md'}>{t('verification.inProgress')}</Text>
                  </Flex>
                ) : verifInfo.status === 'failed' ? (
                  <Flex align={'center'} gap={'2'}>
                    <LuTriangleAlert />
                    <Text fontSize={'md'}>{t('verification.failed')}</Text>
                  </Flex>
                ) : verifInfo.status === 'not match' ? (
                  <Flex align={'center'} gap={'2'}>
                    <LuTriangleAlert />
                    <Text fontSize={'md'}>{t('verification.notMatch')}</Text>
                  </Flex>
                ) : verifInfo.status === 'pending' ? (
                  <Flex align={'center'} gap={'2'}>
                    <Spinner size={'sm'} />
                    <Text fontSize={'md'}>{t('verification.pending')}</Text>
                  </Flex>
                ) : null
              ) : verifError ? (
                <Text>{t('verification.fetchError')}</Text>
              ) : verifLoading ? (
                <Flex align={'center'} gap={'2'}>
                  <Spinner size={'sm'} />
                  <Text fontSize={'md'}>{t('verification.loading')}</Text>
                </Flex>
              ) : (
                <>
                  <Flex align={'center'} gap={'2'}>
                    <LuCircleHelp color={themeColorScheme} />
                    <Heading fontSize={'md'}>{t('verification.notVerified')}</Heading>
                  </Flex>
                  <Text m={'5px 0'}>{t('verification.unknown')}</Text>
                </>
              )}
            </Tabs.Content>
            <Tabs.Content value="7" pt={'2'} px={'0'}>
              <ContractHistoryTbl history={history} />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      ) : isError ? (
        <Text>{t('errors.fetchFailed')}</Text>
      ) : !isLoading ? (
        <Text>{t('errors.notExist')}</Text>
      ) : null}
    </>
  )
}
