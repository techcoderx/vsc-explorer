import { CallContractPayload, XferWdPayload } from './Payloads'

export interface WitnessSchedule {
  data: {
    witnessSchedule: {
      account: string
      bn: number
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
