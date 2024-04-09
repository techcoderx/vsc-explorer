export interface HiveRPCResponse<T> {
  id: number
  jsonrpc: string
  result: T
  error?: HiveRPCError
}

interface HiveRPCError {
  code: number
  message: string
  data?: string
}

type L1AccountAuths = {
  account_auths: [string, number][],
  key_auths: [string, number][],
  weight_threshold: number
}

export type L1Account = {
  balance: string
  savings_balance: string
  hbd_balance: string
  savings_hbd_balance: string
  vesting_shares: string
  owner: L1AccountAuths
  active: L1AccountAuths
  posting: L1AccountAuths
}

export type L1Dgp = {
  total_vesting_fund_hive: string
  total_vesting_shares: string
}