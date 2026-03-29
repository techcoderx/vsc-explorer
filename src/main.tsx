import React from 'react'
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { tabsSlotRecipe } from './styles/tabs.ts'
import { wagmiAdapter } from './wagmiConfig.ts'
import { Provider } from './components/ui/provider.tsx'
import { Toaster } from './components/ui/toaster.tsx'

const config = defineConfig({
  globalCss: {
    'html, body': {
      fontSize: '16px'
    },
    'tr, th, td, thead, tbody, table': {
      backgroundColor: 'transparent !important'
    },
    '.chakra-link': {
      color: 'inherit !important'
    }
  },
  theme: {
    tokens: {
      fontSizes: {
        xs: { value: '0.875rem' },
        sm: { value: '1rem' },
        md: { value: '1.125rem' },
        lg: { value: '1.25rem' },
        xl: { value: '1.375rem' },
        '2xl': { value: '1.5rem' },
        '3xl': { value: '1.875rem' },
        '4xl': { value: '2.25rem' },
        '5xl': { value: '3rem' },
        '6xl': { value: '3.75rem' }
      },
      sizes: {
        ss: { value: '22em' }
      }
    },
    semanticTokens: {
      colors: {
        pink: {
          solid: { value: '{colors.pink.400}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.pink.400}' }
        }
      }
    },
    slotRecipes: {
      tabs: tabsSlotRecipe
    }
  }
})

export const system = createSystem(defaultConfig, config)

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
