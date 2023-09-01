import { Props, Block, Witness, L1Transaction, Contract, MultisigTxRef } from './types/HafApiResult'
import { hafVscApi, hiveApi } from './settings'

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

export const fetchAccHistory = async (username: string, count: number = 50, last_id: number|null = null): Promise<L1Transaction[]> => {
  const res = await fetch(`${hafVscApi}/rpc/get_op_history_by_l1_user?username=${username}&count=${count}${last_id?'&last_id='+last_id:''}`)
  const hist: L1Transaction[] = await res.json()
  return hist
}

interface HiveRPCResponse {
  id: number
  jsonrpc: string
  result: any
  error?: any
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