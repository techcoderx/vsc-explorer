import { ReactNode } from 'react'
import { L1Transaction } from './types/HafApiResult'

export const timeAgo = (date: string | Date): string => {
  const now = new Date().getTime()
  const diffInSeconds = Math.abs(now - new Date(date).getTime()) / 1000
  
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
  let num_parts = num.toString().split(".")
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return num_parts.join(".")
}

export const describeL1Tx = (tx: L1Transaction): ReactNode => {
  let result: ReactNode = tx.username+' '
  switch (tx.type) {
    case 'announce_node':
      result += 'announced node'
      break
    case 'announce_block':
      result += 'announced block '+tx.payload.block_hash
      break
    case 'create_contract':
      result += 'created contract '+tx.payload.code
      break
    default:
      result += tx.type.replace(/_/g,' ')
      break
  }
  return result
}