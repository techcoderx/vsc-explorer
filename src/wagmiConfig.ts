import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

export const networks: [typeof mainnet, ...typeof mainnet[]] = [mainnet]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})
