import {
  Props,
  Witness,
  L1Transaction,
  Contract,
  AnchorRefs,
  L1Acc,
  BlockRangeItm,
  BlockDetail,
  BlockTx,
  L2Tx,
  CIDSearchResult,
  Election,
  Epoch,
  BlockInEpoch,
  AnchorRef,
  ContractWifProof,
  HiveBridgeTx,
  L1Tx,
  WeightedMembers,
  ContractOutputTx,
  EventsOp
} from './types/HafApiResult'
import { HiveRPCResponse } from './types/L1ApiResult'
import { hafVscApi, hiveApi, vscNodeApi } from './settings'
import { AccountBalance } from './types/L2ApiResult'

export const fetchProps = async (): Promise<Props> => {
  const getVSCProps = await fetch(hafVscApi)
  const vscProps: Props = await getVSCProps.json()
  return vscProps
}

export const fetchBlocks = async (start: number, count = 50): Promise<BlockRangeItm[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_block_range?blk_id_start=${start}&blk_count=${count}`)
  const blocks: BlockRangeItm[] = await res.json()
  return blocks
}

export const fetchWitnesses = async (startId: number, count = 50): Promise<Witness[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_witnesses_by_id?id_start=${startId}&count=${count}`)
  const blocks: Witness[] = await res.json()
  return blocks
}

export const fetchMembersAtBlock = async (block_num: number): Promise<WeightedMembers[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_members_at_block?blk_num=${block_num}`)
  const members: WeightedMembers[] = await res.json()
  return members
}

export const fetchLatestTxs = async (): Promise<L1Transaction[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_latest_ops?with_payload=true`)
  const txs: L1Transaction[] = await res.json()
  return txs
}

export const fetchLatestContracts = async (): Promise<Contract[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_latest_contracts`)
  const contracts: Contract[] = await res.json()
  return contracts
}

export const fetchContractByID = async (contract_id: string): Promise<ContractWifProof> => {
  const res = await fetch(`${hafVscApi}/rpc/get_contract_by_id?id=${contract_id}`)
  const contract: ContractWifProof = await res.json()
  return contract
}

export const fetchAnchorRefs = async (last_id: number, count: number = 100): Promise<AnchorRefs[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_anchor_refs?last_ref=${last_id}&count=${count}`)
  const refs: AnchorRefs[] = await res.json()
  return refs
}

export const fetchAnchorRefByID = async (id: number): Promise<AnchorRef> => {
  const res = await fetch(`${hafVscApi}/rpc/get_anchor_ref_by_id?id=${id}`)
  const ref: AnchorRef = await res.json()
  return ref
}

export const fetchAnchorRefByCID = async (cid: string): Promise<AnchorRef> => {
  const res = await fetch(`${hafVscApi}/rpc/get_anchor_ref_by_cid?cid=${cid}`)
  const ref: AnchorRef = await res.json()
  return ref
}

export const fetchBlock = async (block_id: number): Promise<BlockDetail> => {
  const res = await fetch(`${hafVscApi}/rpc/get_block_by_id?blk_id=${block_id}`)
  const blk: BlockDetail = await res.json()
  return blk
}

export const fetchBlockByHash = async (block_hash: string): Promise<BlockDetail> => {
  const res = await fetch(`${hafVscApi}/rpc/get_block_by_hash?blk_hash=${block_hash}`)
  const blk: BlockDetail = await res.json()
  return blk
}

export const fetchBlockTxs = async (block_id: number): Promise<BlockTx[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_txs_in_block?blk_id=${block_id}`)
  const blk: BlockTx[] = await res.json()
  return blk
}

export const fetchWitness = async (username: string): Promise<Witness> => {
  const res = await fetch(`${hafVscApi}/rpc/get_witness?username=${username}`)
  const wit: Witness = await res.json()
  return wit
}

export const fetchElections = async (last_epoch: number, count: number = 100): Promise<Election[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_epochs?last_epoch=${last_epoch}&count=${count}`)
  const epochs: Election[] = await res.json()
  return epochs
}

