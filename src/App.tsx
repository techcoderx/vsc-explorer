import { ReactNode, useEffect, useMemo } from 'react'
import { Aioha } from '@aioha/aioha'
import { Magi, BtcClient } from '@aioha/magi'
import { AiohaProvider } from '@aioha/providers/react'
import { MagiProvider } from '@aioha/providers/magi/react'
import { createAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Navbar from './components/Navbar'
import { getConf } from './settings'
import { wagmiAdapter, bitcoinAdapter, networks } from './wagmiConfig'
import Home from './components/pages/Home'
import Witnesses from './components/pages/Witnesses'
import Blocks from './components/pages/Blocks'
import { NewTxs, NewHiveTxs, NewVscTxs } from './components/pages/NewTxs'
import NewContracts from './components/pages/NewContracts'
import PageNotFound from './components/pages/404'
import { BlockBy } from './components/pages/Block'
import L1User from './components/pages/L1User'
import { Tx } from './components/pages/L1Tx'
import Elections from './components/pages/Elections'
import Epoch from './components/pages/Epoch'
import { Contract } from './components/pages/Contract'
import HiveBridgeOverview from './components/pages/bridge/Overview'
import { HiveBridgeLatestTxs } from './components/pages/bridge/HiveLatestTxs'
import WitnessSchedule from './components/pages/Schedule'
import { Address, AddressTxs } from './components/pages/address/Address'
import { AddressDeposits, AddressLedgers } from './components/pages/address/LedgerTxs'
import { AddressActions, AddressWithdrawals } from './components/pages/address/LedgerActions'
import { VerifyContract } from './components/pages/tools/VerifyContract'
import { DagInspector } from './components/pages/tools/DagInspector'
import { AddressWitness } from './components/pages/address/Witness'
import { AddressL1Ops } from './components/pages/address/L1Ops'
import { AddressBalances } from './components/pages/address/AddressBalances'
import { AddressNftHoldings } from './components/pages/address/NftHoldings'
import TokenList from './components/pages/tokens/TokenList'
import TokenDetail, { TokenInfoTab, TokenTransfersTab, TokenHoldersTab } from './components/pages/tokens/TokenDetail'
import NftList from './components/pages/nfts/NftList'
import NftDetail, { NftInfoTab, NftTokensTab, NftTransfersTab } from './components/pages/nfts/NftDetail'
import BtcMapping from './components/pages/btc/BtcMapping'
import { ChartsDirectory } from './components/pages/charts/Directory'
import { BridgeCharts } from './components/pages/charts/Bridge'
import { BlocksCharts } from './components/pages/charts/Blocks'
import { TxCharts } from './components/pages/charts/Transactions'
import { AddressCharts } from './components/pages/charts/Addresses'
import { ContractsCharts } from './components/pages/charts/Contracts'
import { WitnessCharts } from './components/pages/charts/Witnesses'
import { Broadcast } from './components/pages/tools/Broadcast'
import StakingOverview from './components/pages/staking/Overview'
import { StakingClaims, ClaimDetail } from './components/pages/staking/Claims'
import Settings from './components/pages/Settings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navbar />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/address/:addr',
        element: <Address />,
        children: [
          {
            path: '/address/:addr',
            element: <AddressTxs />
          },
          {
            path: '/address/:addr/txs/:page?',
            element: <AddressTxs />
          },
          {
            path: '/address/:addr/hiveops/:page?',
            element: <AddressL1Ops />
          },
          {
            path: '/address/:addr/ledger/:page?',
            element: <AddressLedgers />
          },
          {
            path: '/address/:addr/actions/:page?',
            element: <AddressActions />
          },
          {
            path: '/address/:addr/deposits/:page?',
            element: <AddressDeposits />
          },
          {
            path: '/address/:addr/withdrawals/:page?',
            element: <AddressWithdrawals />
          },
          {
            path: '/address/:addr/witness',
            element: <AddressWitness />
          },
          {
            path: '/address/:addr/balances',
            element: <AddressBalances />
          },
          {
            path: '/address/:addr/nfts/:page?',
            element: <AddressNftHoldings />
          }
        ]
      },
      {
        path: '/witnesses',
        element: <Witnesses />
      },
      {
        path: '/schedule',
        element: <WitnessSchedule />
      },
      {
        path: '/elections/:page?',
        element: <Elections />
      },
      {
        path: '/epoch/:epochNum/:page?',
        element: <Epoch />
      },
      {
        path: '/blocks/:page?',
        element: <Blocks />
      },
      {
        path: '/block/:blockId',
        element: <BlockBy />
      },
      {
        path: '/transactions',
        element: <NewTxs />,
        children: [
          {
            path: '/transactions',
            element: <NewVscTxs />
          },
          {
            path: '/transactions/magi/:page?',
            element: <NewVscTxs />
          },
          {
            path: '/transactions/hive',
            element: <NewHiveTxs />
          }
        ]
      },
      {
        path: '/contracts',
        element: <NewContracts />
      },
      {
        path: '/tokens',
        element: <TokenList />
      },
      {
        path: '/token/:contractId',
        element: <TokenDetail />,
        children: [
          {
            path: '/token/:contractId',
            element: <TokenTransfersTab />
          },
          {
            path: '/token/:contractId/transfers/:page?',
            element: <TokenTransfersTab />
          },
          {
            path: '/token/:contractId/holders/:page?',
            element: <TokenHoldersTab />
          },
          {
            path: '/token/:contractId/info',
            element: <TokenInfoTab />
          }
        ]
      },
      {
        path: '/nfts',
        element: <NftList />
      },
      {
        path: '/nft/:contractId',
        element: <NftDetail />,
        children: [
          {
            path: '/nft/:contractId',
            element: <NftTokensTab />
          },
          {
            path: '/nft/:contractId/tokens/:page?',
            element: <NftTokensTab />
          },
          {
            path: '/nft/:contractId/transfers/:page?',
            element: <NftTransfersTab />
          },
          {
            path: '/nft/:contractId/info',
            element: <NftInfoTab />
          }
        ]
      },
      {
        path: '/nam/btc',
        element: <BtcMapping />
      },
      {
        path: '/contract/:contractId',
        element: <Contract />
      },
      {
        path: '/:username/:page?',
        element: <L1User />
      },
      {
        path: '/tx/:txid',
        element: <Tx />
      },
      {
        path: '/nam/hive',
        element: <HiveBridgeOverview />
      },
      {
        path: '/nam/hive/maps/:page?',
        element: <HiveBridgeLatestTxs kind="d" />
      },
      {
        path: '/nam/hive/unmaps/:page?',
        element: <HiveBridgeLatestTxs kind="w" />
      },
      {
        path: '/staking/hbd',
        element: <StakingOverview />
      },
      {
        path: '/staking/hbd/claims/:page?',
        element: <StakingClaims />
      },
      {
        path: '/staking/hbd/claim/:blockHeight/:page?',
        element: <ClaimDetail />
      },
      {
        path: '/charts',
        element: <ChartsDirectory />
      },
      {
        path: '/charts/blocks',
        element: <BlocksCharts />
      },
      {
        path: '/charts/txs',
        element: <TxCharts />
      },
      {
        path: '/charts/addresses',
        element: <AddressCharts />
      },
      {
        path: '/charts/contracts',
        element: <ContractsCharts />
      },
      {
        path: '/charts/bridge',
        element: <BridgeCharts />
      },
      {
        path: '/charts/witnesses',
        element: <WitnessCharts />
      },
      {
        path: '/tools/verify/contract',
        element: <VerifyContract />
      },
      {
        path: '/tools/dag',
        element: <DagInspector />
      },
      {
        path: '/tools/broadcast',
        element: <Broadcast />
      },
      {
        path: '/settings',
        element: <Settings />
      },
      {
        path: '*',
        element: <PageNotFound />
      }
    ]
  }
])

