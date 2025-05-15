import { DepositPayload, InterestPayload } from './Payloads'

type L1AccountAuths = {
  account_auths: [string, number][]
  key_auths: [string, number][]
  weight_threshold: number
}

export type L1AccountAuthority = {
  owner: L1AccountAuths
  active: L1AccountAuths
  posting: L1AccountAuths
  memo: string
  witness_signing: string
}

export type L1Balance = {
  hbd_balance: number
  hive_balance: number
  vesting_shares: string
  vesting_balance_hive: string
  hbd_savings: number
  hive_savings: number
  savings_withdraw_requests: number
}

export type Ops = CustomJson | AccUpdate | Transfers | Interest

interface L1OpBase {
  type: string
  value: object
}

export interface CustomJson extends L1OpBase {
  type: 'custom_json_operation'
  value: {
    required_auths: string[]
    required_posting_auths: string[]
    id: string
    json: string
  }
}

export interface AccUpdate extends L1OpBase {
  type: 'account_update_operation'
  value: {
    account: string
    json_metadata: string
  }
}

export interface Transfers extends L1OpBase {
  type:
    | 'transfer_operation'
    | 'transfer_to_savings_operation'
    | 'transfer_from_savings_operation'
    | 'fill_transfer_from_savings_operation'
  value: DepositPayload
}

export interface Interest extends L1OpBase {
  type: 'interest_operation'
  value: InterestPayload
}

export interface L1TxHeader {
  transaction_json: {
    operations: Ops[]
  }
  transaction_id: string
  block_num: number
  transaction_num: number
  timestamp: string

  // errors
  code?: string
  message?: string
}

export interface L1BlockHeader {
  previous: string
  timestamp: string
  witness: string
  transaction_merkle_root: string
  extensions: []
}
