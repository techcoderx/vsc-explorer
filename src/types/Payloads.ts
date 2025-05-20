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

export type Coin = 'HIVE' | 'HBD'
export type CoinLower = 'hive' | 'hbd'

export interface CallContractPayload {
  contract_id: string
  action: string
  payload: any
  intents: []
  rc_limit: number
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