const aioha = new Aioha()
const magi = new Magi()

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

createAppKit({
  adapters: [wagmiAdapter, bitcoinAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Magi Blocks',
    description: 'Magi Blocks Explorer',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: []
  }
})

const MagiProviderWithBtc = ({ children }: { children: ReactNode }) => {
  const { address: btcAddress, isConnected: btcConnected } = useAppKitAccount({ namespace: 'bip122' })
  const { walletProvider: btcProvider } = useAppKitProvider('bip122')
  const btcClient = useMemo<BtcClient | undefined>(() => {
    if (btcConnected && btcAddress && btcProvider) {
      return {
        address: btcAddress,
        signMessage: (msg: string) =>
          (btcProvider as { signMessage(p: { message: string; address: string }): Promise<string> }).signMessage({
            message: msg,
            address: btcAddress
          })
      }
    }
    return undefined
  }, [btcConnected, btcAddress, btcProvider])
  return (
    <MagiProvider magi={magi} btcClient={btcClient}>
      {children}
    </MagiProvider>
  )
}

const App = () => {
  useEffect(() => {
    aioha.setup({
      hiveauth: {
        name: 'Magi Blocks'
      }
    })
    const conf = getConf()
    aioha.setApi(conf.hiveApi, [])
    aioha.setChainId(conf.hiveChainId)
    aioha.vscSetNetId(conf.netId)
    magi.setApi(conf.gqlApi, [])
    magi.setNetId(conf.netId)
    magi.setAioha(aioha)
  }, [])
  return (
    <AiohaProvider aioha={aioha}>
      <MagiProviderWithBtc>
        <RouterProvider router={router} />
      </MagiProviderWithBtc>
    </AiohaProvider>
  )
}

export default App
