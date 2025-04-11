import BitSet from 'bitset'
import { L1Transaction, UserBalance, WeightedMembers } from './types/HafApiResult'
import {
  CallContractPayload,
  DepositPayload,
  ElectionResultPayload,
  NAI,
  BlockPayload,
  NewContractPayload,
  TransferPayload,
  XferWdPayload,
  InterestPayload
} from './types/Payloads'
import { multisigAccount } from './settings'

export const timeAgo = (date: string, one: boolean = false): string => {
  const now = new Date().getTime()
  const diffInSeconds = Math.abs(now - new Date(date + (!date.endsWith('Z') ? 'Z' : '')).getTime()) / 1000

  const days = Math.floor(diffInSeconds / 86400)
  const hours = Math.floor(diffInSeconds / 3600) % 24
  const minutes = Math.floor(diffInSeconds / 60) % 60
  const seconds = Math.floor(diffInSeconds % 60)

  if (days > 0) return `${days} days${!one ? ` ${hours} hrs` : ''} ago`
  if (hours > 0) return `${hours} hrs${!one ? ` ${minutes} mins` : ''} ago`
  if (minutes > 0) return `${minutes} mins ago`
  return `${seconds} secs ago`
}

export const thousandSeperator = (num: number | bigint | string): string => {
  const num_parts = num.toString().split('.')
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return num_parts.join('.')
}

export const roundFloat = (num: number, decimals: number): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPuralArr = (arr: Array<any>) => arr.length > 1

export const isValidJSONStr = (str: string) => {
  try {
    JSON.parse(str)
  } catch {
    return false
  }
  return true
}

export const validateHiveUsername = (value: string): string | null => {
  let suffix = 'Hive username must '
  if (!value) return suffix + 'not be empty.'
  const length = value.length
  if (length < 3 || length > 16) return suffix + 'be between 3 and 16 characters.'
  if (/\./.test(value)) suffix = 'Each account segment much '
  const ref = value.split('.')
  let label
  for (let i = 0, len = ref.length; i < len; i++) {
    label = ref[i]
    if (!/^[a-z]/.test(label)) return suffix + 'start with a letter.'
    if (!/^[a-z0-9-]*$/.test(label)) return suffix + 'have only letters, digits, or dashes.'
    if (!/[a-z0-9]$/.test(label)) return suffix + 'end with a letter or digit.'
    if (!(label.length >= 3)) return suffix + 'be longer'
  }
  return null
}

export const naiToString = (nai: NAI) => {
  let result = (parseInt(nai.amount) / Math.pow(10, nai.precision)).toString() + ' '
  if (nai.nai === '@@000000021') result += 'HIVE'
  else if (nai.nai === '@@000000013') result += 'HBD'
  return result
}

export const describeL1TxBriefly = (tx: L1Transaction): string => {
  let result: string = tx.username + ' '
  switch (tx.type) {
    case 'announce_node':
      result += 'announced node'
      break
    case 'produce_block':
      result += 'proposed block ' + (tx.payload as BlockPayload).signed_block.block
      break
    case 'create_contract':
      result += 'created contract ' + abbreviateHash((tx.payload as NewContractPayload).code, 15, 0)
      break
    case 'election_result':
      result += 'proposed election result for epoch ' + (tx.payload as ElectionResultPayload).epoch
      break
    case 'transfer':
      result +=
        'transfer ' +
        (tx.payload as TransferPayload).amount +
        ' ' +
        (tx.payload as TransferPayload).asset.toUpperCase() +
        ' to ' +
        (tx.payload as TransferPayload).to
      break
    case 'l1_transfer':
      result +=
        ((tx.payload as DepositPayload).to === multisigAccount ? 'deposited' : 'withdrawn') +
        ' ' +
        naiToString((tx.payload as DepositPayload).amount)
      break
    case 'withdraw':
      result += `withdraw ${(tx.payload as TransferPayload).amount} ${(tx.payload as TransferPayload).asset.toUpperCase()}${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      }`
      break
    case 'consensus_stake':
      result += ` stake ${(tx.payload as TransferPayload).amount} ${(tx.payload as TransferPayload).asset.toUpperCase()}${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      } for consensus`
      break
    case 'consensus_unstake':
      result += ` unstake ${(tx.payload as TransferPayload).amount} ${(tx.payload as TransferPayload).asset.toUpperCase()}${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      } from consensus`
      break
    case 'stake_hbd':
      result += ` stake ${(tx.payload as TransferPayload).amount} ${(tx.payload as TransferPayload).asset.toUpperCase()}${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      }`
      break
    case 'unstake_hbd':
      result += ` unstake ${(tx.payload as TransferPayload).amount} ${(tx.payload as TransferPayload).asset.toUpperCase()}${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      }`
      break
    case 'transfer_to_savings':
      result += ` stake ${naiToString((tx.payload as DepositPayload).amount)}`
      break
    case 'transfer_from_savings':
      result += ` begin unstake ${naiToString((tx.payload as DepositPayload).amount)}`
      break
    case 'fill_transfer_from_savings':
      result += ` unstaked ${naiToString((tx.payload as DepositPayload).amount)}`
      break
    case 'interest':
      result += ` collect ${naiToString((tx.payload as InterestPayload).interest)} interest`
      break
    case 'call':
      const call = (tx.payload as { tx: CallContractPayload | XferWdPayload }).tx
      if (call.op === 'call_contract')
        result += 'call ' + abbreviateHash(call.action, 30, 0) + ' at contract ' + abbreviateHash(call.contract_id, 20, 0)
      else if (call.op === 'transfer' || call.op === 'withdraw')
        result +=
          call.op + ' ' + call.payload.amount / 1000 + ' ' + call.payload.tk + ' to ' + abbreviateHash(call.payload.to, 20, 0)
      break
    default:
      result += tx.type.replace(/_/g, ' ')
      break
  }
  return result
}

