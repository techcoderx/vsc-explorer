import {
  BlockPayload,
  NewContractPayload,
  NodeAnnouncePayload,
  L2TxType,
  CallContractPayload,
  XferWdPayload,
  DepositPayload,
  ElectionResultPayload,
  Coin,
  TransferPayload
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
  id: number
  ts: string
  l1_tx: string
  l1_block: number
  proposer: string
  prev_block_hash?: string
  block_hash: string
  block_body_hash: string
  txs: number
}

export interface BlockDetail extends Block {
  error?: string
  merkle_root: string
  voted_weight: number
  eligible_weight: number
  signature: {
    sig: string
    bv: string
  }
}

export interface BlockRangeItm extends Block {
  voted_weight: number
  eligible_weight: number
  bv: string
}

export interface BlockTx extends ItemWithIdxBlk<string> {
  did?: string
  tx_type: L2TxType
  auth_count: number
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
  rc_used: {
    block_height: number
    amount: number
  }
}

export interface Election {
  epoch: number
  // l1_tx: string
  proposer: string
  data: string
  // voted_weight: number
  // eligible_weight: number
  // sig: string
  // bv: string
  members: {
    key: string
    account: string
  }[]
  weights: number[]
  total_weight: number
  block_height: number
}

export interface Epoch extends Item<number> {
  epoch: number
  l1_tx: string
  proposer: string
  data_cid: string
  election: WeightedMembers[]
  members_at_start: WeightedMembers[]
  voted_weight: number
  eligible_weight: number
  sig: string
  bv: string
  error?: string
}

export interface BlockInEpoch {
  id: number
  ts: string
  block_hash: string
  proposer: string
  txs: number
  voted_weight: number
  eligible_weight: number
  bv: string
}

const txTypes = [
  'announce_node',
  'propose_block',
  'create_contract',
  'call',
  'election_result',
  'custom_json',
  'transfer',
  'l1_transfer',
  'consensus_stake',
  'consensus_unstake'
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
    | NodeAnnouncePayload
    | ElectionResultPayload
    | DepositPayload
    | TransferPayload
    | { tx: CallContractPayload | XferWdPayload }
}

export interface Contract {
  contract_id: string
  created_in_op: string
  created_in_l1_block: number
  created_at: string
  creator: string
  name: string
  description: string
  code: string
}

export interface ContractWifProof extends Contract {
  storage_proof: {
    hash?: string
    sig?: string
    bv?: string
  }
  error?: string
}

export interface AnchorRefs extends Item<number> {
  cid: string
  tx_root: string
}

export interface AnchorRef extends AnchorRefs {
  refs: string[]
  error?: string
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

export interface TransferWithdrawOutput {
  tx_type: 'transfer' | 'withdraw'
  events: EventItm[]
}

export interface ContractCreatedOutput {
  contract_id: string
}

export interface ContractCallOutput {
  tx_type: 'call_contract'
  contract_output: ContractOut
  io_gas: number
  events: EventItm[]
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
  username: string
  weight: number
}
