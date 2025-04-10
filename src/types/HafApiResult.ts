import {
  BlockPayload,
  NewContractPayload,
  L2TxType,
  CallContractPayload,
  XferWdPayload,
  DepositPayload,
  ElectionResultPayload,
  Coin,
  TransferPayload,
  BLSSig
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

export interface Witness {
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
  members: {
    key: string
    account: string
  }[]
  weights: number[]
  total_weight: number
  block_height: number
  be_info?: {
    trx_id: string
    ts: string
    signature?: BLSSig
    eligible_weight: number
    voted_weight: number
  }
}

const txTypes = [
  'announce_node',
  'produce_block',
  'create_contract',
  'call',
  'election_result',
  'custom_json',
  'transfer',
  'withdraw',
  'l1_transfer',
  'consensus_stake',
  'consensus_unstake',
  'stake_hbd',
  'unstake_hbd'
] as const
type TxTypes = (typeof txTypes)[number]

export interface L1Transaction extends Item<number> {
  nonce: number
  type: TxTypes
  l1_tx: string
  username: string
  payload?:
    | BlockPayload
    | NewContractPayload
    | ElectionResultPayload
    | DepositPayload
    | TransferPayload
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

/** Call history */
interface TxHistoryBase extends ItemWithIdxBlk<string> {
  tx_type: L2TxType
  nonce: number
}

interface CallContractTxHistory extends TxHistoryBase {
  tx_type: 'call_contract'
  details: ContractCallDetailMinimal
}

interface XferWdTxHistory extends TxHistoryBase {
  tx_type: 'transfer' | 'withdraw'
  details: {
    to: string
    from: string
    memo?: string
    token: Coin
    amount: number
  }
}

export type TxHistory = CallContractTxHistory | XferWdTxHistory

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

export interface ContractOutputTx extends ItemWithIdxBlk<string> {
  contract_id: string
  total_io_gas: number
  outputs: {
    src: 'hive' | 'vsc'
    tx_id: string
    op_pos?: number
    output: ContractOut
  }[]
  error?: string
}

export interface EventsOp extends ItemWithIdxBlk<string> {
  events: {
    tx_id: string
    tx_type: L2TxType
    events: EventItm[]
  }[]
  error?: string
}

export interface EventItm {
  t: number
  tk: Coin
  amt: number
  memo?: string
  owner: string
}

export interface EventHistoryItm extends Item<string> {
  event_id: number
  event_cid: string
  tx_pos: number
  pos_in_tx: number
  event: EventItm
}

export interface CIDSearchResult {
  type?: string
  result?: string | number
}

export interface BridgeTx extends Item<number> {
  tx_hash: string
  to: string
  amount: string
  nonce: number
  memo?: string
  status: string
}

export interface WeightedMembers {
  account: string
  key: string
}
