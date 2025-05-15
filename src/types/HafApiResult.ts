import {
  BlockPayload,
  NewContractPayload,
  L2TxType,
  CallContractPayload,
  XferWdPayload,
  DepositPayload,
  ElectionPayload,
  Coin,
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

interface Item<IdType extends number | string> {
  id: IdType
  ts: string
  block_num: number
}

/** usually used for l2 items */
interface ItemWithIdxBlk<IdType extends number | string> extends Item<IdType> {
  idx_in_block: number
}

export interface Witness {
  error?: string
  id: number
  username: string
  consensus_did: string
  enabled: boolean
  gateway_key: string
  git_commit: string
  peer_addrs: string[]
  peer_id: string
  protocol_version: number
  version_id: string
  first_seen_ts: string
  first_seen_tx: string
  last_update_ts: string
  last_update_tx: string
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

export interface UserBalance {
  account: string
  block_height: number
  hbd: number
  hbd_avg: number
  hbd_modify: number
  hbd_savings: number
  hive: number
  hive_consensus: number
  hive_unstaking: number
  rc_used: {
    block_height: number
    amount: number
  }
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

export interface L1Transaction extends Item<number> {
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
    | { tx: CallContractPayload | XferWdPayload }
}

export interface Contract {
  error?: string
  id: string
  tx_id: string
  creation_height: number
  creator: string
  owner: string
  name: string
  description: string
  code: string
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

/** Contract call short details */
interface ContractCallDetailMinimal {
  contract_id: string
  action: string
  io_gas?: number
}

/** For contract calls by contract id */
interface ContractCallTx extends ItemWithIdxBlk<string>, ContractCallDetailMinimal {
  input: string
  output: string
  contract_action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  contract_output?: ContractOut
  error?: string
  events?: EventItm[]
}

export interface L1ContractCallTx extends ContractCallTx {
  signers: {
    active: string[]
    posting: string[]
  }
  tx_type: 'call_contract'
  input_src: 'hive'
}

export interface L2ContractCallTx extends ContractCallTx {
  nonce: number
  signers: string[]
  tx_type: L2TxType
  input_src: 'vsc'
}

export interface ContractOut {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ret?: any
  logs: string[]
  IOGas: number
  error?: {
    msg: string
    colm: number
    file: string
    line: number
  }
  errorType?: number
}

export interface EventItm {
  t: number
  tk: Coin
  amt: number
  memo?: string
  owner: string
}

export interface CIDSearchResult {
  type?: string
  result?: string | number
}
