import React from 'react'
import { extendTheme } from '@chakra-ui/react/extend-theme'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { tabStyles } from './styles/tabs.ts'

const theme = extendTheme({
  components: {
    Tabs: tabStyles
  },
  sizes: {
    ss: '22em'
  },
  config: {
    useSystemColorMode: true,
    initialColorMode: 'dark'
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme} toastOptions={{ defaultOptions: { position: 'bottom-right', isClosable: true } }}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>
)
