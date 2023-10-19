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
    payload?: string
    signatures?: JWSSignature[]
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