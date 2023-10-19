import { useQuery } from '@tanstack/react-query'
import { request as gqlRequest, gql } from 'graphql-request'
import { Props, Block, Witness, L1Transaction, Contract, MultisigTxRef, L1Acc } from './types/HafApiResult'
import { L1Account, L1Dgp } from './types/L1ApiResult'
import { hafVscApi, hiveApi, vscNodeApi } from './settings'
import { L2BlockCID, L2TxCID } from './types/L2ApiResult'

export const fetchProps = async (): Promise<Props> => {
  const getVSCProps = await fetch(hafVscApi)
  const vscProps: Props = await getVSCProps.json()
  return vscProps
}

export const fetchBlocks = async (start: number, count = 50): Promise<Block[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_block_range?blk_id_start=${start}&blk_count=${count}`)
  const blocks: Block[] = await res.json()
  return blocks
}

export const fetchWitnesses = async (startId: number, count = 50): Promise<Witness[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_witnesses_by_id?id_start=${startId}&count=${count}`)
  const blocks: Witness[] = await res.json()
  return blocks
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

export const fetchMultisigTxRefs = async (last_id: number, count: number = 100): Promise<MultisigTxRef[]> => {
  const res = await fetch(`${hafVscApi}/rpc/list_txrefs?last_id=${last_id}&count=${count}`)
  const refs: MultisigTxRef[] = await res.json()
  return refs
}

export const fetchBlock = async (block_id: number): Promise<Block> => {
  const res = await fetch(`${hafVscApi}/rpc/get_block_by_id?blk_id=${block_id}`)
  const blk: Block = await res.json()
  return blk
}

export const fetchWitness = async (username: string): Promise<Witness> => {
  const res = await fetch(`${hafVscApi}/rpc/get_witness?username=${username}`)
  const wit: Witness = await res.json()
  return wit
}

export const fetchAccHistory = async (username: string, count: number = 50, last_nonce: number|null = null): Promise<L1Transaction[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_op_history_by_l1_user?username=${username}&count=${count}${last_nonce?'&last_nonce='+last_nonce:''}`)
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

interface HiveRPCResponse {
  id: number
  jsonrpc: string
  result: L1Account[] | L1Dgp
  error?: HiveRPCError
}

interface HiveRPCError {
  code: number
  message: string
  data?: string
}

export const fetchL1 = async (method: string, params: object): Promise<HiveRPCResponse> => {
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

export const useFindCID = (id?: string, includeData: boolean = true, includeSignatures: boolean = false, enabled: boolean = false) => {
  const query = gql`
  {
    findCID(id: "${id}") {
      type,
      ${includeData ? 'data,' : ''}
      ${includeSignatures ? 'payload,\nsignatures' : ''}
    }
  }
  `
  const usedQuery = useQuery({
    cacheTime: Infinity,
    queryKey: ['find-cid', id],
    queryFn: (): Promise<L2BlockCID|L2TxCID> => gqlRequest(vscNodeApi, query),
    enabled: enabled
  })
  return usedQuery
}