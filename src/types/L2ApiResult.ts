import { TxTypes } from './HafApiResult'
import { CallContractPayload, XferWdPayload, CoinLower } from './Payloads'

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
  params: null
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
  params?: object
  block_height: number
  timestamp: string
}

interface TxDataFer {
  type: 'consensus_stake' | 'consensus_unstake' | 'deposit' | 'stake_hbd' | 'transfer' | 'unstake_hbd' | 'withdraw'
  to: string
  from: string
  amount: number
  asset: 'hive' | 'hbd' | 'hbd_savings'
  memo?: string
}

interface TxDataCall {
  type: 'call_contract'
  action: string
  contract_id: string
  payload: any
  rc_limit: number
  intents: []
}

export interface Txn {
  id: string
  tx_id: string
  anchr_height: number
  anchr_index: number
  anchr_opidx: number
  anchr_ts: string
  type: 'hive' | 'vsc'
  data: TxDataFer | TxDataCall
  first_seen: string
  nonce: number
  rc_limit: number
  required_auths: string[]
  status: Status
  ledger: LedgerOpLog[]
}

export interface Tx {
  data: {
    findTransaction: {
      txs: {
        id: string
        first_seen: string // inaccurate upon reindex
        src: 'vsc'
        status: Status
        sig_hash?: string // absent if graphql node was reindexed after the transaction
        data: CallContractPayload | XferWdPayload
      }[]
    }
  }
}
