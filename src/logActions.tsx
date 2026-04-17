/* eslint-disable react-refresh/only-export-components */
import { ReactNode } from 'react'
import { Text, HStack } from '@chakra-ui/react'
import { FaCircleArrowRight } from 'react-icons/fa6'
import { AccountLink, ContractLink } from './components/TableLink'
import { formatTokenAmount, thousandSeperator, formatSats } from './helpers'
import { LogActionMetadata } from './types/HasuraResult'

// Static contract addresses -> type labels
const STATIC_CONTRACT_TYPES: Record<string, string> = {
  vsc1Brvi4YZHLkocYNAFd7Gf1JpsPjzNnv4i45: 'dex_router',
  vsc1BdrQ6EtbQ64rq2PkPd21x4MaLnVRcJj85d: 'btc_mapping',
  vsc1BVLuXCWC1UShtDBenWJ2B6NWpnyV2T637n: 'oki_inarow',
  vsc1BgfucQVHwYBHuK2yMEv4AhYua9rtQ45Uoe: 'oki_escrow',
  vsc1BiM4NC1yeGPCjmq8FC3utX8dByizjcCBk7: 'oki_lottery',
  vsc1Ba9AyyUcMnYVoDVsjoJztnPFHNxQwWBPsb: 'oki_dao'
}

// CSV key delimiters by contract type
const COLON_DELIM_TYPES = new Set(['oki_lottery', 'oki_dao'])

export interface ParsedLog {
  eventType: string
  fields: Record<string, string>
}

// Hasura's contract_type_lookup view exposes the discover_event name; translate to the logical type used by describeAction.
const HASURA_TYPE_MAP: Record<string, string> = {
  init_magi_token: 'magi_token',
  init_magi_nft: 'magi_nft',
  pool_init: 'dex_pool'
}

export const resolveContractType = (contractId: string, hasuraTypes: Record<string, string>): string | null => {
  if (STATIC_CONTRACT_TYPES[contractId]) return STATIC_CONTRACT_TYPES[contractId]
  const hasuraType = hasuraTypes[contractId]
  if (!hasuraType) return null
  return HASURA_TYPE_MAP[hasuraType] ?? hasuraType
}

export const getStaticContractTypes = () => STATIC_CONTRACT_TYPES

export const parseLog = (contractType: string | null, logStr: string): ParsedLog => {
  const trimmed = logStr.trim()

  // JSON format
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed)
      const eventType: string = obj.type ?? ''
      const fields: Record<string, string> = {}
      if (obj.attributes && typeof obj.attributes === 'object') {
        for (const [k, v] of Object.entries(obj.attributes)) {
          fields[k] = String(v)
        }
      }
      return { eventType, fields }
    } catch {
      return { eventType: '', fields: { raw: logStr } }
    }
  }

  // CSV format
  const parts = trimmed.split('|')
  const eventType = parts[0] ?? ''
  const fields: Record<string, string> = {}

  // Determine key delimiter based on contract type
  let keySep = '='
  if (contractType && COLON_DELIM_TYPES.has(contractType)) {
    keySep = ':'
  } else if (!contractType) {
    // Auto-detect: check if tokens contain = or :
    const sample = parts[1] ?? ''
    if (sample.includes(':') && !sample.includes('=')) keySep = ':'
  }

  for (let i = 1; i < parts.length; i++) {
    const idx = parts[i].indexOf(keySep)
    if (idx > 0) {
      fields[parts[i].substring(0, idx)] = parts[i].substring(idx + 1)
    }
  }

  return { eventType, fields }
}

const Arrow = () => <FaCircleArrowRight style={{ display: 'inline', verticalAlign: 'middle' }} />

const fmtDexAmount = (amount: string, asset: string): string => {
  const upper = asset.toUpperCase()
  if (upper === 'HIVE' || upper === 'HBD') {
    const num = parseInt(amount, 10)
    if (!isNaN(num)) return `${thousandSeperator(Math.round((num / 1000) * 1000) / 1000)} ${upper}`
  }
  if (upper === 'BTC' || upper === 'SATS') return formatSats(amount)
  return `${thousandSeperator(amount)} ${upper}`
}

// --- Description generators by contract type ---

