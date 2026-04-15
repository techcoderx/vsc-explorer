import { useQuery } from '@tanstack/react-query'
import { getConf } from './settings'
import {
  HasuraResponse,
  ContractTypeLookup,
  TokenRegistry,
  TokenOverview,
  TokenBalance,
  TokenTransfer,
  NftRegistry,
  NftTransfer,
  NftTokenInfo,
  BtcMappingBalance,
  BtcMappingDeposit,
  BtcMappingTransfer,
  BtcMappingUnmap,
  BtcMappingVolume
} from './types/HasuraResult'

const conf = getConf()

const hasuraGql = async <T>(query: string, variables: { [key: string]: unknown } = {}) => {
  return (await (
    await fetch(conf.hasuraApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      }),
      signal: AbortSignal.timeout(10000)
    })
  ).json()) as HasuraResponse<T>
}

// Contract type lookup
export const fetchContractType = async (contractId: string): Promise<string | null> => {
  const result = await hasuraGql<{ contract_type_lookup: ContractTypeLookup[] }>(
    `query ContractType($contractId: String!) {
      contract_type_lookup(where: { contract_id: { _eq: $contractId } }) {
        contract_type
      }
    }`,
    { contractId }
  )
  return result.data.contract_type_lookup[0]?.contract_type ?? null
}

export const useContractType = (contractId: string, enabled = true) => {
  return useQuery({
    queryKey: ['hasura-contract-type', contractId],
    queryFn: () => fetchContractType(contractId),
    staleTime: 300000,
    enabled
  })
}

// Token queries
export const fetchTokenRegistry = async (): Promise<TokenRegistry[]> => {
  const result = await hasuraGql<{ magi_token_registry: TokenRegistry[] }>(
    `query { magi_token_registry(order_by: { init_block: desc }) { contract_id name symbol decimals max_supply owner init_block init_ts } }`
  )
  return result.data.magi_token_registry
}

export const fetchTokenOverview = async (contractId: string): Promise<TokenOverview | null> => {
  const result = await hasuraGql<{ magi_token_overview: TokenOverview[] }>(
    `query TokenOverview($contractId: String!) {
      magi_token_overview(where: { contract_id: { _eq: $contractId } }) {
        contract_id name symbol decimals max_supply owner init_block init_ts current_supply paused
      }
    }`,
    { contractId }
  )
  return result.data.magi_token_overview[0] ?? null
}

export const fetchTokenBalances = async (contractId: string, limit: number, offset: number): Promise<TokenBalance[]> => {
  const result = await hasuraGql<{ magi_token_balances: TokenBalance[] }>(
    `query TokenBalances($contractId: String!, $limit: Int!, $offset: Int!) {
      magi_token_balances(where: { contract_id: { _eq: $contractId } }, order_by: { balance: desc }, limit: $limit, offset: $offset) {
        contract_id account balance
      }
    }`,
    { contractId, limit, offset }
  )
  return result.data.magi_token_balances
}

export const fetchTokenBalancesByAccount = async (account: string): Promise<TokenBalance[]> => {
  const result = await hasuraGql<{ magi_token_balances: TokenBalance[] }>(
    `query TokenBalancesByAccount($account: String!) {
      magi_token_balances(where: { account: { _eq: $account } }, order_by: { balance: desc }) {
        contract_id account balance
      }
    }`,
    { account }
  )
  return result.data.magi_token_balances
}

export const fetchTokenTransfers = async (contractId: string, limit: number, offset: number): Promise<TokenTransfer[]> => {
  const result = await hasuraGql<{ magi_token_transfer_events: TokenTransfer[] }>(
    `query TokenTransfers($contractId: String!, $limit: Int!, $offset: Int!) {
      magi_token_transfer_events(where: { indexer_contract_id: { _eq: $contractId } }, order_by: { indexer_id: desc }, limit: $limit, offset: $offset) {
        indexer_id indexer_block_height indexer_tx_hash indexer_ts indexer_contract_id from to amount
      }
    }`,
    { contractId, limit, offset }
  )
  return result.data.magi_token_transfer_events
}

export const fetchTokenTransferCount = async (contractId: string): Promise<number> => {
  const result = await hasuraGql<{ magi_token_transfer_events_aggregate: { aggregate: { count: number } } }>(
    `query TokenTransferCount($contractId: String!) {
      magi_token_transfer_events_aggregate(where: { indexer_contract_id: { _eq: $contractId } }) { aggregate { count } }
    }`,
    { contractId }
  )
  return result.data.magi_token_transfer_events_aggregate.aggregate.count
}

export const fetchTokenBalanceCount = async (contractId: string): Promise<number> => {
  const result = await hasuraGql<{ magi_token_balances_aggregate: { aggregate: { count: number } } }>(
    `query TokenBalanceCount($contractId: String!) {
      magi_token_balances_aggregate(where: { contract_id: { _eq: $contractId } }) { aggregate { count } }
    }`,
    { contractId }
  )
  return result.data.magi_token_balances_aggregate.aggregate.count
}

