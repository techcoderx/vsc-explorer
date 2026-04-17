import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { mainnet, bitcoin } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

export const networks: [typeof mainnet, ...(typeof mainnet | typeof bitcoin)[]] = [mainnet, bitcoin]

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId
})

export const bitcoinAdapter = new BitcoinAdapter({
  projectId
})