const describeToken = (
  contractId: string,
  eventType: string,
  f: Record<string, string>,
  meta: LogActionMetadata
): ReactNode | null => {
  const info = meta.tokenInfo[contractId]
  const sym = info?.symbol ?? '???'
  const dec = info?.decimals ?? 0
  const fmtAmt = (raw: string) => (info ? formatTokenAmount(raw, dec) : raw)

  switch (eventType) {
    case 'transfer': {
      const from = f.from ?? ''
      const to = f.to ?? ''
      const amt = fmtAmt(f.amount ?? '0')
      if (!from || from === 'null') {
        return (
          <HStack gap={'1.5'} flexWrap={'wrap'}>
            <Text>
              Mint {amt} {sym} to
            </Text>
            <AccountLink val={to} />
          </HStack>
        )
      }
      if (!to || to === 'null') {
        return (
          <HStack gap={'1.5'} flexWrap={'wrap'}>
            <Text>
              Burn {amt} {sym} from
            </Text>
            <AccountLink val={from} />
          </HStack>
        )
      }
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>
            Transfer {amt} {sym}
          </Text>
          <AccountLink val={from} />
          <Arrow />
          <AccountLink val={to} />
        </HStack>
      )
    }
    case 'approval':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.owner ?? ''} />
          <Text>approved</Text>
          <AccountLink val={f.spender ?? ''} />
          <Text>
            to spend {fmtAmt(f.amount ?? '0')} {sym}
          </Text>
        </HStack>
      )
    case 'ownerChange':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Ownership transferred</Text>
          <AccountLink val={f.previousOwner ?? ''} />
          <Arrow />
          <AccountLink val={f.newOwner ?? ''} />
        </HStack>
      )
    case 'paused':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Token paused by</Text>
          <AccountLink val={f.by ?? ''} />
        </HStack>
      )
    case 'unpaused':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Token unpaused by</Text>
          <AccountLink val={f.by ?? ''} />
        </HStack>
      )
    case 'init_magi_token':
      return (
        <Text>
          Token initialized: {f.name ?? ''} ({f.symbol ?? ''})
        </Text>
      )
    default:
      return null
  }
}

const describeNft = (
  contractId: string,
  eventType: string,
  f: Record<string, string>,
  meta: LogActionMetadata
): ReactNode | null => {
  const info = meta.nftInfo[contractId]
  const label = info ? `${info.name} ` : ''

  switch (eventType) {
    case 'TransferSingle': {
      const from = f.from ?? ''
      const to = f.to ?? ''
      const id = f.id ?? ''
      const value = f.value ?? '1'
      const qty = value !== '1' ? ` (x${value})` : ''
      if (!from || from === 'null') {
        return (
          <HStack gap={'1.5'} flexWrap={'wrap'}>
            <Text>
              Mint {label}NFT #{id}
              {qty} to
            </Text>
            <AccountLink val={to} />
          </HStack>
        )
      }
      if (!to || to === 'null') {
        return (
          <HStack gap={'1.5'} flexWrap={'wrap'}>
            <Text>
              Burn {label}NFT #{id}
              {qty} from
            </Text>
            <AccountLink val={from} />
          </HStack>
        )
      }
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>
            Transfer {label}NFT #{id}
            {qty}
          </Text>
          <AccountLink val={from} />
          <Arrow />
          <AccountLink val={to} />
        </HStack>
      )
    }
    case 'TransferBatch': {
      const from = f.from ?? ''
      const to = f.to ?? ''
      if (!from || from === 'null') {
        return (
          <HStack gap={'1.5'} flexWrap={'wrap'}>
            <Text>Batch mint {label}NFTs to</Text>
            <AccountLink val={to} />
          </HStack>
        )
      }
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Batch transfer {label}NFTs</Text>
          <AccountLink val={from} />
          <Arrow />
          <AccountLink val={to} />
        </HStack>
      )
    }
    case 'ApprovalForAll':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.account ?? ''} />
          <Text>set approval for all to</Text>
          <AccountLink val={f.operator ?? ''} />
        </HStack>
      )
    case 'tokenCreated':
      return (
        <Text>
          Created {label}NFT #{f.tokenId ?? f.id ?? ''}
          {f.soulbound === 'true' ? ' (soulbound)' : ''}
        </Text>
      )
    case 'templateMint':
      return <Text>Template mint: template #{f.templateId ?? ''}</Text>
    case 'propertiesSet':
      return (
        <Text>
          Properties set for {label}NFT #{f.tokenId ?? ''}
        </Text>
      )
    case 'ownerChange':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>NFT ownership transferred</Text>
          <AccountLink val={f.previousOwner ?? ''} />
          <Arrow />
          <AccountLink val={f.newOwner ?? ''} />
        </HStack>
      )
    case 'paused':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>NFT paused by</Text>
          <AccountLink val={f.by ?? ''} />
        </HStack>
      )
    case 'unpaused':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>NFT unpaused by</Text>
          <AccountLink val={f.by ?? ''} />
        </HStack>
      )
    case 'Approval':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.owner ?? ''} />
          <Text>approved</Text>
          <AccountLink val={f.spender ?? ''} />
          <Text>
            to spend {f.amount ?? '0'} of {label}NFT #{f.id ?? ''}
          </Text>
        </HStack>
      )
    case 'URI':
      return (
        <Text>
          {label}NFT #{f.id ?? ''} URI updated
        </Text>
      )
    case 'baseUriChange':
      return <Text>{label}Base URI changed</Text>
    case 'init_magi_nft':
      return (
        <Text>
          NFT collection initialized: {f.name ?? ''} ({f.symbol ?? ''})
        </Text>
      )
    default:
      return null
  }
}

