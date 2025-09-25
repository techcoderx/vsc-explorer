import { useEffect } from 'react'
import { Aioha } from '@aioha/aioha'
import { AiohaProvider } from '@aioha/react-provider'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Navbar from './components/Navbar'
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
import { ChartsDirectory } from './components/pages/charts/Directory'
import { BridgeCharts } from './components/pages/charts/Bridge'
import { BlocksCharts } from './components/pages/charts/Blocks'
import { TxCharts } from './components/pages/charts/Transactions'
import { AddressCharts } from './components/pages/charts/Addresses'
import { ContractsCharts } from './components/pages/charts/Contracts'
import { WitnessCharts } from './components/pages/charts/Witnesses'

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
        path: '*',
        element: <PageNotFound />
      }
    ]
  }
])

const aioha = new Aioha()

const App = () => {
  useEffect(() => {
    aioha.setup({
      hiveauth: {
        name: 'VSC Blocks'
      }
    })
  }, [])
  return (
    <AiohaProvider aioha={aioha}>
      <RouterProvider router={router} />
    </AiohaProvider>
  )
}

export default App
