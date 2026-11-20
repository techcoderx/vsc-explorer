import { expect, describe, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router'
import { createSystem, defaultConfig } from '@chakra-ui/react'
import { Provider } from '../src/components/ui/provider'
import { themeConfig } from '../src/styles/theme'
import { Broadcast } from '../src/components/pages/tools/Broadcast'

// Mutable so the wallet-gating test can switch the connected wallet.
const state = vi.hoisted(() => ({ wallet: 'hive' }))
const mocks = vi.hoisted(() => ({
  customJSON: vi.fn(async () => ({ success: true, result: 'a'.repeat(40) })),
  errorToast: vi.fn(),
  successToast: vi.fn()
}))

// Keep the aioha/react-heavy imports out of jsdom; only the symbols the page
// touches are needed.
vi.mock('@aioha/aioha', () => ({
  KeyTypes: { Posting: 'posting', Active: 'active', Owner: 'owner', Memo: 'memo' },
  VscStakeType: { Consensus: 'consensus', HBD: 'hbd' }
}))

vi.mock('@aioha/magi', () => ({
  Asset: { hive: 'hive', hbd: 'hbd', shbd: 'hbd_savings' },
  Wallet: { Hive: 'hive', Ethereum: 'evm', Bitcoin: 'btc', ViewOnly: 'viewonly' }
}))

vi.mock('@aioha/providers/magi/react', () => ({
  useMagi: () => ({
    magi: { getUser: () => 'hive:alice' },
    user: 'hive:alice',
    wallet: state.wallet
  })
}))

vi.mock('@aioha/providers/react', () => ({
  useAioha: () => ({ aioha: { customJSON: mocks.customJSON } })
}))

vi.mock('../src/components/Aioha', () => ({
  AiohaModal: () => null,
  ConnectWalletButton: () => <button>connect</button>
}))

vi.mock('../src/components/ui/toaster', () => ({
  toaster: { error: mocks.errorToast, success: mocks.successToast }
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts?.ns ? `${opts.ns}:${key}` : key)
  })
}))

vi.mock('../src/i18n', () => ({ default: { t: (key: string) => key } }))

vi.mock('../src/components/PageTitle', () => ({ PageTitle: () => null }))

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

const renderBroadcast = () =>
  render(
    <HelmetProvider>
      <Provider system={createSystem(defaultConfig, themeConfig)} defaultTheme="dark">
        <MemoryRouter>
          <Broadcast />
        </MemoryRouter>
      </Provider>
    </HelmetProvider>
  )

const selectType = (value: string) => {
  // First combobox is the transaction type, the second (L2 only) is the asset.
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value } })
}

const submit = () => fireEvent.click(screen.getByRole('button', { name: /common:submit/ }))

