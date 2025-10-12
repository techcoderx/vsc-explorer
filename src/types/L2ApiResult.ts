import { TxTypes } from './HafApiResult'
import { CoinLower } from './Payloads'

export type Status = 'UNCONFIRMED' | 'INCLUDED' | 'CONFIRMED' | 'FAILED'

export interface GqlResponse<
  T = {
    [key: string]: string
  }
> {
  data: T
}

export interface WitnessSchedule {
  data: {
    witnessSchedule: {
      account: string
      bn: number
    }[]
  }
}

export interface Witness {
  height: number
  ts: string
  did_keys: {
    t: 'consensus'
    key: string
  }[]
  enabled: boolean
  git_commit: string
  peer_id: string
  tx_id: string
  gateway_key: string
}

export interface DagByCID {
  data: {
    getDagByCID: string
  }
}

export interface LatestBridgeTxs {
  deposits: LedgerTx<'deposit'>[]
  withdrawals: LedgerActions<'withdraw'>[]
}

// https://github.com/vsc-eco/go-vsc-node/blob/main/modules/common/params.go#L34-L43
export enum BlockTxType {
  Null,
  Transaction,
  Output,
  Anchor,
  Oplog,
  RcUpdate
}

export interface BlockHeader {
  merkle_root: string
  txs: {
    id: string
    type: BlockTxType
  }[]
}

export interface OpLog {
  __t: 'vsc-oplog'
  __v: '0.1'
  ledger: {
    am: number
    as: CoinLower
    fr: string
    id: string
    mo: string
    to: string
    ty: TxTypes
  }[]

  outputs: {
    id: string
    lidx: number[]
    ok: boolean
  }[]
}

export interface LedgerOpLog<T = TxTypes> {
  to: string
  from: string
  amount: number
  asset: CoinLower
  memo: string
  type: T
  params?: {
    epoch: number
  }
}

export interface LedgerTx<T = TxTypes> {
  id: string
  amount: number
  block_height: number
  timestamp: string
  from: string
  to: string
  type: T
  asset: CoinLower
  tx_id: string
}

export interface LedgerActions<T = TxTypes> {
  id: string
  action_id: string
  status: 'complete' | 'pending'
  amount: number
  asset: CoinLower
  to: string
  memo: string
  type: T
  params?: {
    epoch: number
  }
  block_height: number
  timestamp: string
}

export interface TxIntentAllowance {
  args: {
    limit: string
    token: CoinLower
  }
  type: 'transfer.allow'
}

interface TxDataFer {
  type: 'consensus_stake' | 'consensus_unstake' | 'stake_hbd' | 'transfer' | 'unstake_hbd' | 'withdraw'
  index: number
  data: {
    to: string
    from: string
    amount: string
    asset: 'hive' | 'hbd' | 'hbd_savings'
    memo?: string
  }
}

interface TxDataDeposit {
  type: 'deposit'
  index: number
  data: {
    to: string
    from: string
    amount: number
    asset: 'hive' | 'hbd'
    memo?: string
  }
}

interface TxDataCall {
  type: 'call_contract'
  index: number
  data: {
    action: string
    contract_id: string
    payload: any
    rc_limit: number
    intents: TxIntentAllowance[]
  }
}

export interface Txn {
  id: string
  anchr_height: number
  anchr_index: number
  anchr_ts: string
  type: 'hive' | 'vsc'
  ops: (TxDataFer | TxDataDeposit | TxDataCall)[]
  first_seen: string
  nonce: number
  rc_limit: number
  required_auths: string[]
  required_posting_auths: string[]
  status: Status
  ledger: LedgerOpLog[]
  ledger_actions: LedgerActions[]
  output?: {
    id: string
    index: number[]
  }[]
}

export interface AddrBalance {
  bal?: {
    account: string
    hbd: number
    hbd_savings: number
    hive: number
    hive_consensus: number
    consensus_unstaking: number
    pending_hbd_unstaking: number
  }
  rc?: {
    account: string
    amount: number
    max_rcs: number
  }
}

export interface Contract {
  id: string
  tx_id: string
  creation_height: number
  creation_ts: string
  runtime: 'go' | 'assembly-script'
  creator: string
  owner: string
  name: string
  description: string
  code: string
}

interface ContractOutputBase {
  contract_id: string
  inputs: string[]
  results: {
    err?: string
    errMsg?: string
    logs?: string[]
    ok: boolean
    ret: string
  }[]
  state_merkle: string
}

export interface ContractOutput extends ContractOutputBase {
  id: string
  block_height: number
  timestamp: string
}

export interface ContractOutputDag extends ContractOutputBase {
  __t: 'vsc-output'
  __v: '0.1'
  metadata: {
    current_size: number
    max_size: number
  }
}

export interface OffchainTx {
  __t: 'vsc-tx'
  __v: '0.2'
  headers: {
    intents: TxIntentAllowance[]
    net_id: 'vsc-mainnet'
    nonce: number
    rc_limit: number
    required_auths: string[]
    type: 1
  }
  tx: {
    payload: string
    required_auths: {
      active: string[]
      posting: string[]
    }
    type: TxDataFer['type'] | TxDataCall['type']
  }[]
}
