type L1AccountAuths = {
  account_auths: [string, number][]
  key_auths: [string, number][]
  weight_threshold: number
}

export type L1AccountAuthority = {
  owner: L1AccountAuths
  active: L1AccountAuths
  posting: L1AccountAuths
  memo: string
  witness_signing: string
}

export type L1Account = {
  id: number
  balance: number
  savings_balance: number
  hbd_balance: number
  hbd_saving_balance: number
  vesting_shares: number
  owner: L1AccountAuths
  active: L1AccountAuths
  posting: L1AccountAuths
}