// Token hooks
export const useTokenRegistry = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['hasura-token-registry'],
    queryFn: fetchTokenRegistry,
    staleTime: 60000
  })
  return { tokens: data, isLoading }
}

export const useTokenOverview = (contractId: string) => {
  return useQuery({
    queryKey: ['hasura-token-overview', contractId],
    queryFn: () => fetchTokenOverview(contractId),
    staleTime: 60000
  })
}

// NFT queries
export const fetchNftRegistry = async (): Promise<NftRegistry[]> => {
  const result = await hasuraGql<{ magi_nft_registry: NftRegistry[] }>(
    `query { magi_nft_registry(order_by: { init_block: desc }) { contract_id name symbol base_uri owner init_block init_ts } }`
  )
  return result.data.magi_nft_registry
}

export const fetchNftRegistryByContract = async (contractId: string): Promise<NftRegistry | null> => {
  const result = await hasuraGql<{ magi_nft_registry: NftRegistry[] }>(
    `query NftRegistryByContract($contractId: String!) {
      magi_nft_registry(where: { contract_id: { _eq: $contractId } }) { contract_id name symbol base_uri owner init_block init_ts }
    }`,
    { contractId }
  )
  return result.data.magi_nft_registry[0] ?? null
}

export const fetchNftTransfers = async (contractId: string, limit: number, offset: number): Promise<NftTransfer[]> => {
  const result = await hasuraGql<{ magi_nft_all_transfers: NftTransfer[] }>(
    `query NftTransfers($contractId: String!, $limit: Int!, $offset: Int!) {
      magi_nft_all_transfers(where: { indexer_contract_id: { _eq: $contractId } }, order_by: { indexer_ts: desc }, limit: $limit, offset: $offset) {
        indexer_contract_id indexer_tx_hash operator from to token_id value indexer_block_height indexer_ts
      }
    }`,
    { contractId, limit, offset }
  )
  return result.data.magi_nft_all_transfers
}

export const fetchNftTransferCount = async (contractId: string): Promise<number> => {
  const result = await hasuraGql<{ magi_nft_all_transfers_aggregate: { aggregate: { count: number } } }>(
    `query NftTransferCount($contractId: String!) {
      magi_nft_all_transfers_aggregate(where: { indexer_contract_id: { _eq: $contractId } }) { aggregate { count } }
    }`,
    { contractId }
  )
  return result.data.magi_nft_all_transfers_aggregate.aggregate.count
}

export const fetchNftTokens = async (contractId: string, limit: number, offset: number): Promise<NftTokenInfo[]> => {
  const result = await hasuraGql<{ magi_nft_token_info: NftTokenInfo[] }>(
    `query NftTokens($contractId: String!, $limit: Int!, $offset: Int!) {
      magi_nft_token_info(where: { contract_id: { _eq: $contractId } }, order_by: { token_id: asc }, limit: $limit, offset: $offset) {
        contract_id token_id max_supply soulbound indexer_block_height created_ts has_properties
      }
    }`,
    { contractId, limit, offset }
  )
  return result.data.magi_nft_token_info
}

export const fetchNftTokenCount = async (contractId: string): Promise<number> => {
  const result = await hasuraGql<{ magi_nft_token_info_aggregate: { aggregate: { count: number } } }>(
    `query NftTokenCount($contractId: String!) {
      magi_nft_token_info_aggregate(where: { contract_id: { _eq: $contractId } }) { aggregate { count } }
    }`,
    { contractId }
  )
  return result.data.magi_nft_token_info_aggregate.aggregate.count
}

export const useNftRegistry = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['hasura-nft-registry'],
    queryFn: fetchNftRegistry,
    staleTime: 60000
  })
  return { nfts: data, isLoading }
}

// BTC Mapping queries
export const fetchBtcBalances = async (limit: number, offset: number): Promise<BtcMappingBalance[]> => {
  const result = await hasuraGql<{ btc_mapping_balances: BtcMappingBalance[] }>(
    `query BtcBalances($limit: Int!, $offset: Int!) {
      btc_mapping_balances(order_by: { balance_sats: desc }, limit: $limit, offset: $offset) {
        account balance_sats
      }
    }`,
    { limit, offset }
  )
  return result.data.btc_mapping_balances
}

export const fetchBtcBalanceByAccount = async (account: string): Promise<BtcMappingBalance | null> => {
  const result = await hasuraGql<{ btc_mapping_balances: BtcMappingBalance[] }>(
    `query BtcBalanceByAccount($account: String!) {
      btc_mapping_balances(where: { account: { _eq: $account } }) {
        account balance_sats
      }
    }`,
    { account }
  )
  return result.data.btc_mapping_balances[0] ?? null
}

export const useBtcBalanceByAccount = (account: string) => {
  return useQuery({
    queryKey: ['hasura-btc-balance-account', account],
    queryFn: () => fetchBtcBalanceByAccount(account),
    staleTime: 60000
  })
}

