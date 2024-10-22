import {
  Props,
  Witness,
  L1Transaction,
  Contract,
  AnchorRefs,
  AccInfo,
  BlockRangeItm,
  BlockDetail,
  BlockTx,
  L2ContractCallTx,
  CIDSearchResult,
  Election,
  Epoch,
  BlockInEpoch,
  AnchorRef,
  ContractWifProof,
  HiveBridgeTx,
  L1ContractCallTx,
  TransferWithdrawOutput,
  WeightedMembers,
  ContractOutputTx,
  EventsOp,
  ContractCreatedOutput,
  ContractCallOutput,
  TxHistory,
  EventHistoryItm
} from './types/HafApiResult'
import { hafVscApi, hiveApi, vscNodeApi } from './settings'
import { AccountBalance, WitnessSchedule, Tx as L2TxGql } from './types/L2ApiResult'

export const fetchProps = async (): Promise<Props> => {
  return await (await fetch(hafVscApi)).json()
}

export const fetchBlocks = async (start: number, count = 50): Promise<BlockRangeItm[]> => {
  return await (await fetch(`${hafVscApi}/rpc/get_block_range?blk_id_start=${start}&blk_count=${count}`)).json()
}

export const fetchWitnesses = async (startId: number, count = 50): Promise<Witness[]> => {
  return await (await fetch(`${hafVscApi}/rpc/list_witnesses_by_id?id_start=${startId}&count=${count}`)).json()
}

export const fetchMembersAtBlock = async (block_num: number): Promise<WeightedMembers[]> => {
  return await (await fetch(`${hafVscApi}/rpc/get_members_at_block?blk_num=${block_num}`)).json()
}

export const fetchLatestTxs = async (): Promise<L1Transaction[]> => {
  return await (await fetch(`${hafVscApi}/rpc/list_latest_ops?with_payload=true`)).json()
}

export const fetchLatestContracts = async (): Promise<Contract[]> => {
  return await (await fetch(`${hafVscApi}/rpc/list_latest_contracts`)).json()
}

export const fetchContractByID = async (contract_id: string): Promise<ContractWifProof> => {
  return await (await fetch(`${hafVscApi}/rpc/get_contract_by_id?id=${contract_id}`)).json()
}

export const fetchAnchorRefs = async (last_id: number, count: number = 100): Promise<AnchorRefs[]> => {
  return await (await fetch(`${hafVscApi}/rpc/list_anchor_refs?last_ref=${last_id}&count=${count}`)).json()
}

export const fetchAnchorRefByID = async (id: number): Promise<AnchorRef> => {
  return await (await fetch(`${hafVscApi}/rpc/get_anchor_ref_by_id?id=${id}`)).json()
}

export const fetchAnchorRefByCID = async (cid: string): Promise<AnchorRef> => {
  return await (await fetch(`${hafVscApi}/rpc/get_anchor_ref_by_cid?cid=${cid}`)).json()
}

export const fetchBlock = async (block_id: number): Promise<BlockDetail> => {
  return await (await fetch(`${hafVscApi}/rpc/get_block_by_id?blk_id=${block_id}`)).json()
}

export const fetchBlockByHash = async (block_hash: string): Promise<BlockDetail> => {
  return await (await fetch(`${hafVscApi}/rpc/get_block_by_hash?blk_hash=${block_hash}`)).json()
}

export const fetchBlockTxs = async (block_id: number): Promise<BlockTx[]> => {
  return await (await fetch(`${hafVscApi}/rpc/get_txs_in_block?blk_id=${block_id}`)).json()
}

export const fetchWitness = async (username: string): Promise<Witness> => {
  return await (await fetch(`${hafVscApi}/rpc/get_witness?username=${username}`)).json()
}

export const fetchElections = async (last_epoch: number, count: number = 100): Promise<Election[]> => {
  return await (await fetch(`${hafVscApi}/rpc/list_epochs?last_epoch=${last_epoch}&count=${count}`)).json()
}

export const fetchEpoch = async (epoch_num: number): Promise<Epoch> => {
  return await (await fetch(`${hafVscApi}/rpc/get_epoch?epoch_num=${epoch_num}`)).json()
}

export const fetchBlocksInEpoch = async (
  epoch_num: number,
  start_block_id: number = 0,
  count: number = 200
): Promise<BlockInEpoch[]> => {
  return await (
    await fetch(`${hafVscApi}/rpc/get_l2_blocks_in_epoch?epoch_num=${epoch_num}&start_id=${start_block_id}&count=${count}`)
  ).json()
}

export const fetchAccHistory = async (username: string, count: number = 50, last_nonce?: number): Promise<L1Transaction[]> => {
  return await (
    await fetch(
      `${hafVscApi}/rpc/get_op_history_by_l1_user?username=${username}&count=${count}${
        last_nonce ? '&last_nonce=' + last_nonce : ''
      }`
    )
  ).json()
}

export const fetchL2AccTxHistory = async (did: string, count: number = 100, last_nonce?: number): Promise<TxHistory[]> => {
  return await (
    await fetch(
      `${hafVscApi}/rpc/get_l2_tx_history_by_did?did=${did}&count=${count}${last_nonce ? `&last_nonce=${last_nonce}` : ''}`
    )
  ).json()
}

export const fetchAccInfo = async (username: string): Promise<AccInfo> => {
  return await (await fetch(`${hafVscApi}/rpc/get_l2_user?did=${username}`)).json()
}

export const fetchTxByL1Id = async (trx_id: string): Promise<L1Transaction[]> => {
  return await (await fetch(`${hafVscApi}/rpc/get_ops_by_l1_tx?trx_id=${trx_id}`)).json()
}

export const fetchL1TxOutput = async (
  trx_id: string
): Promise<(ContractCallOutput | TransferWithdrawOutput | Election | BlockDetail | ContractCreatedOutput | null)[]> => {
  return await (await fetch(`${hafVscApi}/rpc/get_l1_tx_all_outputs?trx_id=${trx_id}`)).json()
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

export const fetchLatestDepositsHive = async (last_id: number | null, count = 100): Promise<HiveBridgeTx[]> => {
  return await (
    await fetch(`${hafVscApi}/rpc/list_latest_deposits_hive?count=${count}${last_id ? '&last_id=' + last_id : ''}`)
  ).json()
}

export const fetchLatestWithdrawalsHive = async (last_id: number | null, count = 100): Promise<HiveBridgeTx[]> => {
  return await (
    await fetch(`${hafVscApi}/rpc/list_latest_withdrawals?count=${count}${last_id ? '&last_id=' + last_id : ''}`)
  ).json()
}

export const cidSearch = async (search_cid: string): Promise<CIDSearchResult> => {
  return await (await fetch(`${hafVscApi}/rpc/search_by_cid?cid=${search_cid}`)).json()
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

export const getL2BalanceByL1User = async (l1_user: string): Promise<AccountBalance> => {
  return gql<AccountBalance>(
    `
  query getAccountBalance($account: String!) {
    getAccountBalance(account: $account) {
      account
      block_height
      tokens {
        HBD
        HIVE
      }
    }
  }
  `,
    {
      account: l1_user
    }
  )
}

export const getWitnessSchedule = async (): Promise<WitnessSchedule> => {
  return gql<WitnessSchedule>(
    `
    query GetWitnessSchedule {
      witnessSchedule
    }
    `
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