const describeDexPool = (
  contractId: string,
  eventType: string,
  f: Record<string, string>,
  meta: LogActionMetadata
): ReactNode | null => {
  const pool = meta.poolInfo[contractId]
  const fmtA0 = (v: string) => (pool ? fmtDexAmount(v, pool.asset0) : thousandSeperator(v))
  const fmtA1 = (v: string) => (pool ? fmtDexAmount(v, pool.asset1) : thousandSeperator(v))
  switch (eventType) {
    case 'swap':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>
            Swap {fmtDexAmount(f.ai ?? '0', f.in ?? '')} for {fmtDexAmount(f.ao ?? '0', f.out ?? '')}
          </Text>
          {f.to && (
            <>
              <Text>to</Text>
              <AccountLink val={f.to} />
            </>
          )}
        </HStack>
      )
    case 'add_liq':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.p ?? ''} />
          <Text>
            added liquidity: {fmtA0(f.a0 ?? '0')} + {fmtA1(f.a1 ?? '0')}, minted {thousandSeperator(f.lp ?? '0')} LP
          </Text>
        </HStack>
      )
    case 'rem_liq':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.p ?? ''} />
          <Text>
            removed liquidity: {fmtA0(f.a0 ?? '0')} + {fmtA1(f.a1 ?? '0')}, burned {thousandSeperator(f.lp ?? '0')} LP
          </Text>
        </HStack>
      )
    case 'fee': {
      const asset = f.__asset ?? ''
      const fmt = (v: string) => (asset ? fmtDexAmount(v, asset) : thousandSeperator(v))
      return (
        <Text>
          Fee: total {fmt(f.t ?? '0')}, LP {fmt(f.lp ?? '0')}, Magi {fmt(f.m ?? '0')}
        </Text>
      )
    }
    case 'pool_init':
      return (
        <Text>
          Pool initialized: {(f.a0 ?? '').toUpperCase()}/{(f.a1 ?? '').toUpperCase()}, fee: {f.fee ?? '0'} bps
        </Text>
      )
    case 'migrate':
      return <Text>Pool migrated to v{f.v ?? '?'}</Text>
    default:
      return null
  }
}

const describeDexRouter = (eventType: string, f: Record<string, string>): ReactNode | null => {
  switch (eventType) {
    case 'reg_pool':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Registered pool</Text>
          <ContractLink val={f.pool ?? ''} />
          <Text>
            {(f.a0 ?? '').toUpperCase()}/{(f.a1 ?? '').toUpperCase()}
          </Text>
        </HStack>
      )
    default:
      return null
  }
}

