import {
  Props,
  L1Transaction,
  AccInfo,
  CIDSearchResult,
  Election,
  Block,
  WitnessStat,
  BridgeCounter,
  AddrTxStats
} from './types/HafApiResult'
import { hafVscApi, hiveApi, vscNodeApi } from './settings'
import {
  WitnessSchedule,
  Witness,
  DagByCID,
  GqlResponse,
  LatestBridgeTxs,
  LedgerTx,
  LedgerActions,
  Txn,
  Contract,
  AddrBalance
} from './types/L2ApiResult'
import { useQuery } from '@tanstack/react-query'

export const fetchProps = async (): Promise<Props> => {
  return await (await fetch(`${hafVscApi}/props`)).json()
}

export const fetchBlocks = async (last_block_id: number, count = 50): Promise<Block[]> => {
  return await (await fetch(`${hafVscApi}/blocks?last_block_id=${last_block_id}&count=${count}`)).json()
}

export const fetchBlocksByProposer = async (proposer: string, count = 50, last_block_id?: number): Promise<Block[]> => {
  return await (
    await fetch(
      `${hafVscApi}/blocks?proposer=${proposer}&count=${count}${last_block_id ? `&last_block_id=${last_block_id}` : ''}`
    )
  ).json()
}

export const fetchLatestTxs = async (): Promise<L1Transaction[]> => {
  return await (await fetch(`${hafVscApi}/haf/latest-ops/50/true`)).json()
}

export const fetchContracts = async (opts: object): Promise<Contract[]> => {
  return (
    await gql<GqlResponse<{ contracts: Contract[] }>>(
      `query Contracts($opts: FindContractFilter) { contracts: findContract(filterOptions: $opts) { id code creator owner tx_id creation_height creation_ts runtime }}`,
      { opts }
    )
  ).data.contracts
}

export const fetchBlock = async (block_id: number | string, by: string = 'id'): Promise<Block> => {
  return await (await fetch(`${hafVscApi}/block/by-${by}/${block_id}`)).json()
}

export const fetchWitnessStat = async (username: string): Promise<WitnessStat> => {
  return await (await fetch(`${hafVscApi}/witness/${username}/stats`)).json()
}

/**
 * @param usernames Comma separated usernames
 */
export const fetchWitnessStatMany = async (usernames: string): Promise<WitnessStat[]> => {
  return await (await fetch(`${hafVscApi}/witness/${usernames}/stats/many`)).json()
}

export const fetchElections = async (last_epoch: number, count: number = 100): Promise<Election[]> => {
  return await (await fetch(`${hafVscApi}/epochs?last_epoch=${last_epoch}&count=${count}`)).json()
}

export const fetchEpoch = async (epoch_num: number): Promise<Election> => {
  return await (await fetch(`${hafVscApi}/epoch/${epoch_num}`)).json()
}

export const fetchBlocksInEpoch = async (epoch_num: number, count: number = 100, offset: number = 0): Promise<Block[]> => {
  return await (await fetch(`${hafVscApi}/blocks?epoch=${epoch_num}&count=${count}&offset=${offset}`)).json()
}

export const fetchAccHistory = async (username: string, count: number = 50, last_nonce?: number): Promise<L1Transaction[]> => {
  return await (await fetch(`${hafVscApi}/haf/user/${username}/history/${count}${last_nonce ? `/${last_nonce}` : ''}`)).json()
}

export const fetchL1AccInfo = async (username: string): Promise<AccInfo> => {
  return await (await fetch(`${hafVscApi}/haf/user/${username}`)).json()
}

export const fetchL1TxOutput = async (trx_id: string): Promise<(Block | Election | Contract | Txn | null)[]> => {
  return await (await fetch(`${hafVscApi}/tx/${trx_id}/output`)).json()
}

export const getBridgeTxCounts = async (): Promise<BridgeCounter> => {
  return await (await fetch(`${hafVscApi}/bridge/stats`)).json()
}

export const useAddrTxStats = (addr: string, enabled: boolean = true) => {
  const { data: addrStats } = useQuery<AddrTxStats>({
    queryKey: ['vsc-addr-stat-counts', addr],
    queryFn: async () => (await fetch(`${hafVscApi}/address/${addr}/stats`)).json(),
    enabled
  })
  return addrStats
}

export const cidSearch = async (search_cid: string): Promise<CIDSearchResult> => {
  return await (await fetch(`${hafVscApi}/search/${search_cid}`)).json()
}

export const fetchL1Rest = async <T>(route: string): Promise<T> => {
  return await (await fetch(`${hiveApi}${route}`)).json()
}

const gql = async <T>(query: string, variables: { [key: string]: any } = {}) => {
  return (await (
    await fetch(vscNodeApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        variables,
        extensions: {}
      }),
      signal: AbortSignal.timeout(10000)
    })
  ).json()) as T
}

export const getWitness = async (user: string) => {
  const result = await gql<GqlResponse<{ witness: Witness }>>(
    `query GetWitness($account: String!) {
      witness: getWitness(account: $account) { height ts did_keys { t key } enabled git_commit peer_id tx_id gateway_key }
  }`,
    { account: user }
  )
  return result.data.witness
}

export const getWitnessSchedule = async (height: number): Promise<WitnessSchedule> => {
  return gql<WitnessSchedule>(
    `
    query WitnessSchedule($height: Uint64!) {
      witnessSchedule(height: $height) { account bn }
    }
    `,
    {
      height: height.toString()
    }
  )
}

