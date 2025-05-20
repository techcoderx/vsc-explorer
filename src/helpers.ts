import { L1Transaction } from './types/HafApiResult'
import {
  CallContractPayload,
  DepositPayload,
  ElectionPayload,
  NAI,
  BlockPayload,
  NewContractPayload,
  TransferPayload,
  InterestPayload,
  Coin,
  CoinLower
} from './types/Payloads'
import { multisigAccount, NETWORK_ID, NETWORK_ID_ANNOUNCE } from './settings'
import { Ops } from './types/L1ApiResult'
import { AddrBalance } from './types/L2ApiResult'

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

export const fmtAmount = (amount: number, asset: Coin | CoinLower) => {
  return `${thousandSeperator(amount)} ${asset.toUpperCase()}`
}

export const fmtmAmount = (amount: number, asset: Coin | CoinLower) => {
  return `${thousandSeperator(roundFloat(amount / 1000, 3))} ${asset.toUpperCase()}`
}

export const naiToString = (nai: NAI) => {
  let result = (parseInt(nai.amount) / Math.pow(10, nai.precision)).toString() + ' '
  if (nai.nai === '@@000000021') result += 'HIVE'
  else if (nai.nai === '@@000000013') result += 'HBD'
  return result
}

export const parseOperation = (op: Ops): { valid: false } | { valid: true; type: string; user: string; payload: object } => {
  switch (op.type) {
    case 'custom_json_operation':
      if (op.value.id.startsWith('vsc.') && (op.value.required_auths.length > 0 || op.value.required_posting_auths.length > 0)) {
        let user = op.value.required_auths.length > 0 ? op.value.required_auths[0] : op.value.required_posting_auths[0]
        try {
          let payload = JSON.parse(op.value.json)
          if (typeof payload === 'object' && (payload.net_id === NETWORK_ID || user === multisigAccount)) {
            return {
              valid: true,
              type: op.value.id.replace('vsc.', ''),
              user,
              payload
            }
          }
        } catch {}
      }
      break
    case 'account_update_operation':
      try {
        let jm = JSON.parse(op.value.json_metadata)
        if (op.value.account === multisigAccount) {
          return {
            valid: true,
            type: 'rotate_multisig',
            user: op.value.account,
            payload: op.value
          }
        } else if (
          typeof jm.vsc_node === 'object' &&
          (jm.vsc_node.net_id === NETWORK_ID || jm.vsc_node.net_id === NETWORK_ID_ANNOUNCE)
        ) {
          return {
            valid: true,
            type: 'announce_node',
            user: op.value.account,
            payload: {
              did_keys: jm.did_keys,
              vsc_node: jm.vsc_node
            }
          }
        }
      } catch {}
      break
    case 'interest_operation':
      if (op.value.owner === multisigAccount)
        return {
          valid: true,
          type: 'interest',
          user: op.value.owner,
          payload: op.value
        }
      break
    case 'transfer_operation':
    case 'transfer_from_savings_operation':
    case 'transfer_to_savings_operation':
    case 'fill_transfer_from_savings_operation':
      if (op.value.from === multisigAccount || op.value.to === multisigAccount)
        return {
          valid: true,
          type: op.type === 'transfer_operation' ? 'l1_transfer' : op.type.replace('_operation', ''),
          user: op.value.from !== multisigAccount ? op.value.from : op.value.to,
          payload: op.value
        }
      break
  }
  return { valid: false }
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
      result += 'proposed election result for epoch ' + (tx.payload as ElectionPayload).epoch
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
      if ((tx.payload as DepositPayload).to === multisigAccount) {
        result += ` deposited ${naiToString((tx.payload as DepositPayload).amount)}`
      } else {
        result += ` withdrawn ${naiToString((tx.payload as DepositPayload).amount)}`
      }
      break
    case 'withdraw':
      result += `withdraw ${(tx.payload as TransferPayload).amount} ${(tx.payload as TransferPayload).asset.toUpperCase()}${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      }`
      break
    case 'consensus_stake':
      result += ` stake ${(tx.payload as TransferPayload).amount} HIVE${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      } for consensus`
      break
    case 'consensus_unstake':
      result += ` unstake ${(tx.payload as TransferPayload).amount} HIVE${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      } from consensus`
      break
    case 'stake_hbd':
      result += ` stake ${(tx.payload as TransferPayload).amount} HBD${
        (tx.payload as TransferPayload).to !== `hive:${tx.username}` ? ` to ${(tx.payload as TransferPayload).to}` : ''
      }`
      break
    case 'unstake_hbd':
      result += ` unstake ${(tx.payload as TransferPayload).amount} HBD${
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
      const call = tx.payload as CallContractPayload
      result += 'call ' + abbreviateHash(call.action, 30, 0) + ' at contract ' + abbreviateHash(call.contract_id, 20, 0)
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

// https://github.com/vsc-eco/go-vsc-node/blob/main/modules/rc-system/rc-system.go
export const availableRC = ({ bal, rc }: AddrBalance, head_block_num?: number, is_hive_user: boolean = false) => {
  const h = rc?.block_height || 0
  const amt = rc?.amount || 0
  const max_rc = (bal?.hbd || 0) + (is_hive_user ? 5000 : 0)
  if (max_rc === 0) return { avail: 0, max: 0 }
  const RC_RETURN_PERIOD = 120 * 60 * 20
  const diff = (head_block_num || h) - h
  let amt_ret = (diff * amt) / RC_RETURN_PERIOD
  if (amt_ret > amt) {
    amt_ret = amt
  }
  return { avail: max_rc - (amt - amt_ret), max: max_rc }
}

export const makeL1TxIdWifIdx = (trx_id: string, opidx: number) => {
  if (opidx === 0) return trx_id
  return `${trx_id}-${opidx}`
}