const describeBtcMapping = (eventType: string, f: Record<string, string>): ReactNode | null => {
  switch (eventType) {
    case 'dep':
    case 'map':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>
            {f.f ?? 'Unknown'} mapped {formatSats(f.a ?? '0')} to
          </Text>
          <AccountLink val={f.t ?? ''} />
        </HStack>
      )
    case 'xfer':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Transfer {formatSats(f.a ?? '0')}</Text>
          <AccountLink val={f.f ?? ''} />
          <Arrow />
          <AccountLink val={f.t ?? ''} />
        </HStack>
      )
    case 'unm':
    case 'unmap':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.f ?? ''} />
          <Text>
            unmapped {formatSats(f.d ?? '0')} to {f.t ?? 'Unknown'} (sent: {formatSats(f.s ?? '0')})
          </Text>
        </HStack>
      )
    case 'fee':
      return (
        <Text>
          Fee: Magi {formatSats(f.m ?? '0')}, BTC {formatSats(f.b ?? '0')}
        </Text>
      )
    case 'migrate':
      return <Text>Contract migrated to v{f.v ?? '?'}</Text>
    default:
      return null
  }
}

const describeInarow = (eventType: string, f: Record<string, string>): ReactNode | null => {
  switch (eventType) {
    case 'c':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Game #{f.id} created by</Text>
          <AccountLink val={f.by ?? ''} />
          <Text>
            bet: {f.betamount ?? '0'} {(f.betasset ?? '').toUpperCase()}
          </Text>
        </HStack>
      )
    case 'j':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>joined game #{f.id}</Text>
        </HStack>
      )
    case 'm':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>
            placed move in game #{f.id}, cell {f.cell}
          </Text>
        </HStack>
      )
    case 'w':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.winner ?? ''} />
          <Text>won game #{f.id}</Text>
        </HStack>
      )
    case 'r':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.resigner ?? ''} />
          <Text>resigned from game #{f.id}</Text>
        </HStack>
      )
    case 't':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.timedout ?? ''} />
          <Text>timed out in game #{f.id}</Text>
        </HStack>
      )
    case 'd':
      return <Text>Game #{f.id} ended in draw</Text>
    case 's':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>swapped in game #{f.id}</Text>
        </HStack>
      )
    default:
      return null
  }
}

const ESCROW_ROLES: Record<string, string> = { f: 'Sender', t: 'Receiver', arb: 'Arbitrator' }
const ESCROW_DECISIONS: Record<string, string> = { r: 'release', f: 'refund' }
const ESCROW_OUTCOMES: Record<string, string> = { r: 'released to receiver', f: 'refunded to sender' }

const describeEscrow = (eventType: string, f: Record<string, string>): ReactNode | null => {
  switch (eventType) {
    case 'cr':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Escrow #{f.id} created:</Text>
          <AccountLink val={f.f ?? ''} />
          <Arrow />
          <AccountLink val={f.t ?? ''} />
          <Text>
            {f.am ?? '0'} {(f.as ?? '').toUpperCase()}, arbitrator:
          </Text>
          <AccountLink val={f.arb ?? ''} />
        </HStack>
      )
    case 'de':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>
            Escrow #{f.id}: {ESCROW_ROLES[f.r ?? ''] ?? f.r}
          </Text>
          <AccountLink val={f.a ?? ''} />
          <Text>decided: {ESCROW_DECISIONS[f.d ?? ''] ?? f.d}</Text>
        </HStack>
      )
    case 'cl':
      return (
        <Text>
          Escrow #{f.id} closed, {ESCROW_OUTCOMES[f.o ?? ''] ?? f.o}
        </Text>
      )
    default:
      return null
  }
}

