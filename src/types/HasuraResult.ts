export interface HasuraResponse<T> {
  data: T
}

export interface IndexerEvent {
  indexer_id: number
  indexer_block_height: number
  indexer_tx_hash: string
  indexer_ts: string
  indexer_log_hash: string
  indexer_contract_id: string
}

// Token types
export interface TokenRegistry {
  contract_id: string
  name: string
  symbol: string
  decimals: number
  max_supply: string
  owner: string
  init_block: number
  init_ts: string
}

export interface TokenOverview extends TokenRegistry {
  current_supply: string
  paused: boolean
}

export interface TokenBalance {
  contract_id: string
  account: string
  balance: string
}

export interface TokenTransfer extends IndexerEvent {
  from: string
  to: string
  amount: string
}

// NFT types
export interface NftRegistry {
  contract_id: string
  name: string
  symbol: string
  base_uri: string
  owner: string
  init_block: number
  init_ts: string
}

export interface NftTransfer {
  indexer_contract_id: string
  indexer_tx_hash: string
  operator: string
  from: string
  to: string
  token_id: string
  value: string
  indexer_block_height: number
  indexer_ts: string
}

export interface NftTokenInfo {
  contract_id: string
  token_id: string
  max_supply: string
  soulbound: boolean
  indexer_block_height: number
  created_ts: string
  has_properties: boolean
}

// Contract type lookup
export interface ContractTypeLookup {
  contract_id: string
  contract_type: string
  block_height: number
  discovered_at: string
}

// BTC Mapping types
export interface BtcMappingBalance {
  account: string
  balance_sats: string
}

export interface BtcMappingDeposit extends IndexerEvent {
  recipient: string
  sender: string
  amount: string
}

export interface BtcMappingTransfer extends IndexerEvent {
  from_addr: string
  to_addr: string
  amount: string
}

export interface BtcMappingVolume {
  deposit_count: number
  total_sats: string
}

export interface NormalizedTransfer {
  txId: string
  ts: string
  from: string
  to: string
  formattedAmount: string
}
