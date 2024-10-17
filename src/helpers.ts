import BitSet from 'bitset'
import { L1Transaction, WeightedMembers } from './types/HafApiResult'
import { DepositPayload, ElectionResultPayload, NAI, NewContractPayload } from './types/Payloads'

export const timeAgo = (date: string): string => {
  const now = new Date().getTime()
  const diffInSeconds = Math.abs(now - new Date(date + (!date.endsWith('Z') ? 'Z' : '')).getTime()) / 1000

  const days = Math.floor(diffInSeconds / 86400)
  const hours = Math.floor(diffInSeconds / 3600) % 24
  const minutes = Math.floor(diffInSeconds / 60) % 60
  const seconds = Math.floor(diffInSeconds % 60)

  if (days > 0) return `${days} days ${hours} hrs ago`
  if (hours > 0) return `${hours} hrs ${minutes} mins ago`
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
    case 'propose_block':
      result += 'proposed block' //+(tx.payload as BlockPayload).signed_block.block
      break
    case 'create_contract':
      result += 'created contract ' + (tx.payload as NewContractPayload).code
      break
    case 'election_result':
      result += 'proposed election result for epoch ' + (tx.payload as ElectionResultPayload).epoch
      break
    case 'deposit':
      result += 'deposited ' + naiToString((tx.payload as DepositPayload).amount)
      break
    case 'withdrawal':
      result += 'withdrawn ' + naiToString((tx.payload as DepositPayload).amount)
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

export const getBitsetStrFromHex = (bv: string) => {
  return BitSet.fromHexString(bv).toString(2)
}

export const getVotedMembers = (
  bv: string,
  members: WeightedMembers[]
): { votedMembers: WeightedMembers[]; votedWeight: number; totalWeight: number } => {
  const bs = BitSet.fromHexString(bv)
  const voted = []
  let votedWeight = 0
  let totalWeight = 0
  for (const m in members) {
    totalWeight += members[m].weight
    if (bs.get(Number(m)) === 1) {
      voted.push(members[m])
      votedWeight += members[m].weight
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
