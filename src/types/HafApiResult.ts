import {
  BlockPayload,
  NewContractPayload,
  CallContractPayload,
  DepositPayload,
  ElectionPayload,
  TransferPayload,
  BLSSig,
  InterestPayload
} from './Payloads'

export interface Props {
  epoch: number
  contracts: number
  witnesses: number
  l2_block_height: number
  transactions: number
  last_processed_block: number
  operations: number
}

export interface Block {
  error?: string
  id: string
  block: string
  end_block: number
  merkle_root: string
  proposer: string
  // sig_root: null
  // signers: null
  slot_height: number
  start_block: number
  stats: {
    size: number
  }
  ts: string
  be_info: {
    block_id: number
    epoch: number
    signature: BLSSig
    voted_weight: number
    eligible_weight: number
  }
}

export interface LedgerOpLog {
  to: string
  from: string
  amount: number
  asset: string
  memo: string
  type: string
  id: string
  bidx: number
  opidx: number
  blockheight: number
  params?: object
}

export interface TxHeader {
  id: string
  status: string
  nonce: number
  rc_limit: number
  ledger: LedgerOpLog[]
}

export interface WitnessStat {
  _id: string
  block_count: number
  election_count: number
  last_block: number
  last_epoch: number
}

export interface Election {
  error?: string
  epoch: number
  proposer: string
  data: string
  members: WeightedMembers[]
  weights: number[]
  total_weight: number
  block_height: number
  tx_id: string
  type: 'initial' | 'staked'
  be_info?: {
    ts: string
    signature?: BLSSig
    eligible_weight: number
    voted_weight: number
  }
  blocks_info?: {
    count: number
    total_votes: number
  }
}

export interface WeightedMembers {
  account: string
  key: string
}

export type TxTypes =
  | 'announce_node'
  | 'produce_block'
  | 'create_contract'
  | 'call'
  | 'election_result'
  | 'custom_json'
  | 'transfer'
  | 'withdraw'
  | 'l1_transfer'
  | 'consensus_stake'
  | 'consensus_unstake'
  | 'stake_hbd'
  | 'unstake_hbd'
  | 'transfer_to_savings'
  | 'transfer_from_savings'
  | 'fill_transfer_from_savings'
  | 'interest'
  | 'stake'
  | 'unstake'
  | 'deposit'

export interface L1Transaction {
  id: number
  ts: string
  block_num: number
  nonce: number
  type: TxTypes
  l1_tx: string
  username: string
  payload?:
    | BlockPayload
    | NewContractPayload
    | ElectionPayload
    | DepositPayload
    | TransferPayload
    | InterestPayload
    | CallContractPayload
}

export interface AccInfo {
  name: string
  tx_count: number
  event_count: number
  deposit_count: number
  withdraw_req_count: number
  last_activity: string
}

export interface BridgeCounter {
  deposits: number
  withdrawals: number
}

export interface AddrTxStats {
  txs: number
  ledger_txs: number
  ledger_actions: number
  deposits: number
  withdrawals: number
}

export interface CIDSearchResult {
  type?: string
  result?: string | number
}
