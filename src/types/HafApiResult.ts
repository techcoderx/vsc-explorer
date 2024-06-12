import { DIDPayload, BlockPayload, NewContractPayload, ContractCommitmentPayload, NodeAnnouncePayload } from './Payloads'

export type L2TxType = 'call_contract' | 'contract_output' | 'anchor_ref'

export interface Props {
  epoch: number
  txrefs: number
  contracts: number
  witnesses: number
  db_version: number
  l2_block_height: number
  transactions: number
  last_processed_block: number
  last_processed_subindexer_op: number
  operations: number
  anchor_refs: number
  bridge_txs: number
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

export interface BlockTx {
  id: string
  did?: string
  tx_type: L2TxType
  block_num: number
  auth_count: number
  idx_in_block: number
}

export interface Witness {
  id: number
  did: string
  consensus_did: string
  enabled: boolean
  username: string
  enabled_at?: string
  disabled_at?: string
  git_commit: string
  latest_git_commit: string
  is_up_to_date: boolean
  last_block?: number
  produced: number
}

export interface Election {
  epoch: number
  l1_block_num: number
  l1_tx: string
  ts: string
  proposer: string
  data_cid: string
  voted_weight: number
  eligible_weight: number
  sig: string
  bv: string
}

export interface Epoch {
  epoch: number
  l1_block_num: number
  l1_tx: string
  ts: string
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
  'enable_witness',
  'disable_witness',
  'allow_witness',
  'disallow_witness',
  'propose_block',
  'create_contract',
  'election_result',
  'join_contract',
  'leave_contract',
  'multisig_txref',
  'custom_json',
  'deposit',
  'withdrawal'
] as const
type TxTypes = (typeof txTypes)[number]

export interface L1Transaction {
  id: number
  nonce: number
  ts: string
  type: TxTypes
  l1_tx: string
  l1_block: number
  username: string
  payload?: DIDPayload | BlockPayload | NewContractPayload | ContractCommitmentPayload | NodeAnnouncePayload | object
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

export interface AnchorRefs {
  id: number
  ts: string
  cid: string
  tx_root: string
  block_num: number
}

export interface AnchorRef extends AnchorRefs {
  refs: string[]
  error?: string
}

export interface L1Acc {
  name: string
  tx_count: number
  last_activity: string
}

export interface Tx {
  id: string
  ts: string
  input: string
  input_src: 'vsc' | 'hive'
  output: string
  block_num: number
  idx_in_block: number
  contract_id: string
  contract_action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  contract_output?: ContractOut[]
  io_gas?: number
  error?: string
}

export interface L1Tx extends Tx {
  signers: {
    active: string[]
    posting: string[]
  }
  tx_type: 'call_contract'
}

export interface L2Tx extends Tx {
  nonce: number
  signers: string[]
  tx_type: L2TxType
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

export interface CIDSearchResult {
  type?: string
  result?: string | number
}

export interface HiveBridgeTx {
  id: number
  ts: string
  in_op: string
  l1_block: number
  username: string
  amount: string
}

export interface WeightedMembers {
  username: string
  weight: number
}
