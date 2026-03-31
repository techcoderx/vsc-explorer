import { lazy, Suspense, useEffect } from 'react'
import { Aioha } from '@aioha/aioha'
import { Magi } from '@aioha/magi'
import { AiohaProvider } from '@aioha/providers/react'
import { MagiProvider } from '@aioha/providers/magi/react'
import { createAppKit } from '@reown/appkit/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Navbar from './components/Navbar'
import { getConf } from './settings'
import { wagmiAdapter, networks } from './wagmiConfig'

const Home = lazy(() => import('./components/pages/Home'))
const Witnesses = lazy(() => import('./components/pages/Witnesses'))
const Blocks = lazy(() => import('./components/pages/Blocks'))
const NewTxs = lazy(() => import('./components/pages/NewTxs').then((m) => ({ default: m.NewTxs })))
const NewHiveTxs = lazy(() => import('./components/pages/NewTxs').then((m) => ({ default: m.NewHiveTxs })))
const NewVscTxs = lazy(() => import('./components/pages/NewTxs').then((m) => ({ default: m.NewVscTxs })))
const NewContracts = lazy(() => import('./components/pages/NewContracts'))
const PageNotFound = lazy(() => import('./components/pages/404'))
const BlockBy = lazy(() => import('./components/pages/Block').then((m) => ({ default: m.BlockBy })))
const L1User = lazy(() => import('./components/pages/L1User'))
const Tx = lazy(() => import('./components/pages/L1Tx').then((m) => ({ default: m.Tx })))
const Elections = lazy(() => import('./components/pages/Elections'))
const Epoch = lazy(() => import('./components/pages/Epoch'))
const Contract = lazy(() => import('./components/pages/Contract').then((m) => ({ default: m.Contract })))
const HiveBridgeOverview = lazy(() => import('./components/pages/bridge/Overview'))
const HiveBridgeLatestTxs = lazy(() => import('./components/pages/bridge/HiveLatestTxs').then((m) => ({ default: m.HiveBridgeLatestTxs })))
const WitnessSchedule = lazy(() => import('./components/pages/Schedule'))
const Address = lazy(() => import('./components/pages/address/Address').then((m) => ({ default: m.Address })))
const AddressTxs = lazy(() => import('./components/pages/address/Address').then((m) => ({ default: m.AddressTxs })))
const AddressDeposits = lazy(() => import('./components/pages/address/LedgerTxs').then((m) => ({ default: m.AddressDeposits })))
const AddressLedgers = lazy(() => import('./components/pages/address/LedgerTxs').then((m) => ({ default: m.AddressLedgers })))
const AddressActions = lazy(() => import('./components/pages/address/LedgerActions').then((m) => ({ default: m.AddressActions })))
const AddressWithdrawals = lazy(() => import('./components/pages/address/LedgerActions').then((m) => ({ default: m.AddressWithdrawals })))
const VerifyContract = lazy(() => import('./components/pages/tools/VerifyContract').then((m) => ({ default: m.VerifyContract })))
const DagInspector = lazy(() => import('./components/pages/tools/DagInspector').then((m) => ({ default: m.DagInspector })))
const AddressWitness = lazy(() => import('./components/pages/address/Witness').then((m) => ({ default: m.AddressWitness })))
const AddressL1Ops = lazy(() => import('./components/pages/address/L1Ops').then((m) => ({ default: m.AddressL1Ops })))
const ChartsDirectory = lazy(() => import('./components/pages/charts/Directory').then((m) => ({ default: m.ChartsDirectory })))
const BridgeCharts = lazy(() => import('./components/pages/charts/Bridge').then((m) => ({ default: m.BridgeCharts })))
const BlocksCharts = lazy(() => import('./components/pages/charts/Blocks').then((m) => ({ default: m.BlocksCharts })))
const TxCharts = lazy(() => import('./components/pages/charts/Transactions').then((m) => ({ default: m.TxCharts })))
const AddressCharts = lazy(() => import('./components/pages/charts/Addresses').then((m) => ({ default: m.AddressCharts })))
const ContractsCharts = lazy(() => import('./components/pages/charts/Contracts').then((m) => ({ default: m.ContractsCharts })))
const WitnessCharts = lazy(() => import('./components/pages/charts/Witnesses').then((m) => ({ default: m.WitnessCharts })))
const Broadcast = lazy(() => import('./components/pages/tools/Broadcast').then((m) => ({ default: m.Broadcast })))
const Settings = lazy(() => import('./components/pages/Settings'))

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
        path: '/bridge/hive',
        element: <HiveBridgeOverview />
      },
      {
        path: '/bridge/hive/deposits/:page?',
        element: <HiveBridgeLatestTxs kind="d" />
      },
      {
        path: '/bridge/hive/withdrawals/:page?',
        element: <HiveBridgeLatestTxs kind="w" />
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
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Magi Blocks',
    description: 'Magi Blocks Explorer',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: []
  }
})

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
      <MagiProvider magi={magi}>
        <Suspense>
          <RouterProvider router={router} />
        </Suspense>
      </MagiProvider>
    </AiohaProvider>
  )
}

export default App
