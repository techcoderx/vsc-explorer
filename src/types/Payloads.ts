export type DIDPayload = {
  did: string
}

export type BlockPayload = {
  block_hash: string
}

export type NewContractPayload = {
  manifest_id: string
  name: string // pla: obsolete as its already contained in the manifest, correct?
  code: string
}

export type ContractCommitmentPayload = {
  contract_id: string
  node_identity: string
}

export type NodeAnnouncePayload = {
  did: string
  witnessEnabled: boolean
}

export type MultisigTxRefPayload = {
  ref_id: string
}