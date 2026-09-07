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
  { name: 'cancel_contract_update', label: 'Cancel Contract Update', filterer: 64 },
  { name: 'propose_consensus_version', label: 'Propose Consensus Version', filterer: 128 },
  { name: 'recovery_suspend', label: 'Recovery Suspend', filterer: 256 },
  { name: 'recovery_require_version', label: 'Recovery Require Version', filterer: 512 },
  { name: 'withdraw', label: 'Withdraw', filterer: 1024 },
  { name: 'call', label: 'Call', filterer: 2048 },
  { name: 'transfer', label: 'Transfer', filterer: 4096 },
  { name: 'stake_hbd', label: 'Stake HBD', filterer: 8192 },
  { name: 'unstake_hbd', label: 'Unstake HBD', filterer: 16384 },
  { name: 'consensus_stake', label: 'Consensus Stake', filterer: 32768 },
  { name: 'consensus_unstake', label: 'Consensus Unstake', filterer: 65536 },
  { name: 'tss_sign', label: 'TSS Sign', filterer: 131072 },
  { name: 'tss_commitment', label: 'TSS Commitment', filterer: 262144 },
  { name: 'safety_slash_reverse', label: 'Safety Slash Reverse', filterer: 524288 },
  { name: 'tss_halt', label: 'TSS Halt', filterer: 1048576 },
  { name: 'slash_restore', label: 'Slash Restore', filterer: 2097152 },
  { name: 'reserve_payout', label: 'Reserve Payout', filterer: 4194304 },
  { name: 'reserve_vote', label: 'Reserve Vote', filterer: 8388608 },
  { name: 'admit_vote', label: 'Admit Vote', filterer: 16777216 },
  { name: 'announce_node', label: 'Announce Node', filterer: 33554432 },
  { name: 'rotate_multisig', label: 'Rotate Multisig', filterer: 67108864 },
  { name: 'l1_transfer', label: 'L1 Transfer', filterer: 134217728 },
  { name: 'transfer_to_savings', label: 'Transfer to Savings', filterer: 268435456 },
  { name: 'transfer_from_savings', label: 'Transfer from Savings', filterer: 536870912 },
  { name: 'interest', label: 'Interest', filterer: 1073741824 },
  { name: 'fill_transfer_from_savings', label: 'Fill Transfer from Savings', filterer: 2147483648 }
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