describe('Broadcast custom_json ops', () => {
  beforeEach(() => {
    state.wallet = 'hive'
    mocks.customJSON.mockClear()
    mocks.errorToast.mockClear()
    mocks.successToast.mockClear()
  })

  it('shows only the proposal ID field and broadcasts a reserve vote', async () => {
    renderBroadcast()
    selectType('vsc.reserve_vote')

    expect(screen.getByText('broadcast.fields.proposalId')).toBeInTheDocument()
    expect(screen.queryByText('broadcast.destAddress')).toBeNull()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'reserve_payout:abc123' } })
    submit()

    await waitFor(() =>
      expect(mocks.customJSON).toHaveBeenCalledWith(
        'active',
        'vsc.reserve_vote',
        JSON.stringify({ id: 'reserve_payout:abc123' })
      )
    )
    expect(mocks.successToast).toHaveBeenCalled()
  })

  it('converts the reserve payout amount from HIVE to milli-HIVE base units', async () => {
    renderBroadcast()
    selectType('vsc.reserve_payout')

    const textboxes = screen.getAllByRole('textbox')
    expect(textboxes).toHaveLength(2) // recipient + reason, amount is a number input
    fireEvent.change(textboxes[0], { target: { value: 'bob' } })
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '123' } })
    fireEvent.change(textboxes[1], { target: { value: 'stolen funds' } })
    submit()

    await waitFor(() =>
      expect(mocks.customJSON).toHaveBeenCalledWith(
        'active',
        'vsc.reserve_payout',
        JSON.stringify({ recipient: 'bob', amount: 123000, reason: 'stolen funds' })
      )
    )
  })

  it('injects the configured net ID into admit votes instead of asking for it', async () => {
    renderBroadcast()
    selectType('vsc.admit_vote')

    expect(screen.getByText('broadcast.fields.uboId')).toBeInTheDocument()
    expect(screen.queryByText('broadcast.fields.netId')).toBeNull()

    const textboxes = screen.getAllByRole('textbox') // candidate + UBO ID, no net ID input
    expect(textboxes).toHaveLength(2)
    fireEvent.change(textboxes[0], { target: { value: 'alice' } })
    fireEvent.change(textboxes[1], { target: { value: 'ubo-1' } })
    submit()

    await waitFor(() =>
      expect(mocks.customJSON).toHaveBeenCalledWith(
        'active',
        'vsc.admit_vote',
        JSON.stringify({ net_id: 'vsc-mainnet', candidate: 'alice', ubo_id: 'ubo-1' })
      )
    )
  })

  it('rejects governance ops from non-Hive wallets before signing', () => {
    state.wallet = 'evm'
    renderBroadcast()
    selectType('vsc.slash_restore')

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'a'.repeat(40) } })
    fireEvent.change(textboxes[1], { target: { value: 'alice' } })
    submit()

    expect(mocks.customJSON).not.toHaveBeenCalled()
    expect(mocks.errorToast).toHaveBeenCalledWith({ title: 'broadcast.errors.customJsonHiveWalletOnly' })
  })

  it('proposes a consensus version, omitting the optional activation epoch', async () => {
    renderBroadcast()
    selectType('vsc.propose_consensus_version')

    // net_id is prefilled, non_consensus defaults to 0, activation_epoch is optional.
    const [major, consensus] = screen.getAllByRole('spinbutton')
    fireEvent.change(major, { target: { value: '0' } })
    fireEvent.change(consensus, { target: { value: '3' } })
    submit()

    await waitFor(() =>
      expect(mocks.customJSON).toHaveBeenCalledWith(
        'active',
        'vsc.propose_consensus_version',
        JSON.stringify({ net_id: 'vsc-mainnet', major: 0, consensus: 3, non_consensus: 0 })
      )
    )
  })

  it('rejects non-integer consensus version components', () => {
    renderBroadcast()
    selectType('vsc.propose_consensus_version')

    const [major, consensus] = screen.getAllByRole('spinbutton')
    fireEvent.change(major, { target: { value: '1.5' } })
    fireEvent.change(consensus, { target: { value: '3' } })
    submit()

    expect(mocks.customJSON).not.toHaveBeenCalled()
    expect(mocks.errorToast).toHaveBeenCalledWith({ title: 'broadcast.errors.integerRequired' })
  })
})

describe('Broadcast asset restrictions', () => {
  beforeEach(() => {
    state.wallet = 'hive'
    mocks.customJSON.mockClear()
    mocks.errorToast.mockClear()
    mocks.successToast.mockClear()
  })

  const assetOption = (value: string) =>
    Array.from((screen.getAllByRole('combobox')[1] as HTMLSelectElement).options).find((o) => o.value === value)!
  const assetSelect = () => screen.getAllByRole('combobox')[1] as HTMLSelectElement

  it.each([
    ['consensus_stake', 'hive'],
    ['consensus_unstake', 'hive'],
    ['stake_hbd', 'hbd'],
    ['unstake_hbd', 'hbd']
  ])('only allows the required asset for %s', (txType, required) => {
    renderBroadcast()
    selectType(txType)

    expect(assetSelect().value).toBe(required)
    expect(assetOption('hbd_savings').disabled).toBe(true)
    for (const other of ['hive', 'hbd']) {
      expect(assetOption(other).disabled).toBe(other !== required)
    }
  })

  it('disables the savings option for map because it is an L1 HIVE/HBD transfer', () => {
    renderBroadcast()
    selectType('deposit')

    expect(assetOption('hbd_savings').disabled).toBe(true)
    expect(assetOption('hive').disabled).toBe(false)
    expect(assetOption('hbd').disabled).toBe(false)
  })

  it('leaves every asset selectable for transfer and unmap', () => {
    renderBroadcast()
    for (const txType of ['transfer', 'withdraw']) {
      selectType(txType)
      expect(assetOption('hive').disabled).toBe(false)
      expect(assetOption('hbd').disabled).toBe(false)
      expect(assetOption('hbd_savings').disabled).toBe(false)
    }
  })
})
