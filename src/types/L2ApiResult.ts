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
