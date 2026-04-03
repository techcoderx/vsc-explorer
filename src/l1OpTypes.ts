import { useSyncExternalStore } from 'react'

export interface L1OpType {
  name: string
  label: string
  filterer: number
}

export const L1_OP_TYPES: L1OpType[] = [
  { name: 'fr_sync', label: 'FR Sync', filterer: 1 },
  { name: 'actions', label: 'Actions', filterer: 2 },
  { name: 'produce_block', label: 'Produce Block', filterer: 4 },
  { name: 'create_contract', label: 'Create Contract', filterer: 8 },
  { name: 'update_contract', label: 'Update Contract', filterer: 16 },
  { name: 'election_result', label: 'Election Result', filterer: 32 },
  { name: 'withdraw', label: 'Withdraw', filterer: 64 },
  { name: 'call', label: 'Call', filterer: 128 },
  { name: 'transfer', label: 'Transfer', filterer: 256 },
  { name: 'stake_hbd', label: 'Stake HBD', filterer: 512 },
  { name: 'unstake_hbd', label: 'Unstake HBD', filterer: 1024 },
  { name: 'consensus_stake', label: 'Consensus Stake', filterer: 2048 },
  { name: 'consensus_unstake', label: 'Consensus Unstake', filterer: 4096 },
  { name: 'tss_sign', label: 'TSS Sign', filterer: 8192 },
  { name: 'tss_commitment', label: 'TSS Commitment', filterer: 16384 },
  { name: 'announce_node', label: 'Announce Node', filterer: 32768 },
  { name: 'rotate_multisig', label: 'Rotate Multisig', filterer: 65536 },
  { name: 'l1_transfer', label: 'L1 Transfer', filterer: 131072 },
  { name: 'transfer_to_savings', label: 'Transfer to Savings', filterer: 262144 },
  { name: 'transfer_from_savings', label: 'Transfer from Savings', filterer: 524288 },
  { name: 'interest', label: 'Interest', filterer: 1048576 },
  { name: 'fill_transfer_from_savings', label: 'Fill Transfer from Savings', filterer: 2097152 }
]

export const toggleOp = (bitmask: number, filterer: number): number => bitmask ^ filterer

const _filterStore = new Map<string, number>()
const _subscribers = new Set<() => void>()

export const setL1OpsFilter = (key: string, bitmask: number) => {
  if (bitmask > 0) _filterStore.set(key, bitmask)
  else _filterStore.delete(key)
  _subscribers.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  _subscribers.add(fn)
  return () => _subscribers.delete(fn)
}

export const useL1OpsFilter = (key: string): number =>
  useSyncExternalStore(subscribe, () => _filterStore.get(key) ?? 0)