export const abbreviateHash = (hash: string, first_chars: number = 12, last_chars: number = 12): string => {
  if (first_chars + last_chars + 2 >= hash.length) return hash
  return `${hash.substring(0, first_chars)}...${last_chars ? hash.slice(-last_chars) : ''}`
}

export const getNextTabRoute = (tabNames: string[], segments: string[], newIdx: number, pageNum: number = 1, pos: number = 3) => {
  // first element of segments should be an empty string (!!)
  if (newIdx > 0) {
    // add tabname to pathname if not first idx regardless
    if (segments.length >= pos + 1) segments[pos] = tabNames[newIdx]
    else segments.push(tabNames[newIdx])
  } else {
    // only add tabname to pathname for 0 idx if there are other segments after it (i.e. page number)
    if (segments.length > pos + 1) segments[pos] = tabNames[newIdx]
    else if (segments.length === pos + 1) segments.pop()
  }
  // page number
  if (pageNum > 1) {
    if (segments.length >= pos + 2) segments[pos + 1] = pageNum.toString()
    if (segments.length === pos) segments.push(tabNames[newIdx])
    if (segments.length === pos + 1) segments.push(pageNum.toString())
  } else if (pageNum === 1) {
    if (segments.length > pos + 2) segments[pos + 1] = pageNum.toString()
    else if (segments.length === pos + 2) segments.pop()
    if (segments.length === pos + 1 && newIdx === 0) segments.pop()
  }
  return segments.join('/').trim().replace(/\/+$/, '')
}

export const getBitsetStrFromHex = (bv: string) => {
  return BitSet.fromHexString(bv).toString(2)
}

export const getVotedMembers = (
  bv: string,
  members: WeightedMembers[],
  weights: number[]
): { votedMembers: WeightedMembers[]; votedWeight: number; totalWeight: number } => {
  const bs = BitSet.fromHexString(bv)
  const voted = []
  let votedWeight = 0
  let totalWeight = 0
  for (const m in members) {
    totalWeight += weights[m]
    if (bs.get(Number(m)) === 1) {
      voted.push(members[m])
      votedWeight += weights[m]
    }
  }
  return { votedMembers: voted, votedWeight, totalWeight }
}

// do we want to display signatures in original base64url format?
export const hexToBase64Url = (hexString: string): string => {
  const matching = hexString.match(/\w{2}/g)
  if (matching)
    return window
      .btoa(matching.map((a) => String.fromCharCode(parseInt(a, 16))).join(''))
      .replace('+', '-')
      .replace('/', '_')
      .replace(/=+$/, '')
  else return ''
}

export const base64UrlToHex = (base64url: string) => {
  if (!base64url) return '0'
  // Convert base64url to standard base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if necessary
  const padLength = (4 - (base64.length % 4)) % 4
  base64 += '='.repeat(padLength)

  // Decode base64 to binary string
  const binaryString = atob(base64)

  // Convert each byte to hex
  let hex = ''
  for (let i = 0; i < binaryString.length; i++) {
    const byte = binaryString.charCodeAt(i)
    hex += byte.toString(16).padStart(2, '0')
  }

  return hex
}

export const bitsGrid = (input: string) => {
  let output = ''
  let spaceCount = 0

  for (let i = 0; i < input.length; i++) {
    output += input[i]

    // If this is an 8th character, add a space
    if ((i + 1) % 8 === 0) {
      output += ' '
      spaceCount++
    }

    // If we've added 8 spaces, add a newline and reset the space counter
    if (spaceCount === 8) {
      output += '\n'
      spaceCount = 0
    }
  }

  return output
}

// https://github.com/vsc-eco/go-vsc-node/blob/main/modules/rc-system/rc-system.go
export const availableRC = (bal: UserBalance, head_block_num?: number, is_hive_user: boolean = false) => {
  const max_rc = bal.hbd + (is_hive_user ? 5000 : 0)
  if (max_rc === 0) return { avail: 0, max: 0 }
  const RC_RETURN_PERIOD = 120 * 60 * 20
  const diff = (head_block_num || bal.rc_used.block_height) - bal.rc_used.block_height
  let amt_ret = (diff * bal.rc_used.amount) / RC_RETURN_PERIOD
  if (amt_ret > bal.rc_used.amount) {
    amt_ret = bal.rc_used.amount
  }
  return { avail: max_rc - (bal.rc_used.amount - amt_ret), max: max_rc }
}
