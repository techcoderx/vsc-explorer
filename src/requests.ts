import {
  Props,
  Witness,
  L1Transaction,
  Contract,
  AccInfo,
  L2ContractCallTx,
  CIDSearchResult,
  Election,
  UserBalance,
  Block,
  TxHeader,
  WitnessStat,
  BridgeCounter,
  AddrTxStats
} from './types/HafApiResult'
import { hafVscApi, hiveApi, vscNodeApi } from './settings'
import {
  WitnessSchedule,
  Tx as L2TxGql,
  DagByCID,
  GqlResponse,
  LatestBridgeTxs,
  LedgerTx,
  LedgerActions,
  Txn
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

export const fetchWitnesses = async (): Promise<Witness[]> => {
  return await (await fetch(`${hafVscApi}/haf/witnesses`)).json()
}

export const fetchLatestTxs = async (): Promise<L1Transaction[]> => {
  return await (await fetch(`${hafVscApi}/haf/latest-ops/50/true`)).json()
}

export const fetchLatestContracts = async (): Promise<Contract[]> => {
  return await (await fetch(`${hafVscApi}/contracts`)).json()
}

export const fetchContractByID = async (contract_id: string): Promise<Contract> => {
  return await (await fetch(`${hafVscApi}/contract/${contract_id}`)).json()
}

export const fetchBlock = async (block_id: number | string, by: string = 'id'): Promise<Block> => {
  return await (await fetch(`${hafVscApi}/block/by-${by}/${block_id}`)).json()
}

export const fetchWitness = async (username: string): Promise<Witness> => {
  return await (await fetch(`${hafVscApi}/haf/user/${username}/witness`)).json()
}

export const fetchWitnessStat = async (username: string): Promise<WitnessStat> => {
  return await (await fetch(`${hafVscApi}/witness/${username}/stats`)).json()
}

export const fetchElections = async (last_epoch: number, count: number = 100): Promise<Election[]> => {
  return await (await fetch(`${hafVscApi}/epochs?last_epoch=${last_epoch}&count=${count}`)).json()
}

export const fetchEpoch = async (epoch_num: number): Promise<Election> => {
  return await (await fetch(`${hafVscApi}/epoch/${epoch_num}`)).json()
}

export const fetchBlocksInEpoch = async (epoch_num: number, count: number = 100, last_block_id?: number): Promise<Block[]> => {
  return await (
    await fetch(`${hafVscApi}/blocks?epoch=${epoch_num}&count=${count}${last_block_id ? `&last_block_id=${last_block_id}` : ''}`)
  ).json()
}

export const fetchAccHistory = async (username: string, count: number = 50, last_nonce?: number): Promise<L1Transaction[]> => {
  return await (await fetch(`${hafVscApi}/haf/user/${username}/history/${count}${last_nonce ? `/${last_nonce}` : ''}`)).json()
}

export const fetchL1AccInfo = async (username: string): Promise<AccInfo> => {
  return await (await fetch(`${hafVscApi}/haf/user/${username}`)).json()
}

export const fetchL1TxOutput = async (trx_id: string): Promise<(Block | Election | Contract | TxHeader | null)[]> => {
  return await (await fetch(`${hafVscApi}/tx/${trx_id}/output`)).json()
}

export const fetchL2Tx = async (trx_id: string): Promise<L2ContractCallTx> => {
  return await (await fetch(`${hafVscApi}/rpc/get_l2_tx?trx_id=${trx_id}`)).json()
}

export const getL2BalanceByL1User = async (l1_user: string): Promise<UserBalance> => {
  return await (await fetch(`${hafVscApi}/balance/${l1_user}`)).json()
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
      })
    })
  ).json()) as T
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
    `{ txns: findTransaction { tx_id anchr_height anchr_opidx anchr_ts required_auths status data } }`
  )
  return result.data
}

export const fetchL2TxnsBy = async (offset: number = 0, limit: number = 50, options?: object): Promise<{ txns: Txn[] }> => {
  const result = await gql<GqlResponse<{ txns: Txn[] }>>(
    `query AccHistory ($opts: TransactionFilter) { txns: findTransaction(filterOptions: $opts) { tx_id anchr_height anchr_opidx anchr_ts required_auths status data }}`,
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

export const fetchL2TxGql = async (trx_id: string): Promise<L2TxGql> => {
  return gql<L2TxGql>(
    `
  query L2Tx($trx_id: String!) {
    findTransaction(
      filterOptions: {byId: $trx_id}
    ) {
      txs {
        first_seen
        id
        src
        status
        sig_hash
        data {
          op
          contract_id
          action
          payload
        }
      }
    }
  }`,
    {
      trx_id
    }
  )
}
