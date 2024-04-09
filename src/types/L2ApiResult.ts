export interface AccountBalance {
  data: {
    getAccountBalance: {
      account: string,
      block_height: number,
      tokens: {
        HBD: number,
        HIVE: number
      }
    }
  }
}