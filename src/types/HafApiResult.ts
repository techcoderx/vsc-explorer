import {
  DIDPayload,
  BlockPayload,
  NewContractPayload,
  ContractCommitmentPayload,
  NodeAnnouncePayload,
  MultisigTxRefPayload
} from './Payloads'

export type L2TxType = 'call_contract' | 'contract_output' | 'anchor_ref'

export interface Props {
  epoch: number
  txrefs: number
  contracts: number
  witnesses: number
  db_version: number
  l2_block_height: number
  l2_transactions: number
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
  txs: number
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
]  as const
type TxTypes = typeof txTypes[number]

export interface L1Transaction {
  id: number
  nonce: number
  ts: string
  type: TxTypes
  l1_tx: string
  l1_block: number
  username: string
  payload?: DIDPayload | BlockPayload | NewContractPayload | ContractCommitmentPayload | NodeAnnouncePayload | MultisigTxRefPayload | object
}

export interface Contract {
  contract_id: string
  created_in_op: string
  created_in_l1_block: number
  created_at: string
  name: string
  description: string
  code: string
}

export interface MultisigTxRef {
  id: number
  ts: string
  l1_tx: string
  l1_block: number
  ref_id: string
}

export interface L1Acc {
  name: string
  tx_count: number
  last_activity: string
}