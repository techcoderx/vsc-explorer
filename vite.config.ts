import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-wallet': ['@reown/appkit', '@reown/appkit-adapter-wagmi', '@reown/appkit/react', 'wagmi', 'viem'],
          'vendor-recharts': ['recharts'],
          'vendor-chakra': ['@chakra-ui/react', '@emotion/react'],
          'vendor-aioha': ['@aioha/aioha', '@aioha/magi']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true
  }
})
