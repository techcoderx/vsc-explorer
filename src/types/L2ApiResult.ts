import { TxTypes } from './HafApiResult'
import { CallContractPayload, XferWdPayload } from './Payloads'

export interface WitnessSchedule {
  data: {
    witnessSchedule: {
      account: string
      bn: number
    }[]
  }
}

export interface DagByCID {
  data: {
    getDagByCID: string
  }
}

export interface DagByCIDBatch {
  data: {
    [key: string]: string
  }
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
    as: 'hive' | 'hbd'
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

export interface Tx {
  data: {
    findTransaction: {
      txs: {
        id: string
        first_seen: string // inaccurate upon reindex
        src: 'vsc'
        status: 'UNCONFIRMED' | 'INCLUDED' | 'CONFIRMED'
        sig_hash?: string // absent if graphql node was reindexed after the transaction
        data: CallContractPayload | XferWdPayload
      }[]
    }
  }
}
