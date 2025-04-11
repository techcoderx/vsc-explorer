import {
  Props,
  Witness,
  L1Transaction,
  Contract,
  AccInfo,
  L2ContractCallTx,
  CIDSearchResult,
  Election,
  BridgeTx,
  L1ContractCallTx,
  ContractOutputTx,
  EventsOp,
  TxHistory,
  EventHistoryItm,
  UserBalance,
  Block,
  TxHeader
} from './types/HafApiResult'
import { hafVscApi, hiveApi, vscNodeApi } from './settings'
import { WitnessSchedule, Tx as L2TxGql } from './types/L2ApiResult'

export const fetchProps = async (): Promise<Props> => {
  return await (await fetch(`${hafVscApi}/props`)).json()
}

export const fetchBlocks = async (last_block_id: number, count = 50): Promise<Block[]> => {
  return await (await fetch(`${hafVscApi}/blocks?last_block_id=${last_block_id}&count=${count}`)).json()
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

// export const fetchBlockTxs = async (block_id: number): Promise<BlockTx[]> => {
//   return await (await fetch(`${hafVscApi}/rpc/get_txs_in_block?blk_id=${block_id}`)).json()
// }

export const fetchWitness = async (username: string): Promise<Witness> => {
  return await (await fetch(`${hafVscApi}/haf/user/${username}/witness`)).json()
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

export const fetchL2AccTxHistory = async (did: string, count: number = 100, last_nonce?: number): Promise<TxHistory[]> => {
  return await (
    await fetch(
      `${hafVscApi}/rpc/get_l2_tx_history_by_did?did=${did}&count=${count}${last_nonce ? `&last_nonce=${last_nonce}` : ''}`
    )
  ).json()
}

export const fetchL1AccInfo = async (username: string): Promise<AccInfo> => {
  return await (await fetch(`${hafVscApi}/haf/user/${username}`)).json()
}

export const fetchAccInfo = async (username: string): Promise<AccInfo> => {
  return await (await fetch(`${hafVscApi}/rpc/get_l2_user?did=${username}`)).json()
}

export const fetchTxByL1Id = async (trx_id: string): Promise<L1Transaction[]> => {
  return await (await fetch(`${hafVscApi}/haf/tx/${trx_id}`)).json()
}

export const fetchL1TxOutput = async (trx_id: string): Promise<(Block | Contract | TxHeader | null)[]> => {
  return await (await fetch(`${hafVscApi}/tx/${trx_id}/output`)).json()
}

export const fetchL2Tx = async (trx_id: string): Promise<L2ContractCallTx> => {
  return await (await fetch(`${hafVscApi}/rpc/get_l2_tx?trx_id=${trx_id}`)).json()
}

export const fetchContractOut = async (trx_id: string): Promise<ContractOutputTx> => {
  return await (await fetch(`${hafVscApi}/rpc/get_contract_output?cid=${trx_id}`)).json()
}

export const fetchCallsByContractId = async (
  contract_id: string,
  count: number = 100,
  last_id?: number
): Promise<(L1ContractCallTx | L2ContractCallTx)[]> => {
  return await (
    await fetch(
      `${hafVscApi}/rpc/list_contract_calls_by_contract_id?contract_id=${contract_id}&count=${count}${
        last_id ? `&last_id=${last_id}` : ''
      }`
    )
  ).json()
}

export const fetchEvents = async (cid: string): Promise<EventsOp> => {
  return await (await fetch(`${hafVscApi}/rpc/get_event?cid=${cid}`)).json()
}

export const fetchAccEventHistory = async (did: string, count: number = 100, last_nonce?: number): Promise<EventHistoryItm[]> => {
  return await (
    await fetch(
      `${hafVscApi}/rpc/get_event_history_by_account_name?account_name=${did}&count=${count}${
        last_nonce ? `&last_nonce=${last_nonce}` : ''
      }`
    )
  ).json()
}

export const fetchMsOwners = async (pubkeys: string[]): Promise<string[]> => {
  return await (await fetch(`${hafVscApi}/rpc/get_l1_accounts_by_pubkeys?pubkeys={"${pubkeys.join('","')}"}`)).json()
}

export const fetchLatestDeposits = async (last_id: number | null, count = 100): Promise<BridgeTx[]> => {
  return await (await fetch(`${hafVscApi}/rpc/list_latest_deposits?count=${count}${last_id ? '&last_id=' + last_id : ''}`)).json()
}

export const fetchLatestWithdrawals = async (last_id: number | null, count = 100): Promise<BridgeTx[]> => {
  return await (
    await fetch(`${hafVscApi}/rpc/list_latest_withdrawals?count=${count}${last_id ? '&last_id=' + last_id : ''}`)
  ).json()
}

export const fetchDepositsByAddr = async (address: string, count: number = 100, last_nonce?: number): Promise<BridgeTx[]> => {
  return await (
    await fetch(
      `${hafVscApi}/rpc/get_deposits_by_address?address=${address}&count=${count}${last_nonce ? '&last_nonce=' + last_nonce : ''}`
    )
  ).json()
}

export const fetchWithdrawReqsByAddr = async (address: string, count: number = 100, last_nonce?: number): Promise<BridgeTx[]> => {
  return await (
    await fetch(
      `${hafVscApi}/rpc/get_withdrawal_requests_by_address?address=${address}&count=${count}${
        last_nonce ? '&last_nonce=' + last_nonce : ''
      }`
    )
  ).json()
}

export const cidSearch = async (search_cid: string): Promise<CIDSearchResult> => {
  return await (await fetch(`${hafVscApi}/search/${search_cid}`)).json()
}

export const fetchL1Rest = async <T>(route: string): Promise<T> => {
  return await (await fetch(`${hiveApi}${route}`)).json()
}

const gql = async <T>(query: string, variables: { [key: string]: string } = {}) => {
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

export const getL2BalanceByL1User = async (l1_user: string): Promise<UserBalance> => {
  return await (await fetch(`${hafVscApi}/balance/${l1_user}`)).json()
}

export const getWitnessSchedule = async (height: number): Promise<WitnessSchedule> => {
  return gql<WitnessSchedule>(
    `
    query WitnessSchedule($height: Uint64!) {
      witnessSchedule(height: $height) {
        account
        bn
      }
    }
    `,
    {
      height: height.toString()
    }
  )
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