export const getDagByCID = async <T>(cid: string): Promise<T> => {
  const query = `
    query DagByCID($cid: String!) {
      getDagByCID(cidString: $cid)
    }  
  `
  const result = await gql<DagByCID>(query, { cid })
  return JSON.parse(result.data.getDagByCID)
}

export const getDagByCIDBatch = async <T>(cids: string[]): Promise<T[]> => {
  // Generate query fragments for each CID (e.g., "d0: getDagByCID(cidString: $cid0)")
  const queryFragments = cids.map((_, index) => `d${index}: getDagByCID(cidString: $cid${index})`)

  // Create variables object { cid0: "Qm...", cid1: "Qm...", ... }
  const variables = cids.reduce(
    (acc, cid, index) => ({
      ...acc,
      [`cid${index}`]: cid
    }),
    {} as Record<string, string>
  )

  // Construct full query
  const query = `
    query DagByCID(${cids.map((_, i) => `$cid${i}: String!`).join(', ')}) {
      ${queryFragments.join('\n')}
    }
  `

  // Execute query and map results to array
  const result = await gql<GqlResponse>(query, variables)
  return cids.map((_, index) => JSON.parse(result.data[`d${index}`]))
}

export const useDagByCID = <T>(cid: string, enabled = true, retry = true) => {
  return useQuery({
    queryKey: ['dag-by-cid', cid],
    queryFn: async () => getDagByCID<T>(cid),
    refetchOnWindowFocus: false,
    retry,
    enabled
  })
}

export const useContracts = (opts: object) => {
  const {
    data: contracts,
    isLoading,
    isError
  } = useQuery({ queryKey: ['vsc-contracts', opts], queryFn: () => fetchContracts(opts) })
  return { contracts, isLoading, isError }
}

export const useAddrBalance = (acc: string) => {
  const { data: balance, isLoading } = useQuery({
    queryKey: ['vsc-address-balance', acc],
    queryFn: async () => {
      return (
        await gql<GqlResponse<AddrBalance>>(
          `query AccBal($acc: String!) { bal: getAccountBalance(account: $acc) { hbd hbd_savings hive hive_consensus consensus_unstaking } rc: getAccountRC(account: $acc) { amount block_height }}`,
          { acc }
        )
      ).data
    }
  })
  return { balance, isLoading }
}

export const fetchLatestBridgeTxs = async (limit = 25): Promise<LatestBridgeTxs> => {
  const result = await gql<GqlResponse<LatestBridgeTxs>>(
    `
    query BridgeActivity($deposit: LedgerTxFilter, $withdrawal: LedgerActionsFilter) {
      deposits: findLedgerTXs(filterOptions: $deposit) { id timestamp type from to: owner amount asset }
      withdrawals: findLedgerActions(filterOptions: $withdrawal) { id action_id timestamp type status to amount asset }
    }`,
    {
      withdrawal: {
        limit,
        byTypes: ['withdraw']
      },
      deposit: {
        limit,
        byTypes: ['deposit']
      }
    }
  )
  return result.data
}

export const getDeposits = async (offset = 0, limit = 100, options?: object): Promise<{ deposits: LedgerTx[] }> => {
  const result = await gql<GqlResponse<{ deposits: LedgerTx[] }>>(
    `
    query BridgeActivity($deposit: LedgerTxFilter) {
      deposits: findLedgerTXs(filterOptions: $deposit) { id timestamp type from to: owner amount asset }
    }`,
    {
      deposit: {
        ...options,
        offset,
        limit
      }
    }
  )
  return result.data
}

export const getWithdrawals = async (offset = 0, limit = 100, options?: object): Promise<{ withdrawals: LedgerActions[] }> => {
  const result = await gql<GqlResponse<{ withdrawals: LedgerActions[] }>>(
    `
    query BridgeActivity($withdrawal: LedgerActionsFilter) {
      withdrawals: findLedgerActions(filterOptions: $withdrawal) { id action_id timestamp type status to amount asset }
    }`,
    {
      withdrawal: {
        ...options,
        offset,
        limit
      }
    }
  )
  return result.data
}

export const fetchLatestL2Txns = async (): Promise<{ txns: Txn[] }> => {
  const result = await gql<GqlResponse<{ txns: Txn[] }>>(
    `{ txns: findTransaction { id anchr_height anchr_ts required_auths status ops { type, data }} }`
  )
  return result.data
}

export const fetchL2TxnsBy = async (offset: number = 0, limit: number = 50, options?: object): Promise<{ txns: Txn[] }> => {
  const result = await gql<GqlResponse<{ txns: Txn[] }>>(
    `query AccHistory ($opts: TransactionFilter) { txns: findTransaction(filterOptions: $opts) { id anchr_height anchr_ts required_auths status ops { type, data }}}`,
    {
      opts: {
        ...options,
        offset,
        limit
      }
    }
  )
  return result.data
}

export const fetchL2TxnsDetailed = async (id: string): Promise<{ txns: Txn[] }> => {
  const result = await gql<GqlResponse<{ txns: Txn[] }>>(
    `query AccHistory ($opts: TransactionFilter) { txns: findTransaction(filterOptions: $opts) { id anchr_height anchr_ts required_auths status ops { type, index, data } rc_limit ledger { type from to amount asset memo params } ledger_actions { type status to amount asset memo data } }}`,
    {
      opts: {
        byId: id,
        offset: 0,
        limit: 1
      }
    }
  )
  return result.data
}
