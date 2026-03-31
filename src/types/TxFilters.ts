import { Status, TxnTypes } from './L2ApiResult'

export interface TxFilterState {
  status?: Status
  type?: TxnTypes
  account?: string
  contract?: string
  fromDate?: string
  toDate?: string
}

export const TX_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'UNCONFIRMED', label: 'Unconfirmed' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'INCLUDED', label: 'Included' }
]

export const TX_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'call', label: 'Contract Call' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'consensus_stake', label: 'Stake' },
  { value: 'consensus_unstake', label: 'Unstake' },
  { value: 'stake_hbd', label: 'Stake HBD' },
  { value: 'unstake_hbd', label: 'Unstake HBD' },
  { value: 'withdraw', label: 'Withdraw' }
]
