import { L1Transaction } from './types/HafApiResult'
import { BlockPayload, DepositPayload, NAI, NewContractPayload } from './types/Payloads'

export const timeAgo = (date: string): string => {
  const now = new Date().getTime()
  const diffInSeconds = Math.abs(now - new Date(date+'Z').getTime()) / 1000
  
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
  const num_parts = num.toString().split(".")
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return num_parts.join(".")
}

export const isPuralArr = (arr: Array<any>) => arr.length > 1

export const validateHiveUsername = (value: string): string | null => {
  let suffix = 'Hive username must '
  if (!value)
      return suffix + 'not be empty.'
  let length = value.length
  if (length < 3 || length > 16)
      return suffix + 'be between 3 and 16 characters.'
  if (/\./.test(value))
      suffix = 'Each account segment much '
  let ref = value.split('.')
  let label
  for (let i = 0, len = ref.length; i < len; i++) {
      label = ref[i]
      if (!/^[a-z]/.test(label))
          return suffix + 'start with a letter.'
      if (!/^[a-z0-9-]*$/.test(label))
          return suffix + 'have only letters, digits, or dashes.'
      if (!/[a-z0-9]$/.test(label))
          return suffix + 'end with a letter or digit.'
      if (!(label.length >= 3))
          return suffix + 'be longer'
  }
  return null
}

export const naiToString = (nai: NAI) => {
  let result = (parseInt(nai.amount) / Math.pow(10,nai.precision)).toString() + ' '
  if (nai.nai === '@@000000021')
    result += 'HIVE'
  else if (nai.nai === '@@000000013')
    result += 'HBD'
  return result
}

export const describeL1TxBriefly = (tx: L1Transaction): string => {
  let result: string = tx.username+' '
  switch (tx.type) {
    case 'announce_node':
      result += 'announced node'
      break
    case 'propose_block':
      result += 'proposed block' //+(tx.payload as BlockPayload).signed_block.block
      break
    case 'create_contract':
      result += 'created contract '+(tx.payload as NewContractPayload).code
      break
    case 'deposit':
      result += 'deposited '+naiToString((tx.payload as DepositPayload).amount)
      break
    case 'withdrawal':
      result += 'withdrawn '+naiToString((tx.payload as DepositPayload).amount)
      break
    default:
      result += tx.type.replace(/_/g,' ')
      break
  }
  return result
}