export const fetchBtcRecentDeposits = async (limit: number): Promise<BtcMappingDeposit[]> => {
  const result = await hasuraGql<{ btc_mapping_deposit_events: BtcMappingDeposit[] }>(
    `query BtcDeposits($limit: Int!) {
      btc_mapping_deposit_events(order_by: { indexer_id: desc }, limit: $limit) {
        indexer_id indexer_block_height indexer_tx_hash indexer_ts indexer_contract_id recipient sender amount
      }
    }`,
    { limit }
  )
  return result.data.btc_mapping_deposit_events
}

export const fetchBtcRecentTransfers = async (limit: number): Promise<BtcMappingTransfer[]> => {
  const result = await hasuraGql<{ btc_mapping_transfer_events: BtcMappingTransfer[] }>(
    `query BtcTransfers($limit: Int!) {
      btc_mapping_transfer_events(order_by: { indexer_id: desc }, limit: $limit) {
        indexer_id indexer_block_height indexer_tx_hash indexer_ts indexer_contract_id from_addr to_addr amount
      }
    }`,
    { limit }
  )
  return result.data.btc_mapping_transfer_events
}

export const fetchBtcRecentUnmaps = async (limit: number): Promise<BtcMappingUnmap[]> => {
  const result = await hasuraGql<{ btc_mapping_unmap_events: BtcMappingUnmap[] }>(
    `query BtcUnmaps($limit: Int!) {
      btc_mapping_unmap_events(order_by: { indexer_id: desc }, limit: $limit) {
        indexer_id indexer_block_height indexer_tx_hash indexer_ts indexer_contract_id tx_id from_addr to_addr deducted sent
      }
    }`,
    { limit }
  )
  return result.data.btc_mapping_unmap_events
}

export const fetchBtcTvl = async (): Promise<string | null> => {
  const result = await hasuraGql<{ btc_mapping_balances_aggregate: { aggregate: { sum: { balance_sats: string | null } } } }>(
    `query { btc_mapping_balances_aggregate { aggregate { sum { balance_sats } } } }`
  )
  return result.data.btc_mapping_balances_aggregate.aggregate.sum.balance_sats
}

export const fetchBtcUnmaps24h = async (): Promise<number> => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const result = await hasuraGql<{ btc_mapping_unmap_events_aggregate: { aggregate: { count: number } } }>(
    `query BtcUnmaps24h($since: timestamp!) {
      btc_mapping_unmap_events_aggregate(where: { indexer_ts: { _gte: $since } }) {
        aggregate { count }
      }
    }`,
    { since }
  )
  return result.data.btc_mapping_unmap_events_aggregate.aggregate.count
}

export const fetchBtcVolume24h = async (): Promise<BtcMappingVolume | null> => {
  const result = await hasuraGql<{ btc_mapping_volume_24h: BtcMappingVolume[] }>(
    `query { btc_mapping_volume_24h { deposit_count total_sats } }`
  )
  return result.data.btc_mapping_volume_24h[0] ?? null
}

export const fetchBtcVolume7d = async (): Promise<BtcMappingVolume | null> => {
  const result = await hasuraGql<{ btc_mapping_volume_7d: BtcMappingVolume[] }>(
    `query { btc_mapping_volume_7d { deposit_count total_sats } }`
  )
  return result.data.btc_mapping_volume_7d[0] ?? null
}

export const fetchBtcVolume30d = async (): Promise<BtcMappingVolume | null> => {
  const result = await hasuraGql<{ btc_mapping_volume_30d: BtcMappingVolume[] }>(
    `query { btc_mapping_volume_30d { deposit_count total_sats } }`
  )
  return result.data.btc_mapping_volume_30d[0] ?? null
}

// Address token/NFT balance hooks
export const useTokenBalancesByAccount = (account: string) => {
  return useQuery({
    queryKey: ['hasura-token-balances-account', account],
    queryFn: () => fetchTokenBalancesByAccount(account),
    staleTime: 60000
  })
}

export const fetchNftBalancesByAccount = async (account: string, limit: number, offset: number): Promise<NftTransfer[]> => {
  const result = await hasuraGql<{ magi_nft_all_transfers: NftTransfer[] }>(
    `query NftByAccount($account: String!, $limit: Int!, $offset: Int!) {
      magi_nft_all_transfers(where: { to: { _eq: $account } }, order_by: { indexer_ts: desc }, limit: $limit, offset: $offset) {
        indexer_contract_id operator from to token_id value indexer_block_height indexer_ts
      }
    }`,
    { account, limit, offset }
  )
  return result.data.magi_nft_all_transfers
}

export const fetchNftBalanceCountByAccount = async (account: string): Promise<number> => {
  const result = await hasuraGql<{ magi_nft_all_transfers_aggregate: { aggregate: { count: number } } }>(
    `query NftBalanceCountByAccount($account: String!) {
      magi_nft_all_transfers_aggregate(where: { to: { _eq: $account } }) { aggregate { count } }
    }`,
    { account }
  )
  return result.data.magi_nft_all_transfers_aggregate.aggregate.count
}