export const fetchEpoch = async (epoch_num: number): Promise<Epoch> => {
  const res = await fetch(`${hafVscApi}/rpc/get_epoch?epoch_num=${epoch_num}`)
  const epoch: Epoch = await res.json()
  return epoch
}

export const fetchBlocksInEpoch = async (
  epoch_num: number,
  start_block_id: number = 0,
  count: number = 200
): Promise<BlockInEpoch[]> => {
  const res = await fetch(
    `${hafVscApi}/rpc/get_l2_blocks_in_epoch?epoch_num=${epoch_num}&start_id=${start_block_id}&count=${count}`
  )
  const blocks: BlockInEpoch[] = await res.json()
  return blocks
}

export const fetchAccHistory = async (
  username: string,
  count: number = 50,
  last_nonce: number | null = null
): Promise<L1Transaction[]> => {
  const res = await fetch(
    `${hafVscApi}/rpc/get_op_history_by_l1_user?username=${username}&count=${count}${
      last_nonce ? '&last_nonce=' + last_nonce : ''
    }`
  )
  const hist: L1Transaction[] = await res.json()
  return hist
}

export const fetchAccInfo = async (username: string): Promise<L1Acc> => {
  const res = await fetch(`${hafVscApi}/rpc/get_l1_user?username=${username}`)
  const acc: L1Acc = await res.json()
  return acc
}

export const fetchTxByL1Id = async (trx_id: string): Promise<L1Transaction[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_ops_by_l1_tx?trx_id=${trx_id}`)
  const trx: L1Transaction[] = await res.json()
  return trx
}

export const fetchL1TxOutput = async (trx_id: string): Promise<(L1Tx | Election | BlockDetail | null)[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_l1_tx_all_outputs?trx_id=${trx_id}`)
  const trx: (L1Tx | Election | BlockDetail | null)[] = await res.json()
  return trx
}

export const fetchL2Tx = async (trx_id: string): Promise<L2Tx> => {
  const res = await fetch(`${hafVscApi}/rpc/get_l2_tx?trx_id=${trx_id}`)
  const trx: L2Tx = await res.json()
  return trx
}

export const fetchL1ContractCall = async (trx_id: string, op_pos: number): Promise<L1Tx> => {
  const res = await fetch(`${hafVscApi}/rpc/get_l1_contract_call?trx_id=${trx_id}&op_pos=${op_pos}`)
  const trx: L1Tx = await res.json()
  return trx
}

export const fetchContractOut = async (trx_id: string): Promise<ContractOutputTx> => {
  const res = await fetch(`${hafVscApi}/rpc/get_contract_output?cid=${trx_id}`)
  const trx: ContractOutputTx = await res.json()
  return trx
}

export const fetchEvents = async (cid: string): Promise<EventsOp> => {
  const res = await fetch(`${hafVscApi}/rpc/get_event?cid=${cid}`)
  const trx: EventsOp = await res.json()
  return trx
}

export const fetchMsOwners = async (pubkeys: string[]): Promise<string[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_l1_accounts_by_pubkeys?pubkeys={"${pubkeys.join('","')}"}`)
  const trx: string[] = await res.json()
  return trx
}

export const fetchLatestDepositsHive = async (last_id: number | null, count = 100): Promise<HiveBridgeTx[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_latest_deposits_hive?count=${count}${last_id ? '&last_id=' + last_id : ''}`)
  const bridgeOps: HiveBridgeTx[] = await res.json()
  return bridgeOps
}

export const fetchLatestWithdrawalsHive = async (last_id: number | null, count = 100): Promise<HiveBridgeTx[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_latest_withdrawals?count=${count}${last_id ? '&last_id=' + last_id : ''}`)
  const bridgeOps: HiveBridgeTx[] = await res.json()
  return bridgeOps
}

export const cidSearch = async (search_cid: string): Promise<CIDSearchResult> => {
  const res = await fetch(`${hafVscApi}/rpc/search_by_cid?cid=${search_cid}`)
  const trx: CIDSearchResult = await res.json()
  return trx
}

export const fetchL1 = async <T>(method: string, params: object): Promise<HiveRPCResponse<T>> => {
  const res = await fetch(`${hiveApi}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: method,
      params: params
    })
  })
  const result = await res.json()
  return result
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