const describeLottery = (eventType: string, f: Record<string, string>): ReactNode | null => {
  switch (eventType) {
    case 'lc':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Lottery #{f.id} created by</Text>
          <AccountLink val={f.creator ?? ''} />
          <Text>
            &quot;{f.name ?? ''}&quot;, ticket: {f.ticket ?? '0'} {(f.asset ?? '').toUpperCase()}
          </Text>
        </HStack>
      )
    case 'lj':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.participant ?? ''} />
          <Text>
            bought {f.tickets ?? '0'} ticket(s) for lottery #{f.id}
          </Text>
        </HStack>
      )
    case 'le':
      return (
        <Text>
          Lottery #{f.id} executed: {f.participants ?? '0'} participants, {f.tickets ?? '0'} tickets, pool: {f.pool ?? '0'}{' '}
          {(f.asset ?? '').toUpperCase()}
        </Text>
      )
    case 'lp':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Lottery #{f.id} payout:</Text>
          <AccountLink val={f.winner ?? ''} />
          <Text>
            won {f.amount ?? '0'} {(f.asset ?? '').toUpperCase()} (position #{f.position})
          </Text>
        </HStack>
      )
    case 'ld':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>
            Lottery #{f.id} donation: {f.amount ?? '0'} {(f.asset ?? '').toUpperCase()} to
          </Text>
          <AccountLink val={f.recipient ?? ''} />
        </HStack>
      )
    case 'lu':
      return (
        <Text>
          Lottery #{f.id}: {f.amount ?? '0'} {(f.asset ?? '').toUpperCase()} undistributed
        </Text>
      )
    case 'lm':
      return <Text>Lottery #{f.id} metadata updated</Text>
    default:
      return null
  }
}

const describeDao = (eventType: string, f: Record<string, string>): ReactNode | null => {
  switch (eventType) {
    case 'dc':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>DAO project #{f.id} created by</Text>
          <AccountLink val={f.by ?? ''} />
          <Text>&quot;{f.name ?? ''}&quot;</Text>
        </HStack>
      )
    case 'mj':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>joined project #{f.id}</Text>
        </HStack>
      )
    case 'ml':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>left project #{f.id}</Text>
        </HStack>
      )
    case 'af':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>
            added {f.am ?? '0'} {(f.as ?? '').toUpperCase()} to project #{f.id} {f.s === 'true' ? '(stake)' : '(treasury)'}
          </Text>
        </HStack>
      )
    case 'rf':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>
            removed {f.am ?? '0'} {(f.as ?? '').toUpperCase()} from project #{f.id} {f.s === 'true' ? '(stake)' : '(treasury)'}
          </Text>
        </HStack>
      )
    case 'pc':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <Text>Proposal #{f.id} created by</Text>
          <AccountLink val={f.by ?? ''} />
          <Text>&quot;{f.name ?? ''}&quot;</Text>
        </HStack>
      )
    case 'ps':
      return (
        <Text>
          Proposal #{f.id} state changed to: {f.s ?? ''}
        </Text>
      )
    case 'px':
      return (
        <Text>
          Proposal #{f.prId} in project #{f.pId} ready for execution
        </Text>
      )
    case 'pr':
      return (
        <Text>
          Proposal #{f.prId} in project #{f.pId} result: {f.r ?? ''}
        </Text>
      )
    case 'pm':
      return (
        <Text>
          Proposal #{f.prId} in project #{f.pId}: {f.f ?? ''} changed{f.old ? ` ${f.old} → ${f.new}` : ''}
        </Text>
      )
    case 'v':
      return (
        <HStack gap={'1.5'} flexWrap={'wrap'}>
          <AccountLink val={f.by ?? ''} />
          <Text>
            voted on proposal #{f.id} with weight {f.w ?? '0'}
          </Text>
        </HStack>
      )
    case 'wl':
      return (
        <Text>
          Whitelist {f.a === 'add' ? 'added' : 'removed'} in project #{f.pId}: {f.ad ?? ''}
        </Text>
      )
    default:
      return null
  }
}

export const describeAction = (
  contractId: string,
  contractType: string | null,
  eventType: string,
  fields: Record<string, string>,
  metadata: LogActionMetadata
): ReactNode | null => {
  let result: ReactNode | null = null

  switch (contractType) {
    case 'magi_token':
      result = describeToken(contractId, eventType, fields, metadata)
      break
    case 'magi_nft':
      result = describeNft(contractId, eventType, fields, metadata)
      break
    case 'dex_pool':
      result = describeDexPool(contractId, eventType, fields, metadata)
      break
    case 'dex_router':
      result = describeDexRouter(eventType, fields)
      break
    case 'btc_mapping':
      result = describeBtcMapping(eventType, fields)
      break
    case 'oki_inarow':
      result = describeInarow(eventType, fields)
      break
    case 'oki_escrow':
      result = describeEscrow(eventType, fields)
      break
    case 'oki_lottery':
      result = describeLottery(eventType, fields)
      break
    case 'oki_dao':
      result = describeDao(eventType, fields)
      break
  }

  return result
}
