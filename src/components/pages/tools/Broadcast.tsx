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
import { KeyTypes, VscStakeType } from '@aioha/aioha'
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

// Witness-vote governance and consensus-upgrade ops implemented by the node.
// Unlike the ledger ops above, these are plain Hive L1 custom_json ops signed
// with the active key, so they are broadcast through aioha instead of
// @aioha/magi.
type GovernanceTxType = 'vsc.slash_restore' | 'vsc.reserve_payout' | 'vsc.reserve_vote' | 'vsc.admit_vote'
type ConsensusUpgradeTxType = 'vsc.propose_consensus_version'
type CustomJsonTxType = GovernanceTxType | ConsensusUpgradeTxType
type BroadcastTxType = TxnTypes | CustomJsonTxType
type BroadcastResult =
  | { success: true; result: string }
  | { success: false; error: string; errorCode: number }

// amount: HIVE-denominated value converted to the node's milli-HIVE base units.
// integer: non-negative whole number (version components, epoch heights).
type CustomJsonFieldKind = 'text' | 'amount' | 'integer'

interface CustomJsonField {
  // Payload key, e.g. "recipient" or "ubo_id".
  key: string
  label: string
  kind?: CustomJsonFieldKind
  // Optional fields are omitted from the payload when left blank.
  optional?: boolean
  placeholder?: string
  defaultValue?: string
}

interface CustomJsonTx {
  type: CustomJsonTxType
  label: string
  fields: CustomJsonField[]
  // Ops that carry the network id; it is always taken from getConf(), never user input.
  withNetId?: boolean
}

interface CustomJsonTxGroup {
  label: string
  txs: CustomJsonTx[]
}

// Payload shapes match the node handlers exactly:
//   vsc.slash_restore            {"id": "<slash tx id>", "account": "<slashed account>"}
//   vsc.reserve_payout           {"recipient": "<account>", "amount": <base units>, "reason": "<text>"}
//   vsc.reserve_vote             {"id": "<proposal id>"}
//   vsc.admit_vote               {"candidate": "<account>", "ubo_id": "<id>", "net_id": "<net>"}
//   vsc.propose_consensus_version {"net_id": "<net>", "major": <n>, "consensus": <n>,
//                                  "non_consensus": <n>, "activation_epoch": <n>}
// net_id is injected from getConf() for the ops that need it (never a form field).
const getCustomJsonTxGroups = (t: TFunction): CustomJsonTxGroup[] => [
  {
    label: t('governance', { ns: 'nav' }),
    txs: [
      {
        type: 'vsc.slash_restore',
        label: t('broadcast.txTypes.slash_restore'),
        fields: [
          { key: 'id', label: t('broadcast.fields.slashTxId') },
          { key: 'account', label: t('broadcast.fields.slashedAccount') }
        ]
      },
      {
        type: 'vsc.reserve_payout',
        label: t('broadcast.txTypes.reserve_payout'),
        fields: [
          { key: 'recipient', label: t('broadcast.fields.recipient') },
          { key: 'amount', label: t('broadcast.fields.amountHive'), kind: 'amount' },
          { key: 'reason', label: t('broadcast.fields.reason') }
        ]
      },
      {
        type: 'vsc.reserve_vote',
        label: t('broadcast.txTypes.reserve_vote'),
        fields: [{ key: 'id', label: t('broadcast.fields.proposalId') }]
      },
      {
        type: 'vsc.admit_vote',
        label: t('broadcast.txTypes.admit_vote'),
        fields: [
          { key: 'candidate', label: t('broadcast.fields.candidate') },
          { key: 'ubo_id', label: t('broadcast.fields.uboId') }
        ],
        withNetId: true
      }
    ]
  },
  {
    label: t('broadcast.groups.consensusUpgrades'),
    txs: [
      {
        type: 'vsc.propose_consensus_version',
        label: t('broadcast.txTypes.propose_consensus_version'),
        withNetId: true,
        fields: [
          { key: 'major', label: t('broadcast.fields.majorVersion'), kind: 'integer' },
          { key: 'consensus', label: t('broadcast.fields.consensusVersion'), kind: 'integer' },
          { key: 'non_consensus', label: t('broadcast.fields.nonConsensusVersion'), kind: 'integer', defaultValue: '0' },
          {
            key: 'activation_epoch',
            label: t('broadcast.fields.activationEpoch'),
            kind: 'integer',
            optional: true,
            placeholder: t('broadcast.fields.nextEpoch')
          }
        ]
      }
    ]
  }
]

