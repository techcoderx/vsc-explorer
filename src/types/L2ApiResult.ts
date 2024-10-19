import { CallContractPayload, XferWdPayload } from './Payloads'

export interface AccountBalance {
  data: {
    getAccountBalance: {
      account: string
      block_height: number
      tokens: {
        HBD: number
        HIVE: number
      }
    }
  }
}

export interface WitnessSchedule {
  data: {
    witnessSchedule: {
      key: string
      account: string
      bn: number
      bn_works: boolean
      in_past: boolean
    }[]
  }
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
