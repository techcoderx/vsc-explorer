export type L2BlockCID = {
  findCID: {
    type: 'vsc-block',
    data: {
      __t: 'vsc-block'
      __v: '0.1'
      previous?: CIDObj,
      state_updates: Record<string, string>,
      txs: TransactionConfirmed[]
      timestamp: string
    }
  }
}

export interface TransactionConfirmed {
  op: TransactionTypes
  id: CIDObj
  type: TransactionDbType
}

export enum TransactionDbType {
  null,
  input,
  output,
  virtual,
  core,
}

type CIDObj = {
  '/': string
}

export enum TransactionTypes {
  call_contract = 'call_contract',
  contract_output = 'contract_output',
  update_contract = 'update_contract',
  transferFunds = 'transfer_funds'
}

export type JWSSignature = {
  protected: string
  signature: string
}

export type L2TxCID = {
  findCID: {
    type: 'vsc-tx',
    data: {
      __t: 'vsc-tx'
      __v: '0.1'
      lock_block: string
      tx: ContractInput | ContractOutput
    },
    payload: string
    signatures: JWSSignature[]
  }
}

// https://github.com/vsc-eco/vsc-node/blob/main/src/types/vscTransactions.ts
export interface CoreVSCTransaction {
  op: string
  type: TransactionDbType
}

export interface ContractInput extends CoreVSCTransaction {
  contract_id: string
  op: TransactionTypes.call_contract
  action: string
  payload: any
  salt?: string
}

export interface ContractUpdate extends CoreVSCTransaction {
  op: TransactionTypes.update_contract,
  // TBD
}

export interface ContractOutput extends CoreVSCTransaction {
  op: TransactionTypes.contract_output,
  contract_id: string,
  parent_tx_id?: string,
  inputs: Array<{
    id: string
  }>
  state_merkle: string
  //log: JsonPatchOp[]
  //Matrix of subdocuments --> individual logs
  log_matrix: Record<
    string,
    {
      log: JsonPatchOp[]
    }
  >
  chain_actions: any | null
}

export interface TransactionContractLogMatrix {
  log: JsonPatchOp[]
}

export interface JsonPatchOp {
  op: string
  path: string
  value: string | object | number
}