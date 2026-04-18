import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'node:fs'
import path from 'node:path'

const disableSitemapForTestnet = (): Plugin => ({
  name: 'disable-sitemap-testnet',
  apply: 'build',
  closeBundle() {
    if (process.env.VITE_NETWORK !== 'testnet') return
    const distDir = path.resolve(__dirname, 'dist')
    const sitemap = path.join(distDir, 'sitemap.xml')
    if (fs.existsSync(sitemap)) fs.unlinkSync(sitemap)
    fs.writeFileSync(path.join(distDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true
      }
    }),
    disableSitemapForTestnet()
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
