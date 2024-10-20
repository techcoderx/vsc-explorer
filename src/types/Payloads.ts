export type DIDPayload = {
  did: string
}

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
  manifest_id: string
  name: string // pla: obsolete as its already contained in the manifest, correct?
  code: string
}

export type ElectionResultPayload = {
  epoch: number
  data: string
  signature: BLSSig
}

export type ContractCommitmentPayload = {
  contract_id: string
  node_identity: string
}

export type NodeAnnouncePayload = {
  did: string
  witnessEnabled: boolean
}

export type DepositPayload = {
  to: string
  from: string
  amount: NAI
}

export type L2TxType = 'call_contract' | 'contract_output' | 'anchor_ref' | 'transfer' | 'withdraw' | 'event'
export type Coin = 'HIVE' | 'HBD'

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
