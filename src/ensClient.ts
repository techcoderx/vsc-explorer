import { createPublicClient, http, type Address } from 'viem'
import { mainnet } from 'viem/chains'
import { ethRpcUrl } from './settings'

export const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(ethRpcUrl)
})

const ETH_DID_PREFIX = 'did:pkh:eip155:1:'

export const extractEthAddress = (val: string): Address | null => {
  const raw = val.startsWith(ETH_DID_PREFIX) ? val.slice(ETH_DID_PREFIX.length) : val
  return /^0x[a-fA-F0-9]{40}$/.test(raw) ? (raw as Address) : null
}
