export type BlockPayload = {
  experiment_id: number
  signed_block: {
    block: string
    headers: {
      br: number[]
      prevb: null | string
    }
    merkle_root: string
    signature: BLSSig
  }
}

export type NewContractPayload = {
  name: string
  code: string
}

export type ElectionPayload = {
  epoch: number
  data: string
  signature: BLSSig
}

// transfer_operation
export type DepositPayload = {
  to: string
  from: string
  amount: NAI
}

// vsc.transfer custom_json
export type TransferPayload = {
  to: string
  from: string
  asset: string
  amount: number
}

export type InterestPayload = {
  owner: string
  interest: NAI
}

export type L2TxType = 'call_contract' | 'contract_output' | 'anchor_ref' | 'transfer' | 'withdraw' | 'event'
export type Coin = 'HIVE' | 'HBD'
export type CoinLower = 'hive' | 'hbd'

interface L1TxPayload {
  op: L2TxType
  payload: any
}

export interface CallContractPayload extends L1TxPayload {
  op: 'call_contract'
  contract_id: string
  action: string
  payload: any
}

export interface XferWdPayload extends L1TxPayload {
  op: 'transfer' | 'withdraw'
  payload: {
    tk: Coin
    to: string
    from: string
    memo?: string
    amount: number
  }
}

export type NAI = {
  nai: '@@000000021' | '@@000000013'
  amount: string
  precision: number
}

export type BLSSig = {
  sig: string
  bv: string
}

export const EventTypeNames: { [type: number]: string } = {
  0: '',
  110_001: 'Transfer',
  110_002: 'Withdraw',
  110_003: 'Deposit'
  // 110_004: 'Stake HBD',
  // 110_005: 'Unstake HBD',
  // 110_006: 'Claim HBD'
}
