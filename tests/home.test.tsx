import { expect, describe, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router'
import { createSystem, defaultConfig } from '@chakra-ui/react'
import { Provider } from '../src/components/ui/provider'
import { themeConfig } from '../src/styles/theme'
import Home from '../src/components/pages/Home'

// Mutable so a test can simulate the stake tally being unavailable; the module
// mock factory below is hoisted and cannot close over a plain top-level binding.
const state = vi.hoisted(() => ({ stake: 130075627 as number | undefined }))

// Only the strings the epoch card renders need real templates.
const strings: Record<string, string> = {
  'epoch.epoch': 'Epoch {{num}}',
  'epoch.totalStake': '{{amount}} total stake',
  'epoch.nextEpochIn': 'Next epoch in ~{{countdown}}'
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const template = strings[key] ?? key
      return template.replace(/{{(\w+)}}/g, (_match, name: string) => String(opts?.[name] ?? ''))
    }
  })
}))

vi.mock('../src/i18n', () => ({ default: { t: (key: string) => key } }))

vi.mock('../src/components/SearchBar', () => ({ default: () => <div>search</div> }))

vi.mock('recharts', () => {
  const Null = () => null
  return { AreaChart: Null, Area: Null, ResponsiveContainer: Null, CartesianGrid: Null, XAxis: Null, YAxis: Null, Tooltip: Null }
})

// Epoch 2280 of a PoA network: 16 seats at flat weight 1, but 130,075.627 HIVE
// of consensus bonds behind them.
vi.mock('../src/requests', () => ({
  fetchProps: vi.fn(async () => ({
    epoch: 2280,
    l2_block_height: 1,
    transactions: 1,
    last_processed_block: 2,
    witnesses: 16,
    contracts: 1
  })),
  fetchBlocks: vi.fn(async () => []),
  fetchL2TxnsBy: vi.fn(async () => ({ txns: [] })),
  fetchEpoch: vi.fn(async () => ({
    epoch: 2280,
    block_height: 100,
    total_weight: 16,
    members: [
      { account: 'alice', key: 'k1' },
      { account: 'hive:bob', key: 'k2' }
    ]
  })),
  useNetworkStats: () => [],
  useContracts: () => ({ contracts: [], isLoading: false }),
  useWitnessesConsensusStake: vi.fn(() => ({ data: state.stake, isLoading: state.stake === undefined }))
}))

// Chakra's colour mode provider reads matchMedia, which jsdom does not implement.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false
}))

const renderHome = () =>
  render(
    <HelmetProvider>
      <Provider system={createSystem(defaultConfig, themeConfig)} defaultTheme="dark">
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  )

describe('Home epoch card', () => {
  it('shows the tallied consensus stake of the current witnesses', async () => {
    state.stake = 130075627
    renderHome()
    await waitFor(() => expect(screen.getByText('130,075.627 HIVE total stake')).toBeInTheDocument())
    expect(screen.getByText('Epoch 2280')).toBeInTheDocument()
  })

  it('omits the stake segment rather than falling back to the seat weight', async () => {
    state.stake = undefined
    renderHome()
    await waitFor(() => expect(screen.getByText('Epoch 2280')).toBeInTheDocument())
    expect(screen.queryByText(/total stake/)).toBeNull()
    expect(screen.getByText(/Next epoch in/)).toBeInTheDocument()
  })
})
