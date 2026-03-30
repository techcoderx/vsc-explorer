import React from 'react'
import { createSystem, defaultConfig } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { wagmiAdapter } from './wagmiConfig.ts'
import { Provider } from './components/ui/provider.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { themeConfig } from './styles/theme.ts'

export const system = createSystem(defaultConfig, themeConfig)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider system={system} defaultTheme="dark" enableSystem>
      <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount={false}>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster />
        </QueryClientProvider>
      </WagmiProvider>
    </Provider>
  </React.StrictMode>
)