export const Broadcast = () => {
  const { t } = useTranslation('tools')
  const txTypes = getTxTypes(t)
  const conf = getConf()
  const customJsonTxGroups = getCustomJsonTxGroups(t)
  const customJsonTxs = customJsonTxGroups.flatMap((group) => group.txs)
  const { magi, user, wallet } = useMagi()
  const { aioha } = useAioha()
  const [walletOpen, setWalletOpen] = useState(false)
  const [txType, setTxType] = useState<BroadcastTxType>('transfer')
  const [dest, setDest] = useState<string>('')
  const [amt, setAmt] = useState<string>('')
  const [asset, setAsset] = useState<string>('hive')
  const [memo, setMemo] = useState<string>('')
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const navigate = useNavigate()
  const amountStackDirection = useBreakpointValue<'column' | 'row'>({ base: 'column', sm: 'row' })
  const amountMaxW = useBreakpointValue({ base: undefined, sm: '56' })
  const customJsonTx = customJsonTxs.find((op) => op.type === txType)
  const customFieldValue = (field: CustomJsonField) => customValues[field.key] ?? field.defaultValue ?? ''
  const selectTxType = (type: BroadcastTxType) => {
    setTxType(type)
    setCustomValues({})
  }
  const isFormReady = customJsonTx
    ? customJsonTx.fields.every((field) => field.optional || customFieldValue(field).trim() !== '')
    : !!amt
  const submitClicked = async () => {
    let result: BroadcastResult | undefined
    if (customJsonTx) {
      if (wallet !== Wallet.Hive) {
        return toaster.error({ title: t('broadcast.errors.customJsonHiveWalletOnly') })
      }
      const payload: Record<string, string | number> = {}
      if (customJsonTx.withNetId) payload.net_id = conf.netId
      for (const field of customJsonTx.fields) {
        const value = customFieldValue(field).trim()
        if (!value) {
          if (field.optional) continue
          return toaster.error({ title: t('broadcast.errors.fieldRequired', { field: field.label }) })
        }
        if (field.kind === 'amount') {
          const num = parseFloat(value)
          if (isNaN(num) || num <= 0) {
            return toaster.error({ title: t('broadcast.errors.amountPositive') })
          }
          const baseUnits = Math.round(num * 1000)
          if (baseUnits < 1) {
            return toaster.error({ title: t('broadcast.errors.amountPositive') })
          }
          payload[field.key] = baseUnits
        } else if (field.kind === 'integer') {
          const num = Number(value)
          if (!Number.isInteger(num) || num < 0) {
            return toaster.error({ title: t('broadcast.errors.integerRequired') })
          }
          payload[field.key] = num
        } else {
          payload[field.key] = value
        }
      }
      setIsSpinning(true)
      result = await aioha.customJSON(KeyTypes.Active, customJsonTx.type, JSON.stringify(payload))
    } else {
      const to = !!dest ? dest : magi.getUser(true)!
      const amount = parseFloat(amt || '')
      if (isNaN(amount) || amount <= 0) {
        return toaster.error({ title: t('broadcast.errors.amountPositive') })
      }
      if (txType === 'deposit' && asset === 'hbd_savings') {
        return toaster.error({ title: t('broadcast.errors.depositAsset') })
      }
      if (txType === 'deposit' && wallet !== Wallet.Hive) {
        return toaster.error({ title: t('broadcast.errors.hiveWalletOnly') })
      }
      const currency = assetToEnum[asset]
      setIsSpinning(true)
      switch (txType) {
        case 'deposit':
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
      }
    }
    setIsSpinning(false)
    if (!result) {
      return toaster.error({ title: t('broadcast.errors.unknownType') })
    }
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
                    <NativeSelect.Field value={txType} onChange={(e) => selectTxType(e.target.value as BroadcastTxType)}>
                      {txTypes.map((type) => (
                        <option key={type[0]} value={type[0]}>
                          {type[1]}
                        </option>
                      ))}
                      {customJsonTxGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.txs.map((op) => (
                            <option key={op.type} value={op.type}>
                              {op.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
                {customJsonTx ? (
                  customJsonTx.fields.map((field) => (
                    <Field.Root key={field.key}>
                      <Field.Label>{field.label}</Field.Label>
                      <Input
                        type={field.kind === 'text' || !field.kind ? 'text' : 'number'}
                        step={field.kind === 'amount' ? 'any' : field.kind === 'integer' ? 1 : undefined}
                        min={field.kind ? 0 : undefined}
                        placeholder={field.placeholder}
                        value={customFieldValue(field)}
                        onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    </Field.Root>
                  ))
                ) : (
                  <>
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
                      <Stack direction={amountStackDirection}>
                        <Stack direction={'row'}>
                          <Input
                            type="number"
                            value={amt}
                            onChange={(e) => setAmt(e.target.value)}
                            maxW={amountMaxW}
                            textAlign={'right'}
                          />
                          <NativeSelect.Root width="auto" minW={'24'}>
                            <NativeSelect.Field value={asset} onChange={(e) => setAsset(e.target.value)}>
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
                  </>
                )}
              </Stack>
              <Button
                colorPalette={themeColorScheme}
                onClick={submitClicked}
                disabled={isSpinning || !user || !isFormReady}
                w={'fit-content'}
              >
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
