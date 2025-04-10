import { createBrowserRouter, RouterProvider } from 'react-router'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Witnesses from './components/pages/Witnesses'
import Blocks from './components/pages/Blocks'
import NewTxs from './components/pages/NewTxs'
import NewContracts from './components/pages/NewContracts'
// import PageNotFound from './components/pages/404'
import { BlockByID, BlockByHash } from './components/pages/Block'
import L1User from './components/pages/L1User'
import L1Tx from './components/pages/L1Tx'
// import L2Tx from './components/pages/L2Tx'
import Elections from './components/pages/Elections'
import Epoch from './components/pages/Epoch'
import { Contract } from './components/pages/Contract'
// import HiveBridgeOverview from './components/pages/bridge/Overview'
// import { HiveDeposits, HiveWithdrawals } from './components/pages/bridge/HiveLatestTxs'
// import { ContractOut } from './components/pages/ContractOut'
// import { Event } from './components/pages/Event'
import WitnessSchedule from './components/pages/Schedule'
// import { Address, AddressEvents, AddressTxs } from './components/pages/address/Address'
// import { AddressDeposits } from './components/pages/address/Deposits'
// import { AddressWithdrawals } from './components/pages/address/Withdrawals'
import { VerifyContract } from './components/pages/tools/VerifyContract'
import { Maintenance } from './components/pages/Maintenance'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navbar />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      // {
      //   path: '/address/:addr',
      //   element: <Address />,
      //   children: [
      //     {
      //       path: '/address/:addr',
      //       element: <AddressTxs />
      //     },
      //     {
      //       path: '/address/:addr/txs/:page?',
      //       element: <AddressTxs />
      //     },
      //     {
      //       path: '/address/:addr/events/:page?',
      //       element: <AddressEvents />
      //     },
      //     {
      //       path: '/address/:addr/deposits/:page?',
      //       element: <AddressDeposits />
      //     },
      //     {
      //       path: '/address/:addr/withdrawals/:page?',
      //       element: <AddressWithdrawals />
      //     }
      //   ]
      // },
      {
        path: '/witnesses',
        element: <Witnesses />
      },
      // {
      //   path: '/witnesses/:page?',
      //   element: <Witnesses />
      // },
      {
        path: '/schedule',
        element: <WitnessSchedule />
      },
      {
        path: '/elections/:page?',
        element: <Elections />
      },
      {
        path: '/epoch/:epochNum',
        element: <Epoch />
      },
      {
        path: '/blocks/:page?',
        element: <Blocks />
      },
      {
        path: '/block/:blockNum',
        element: <BlockByID />
      },
      {
        path: '/block-by-hash/:blockId',
        element: <BlockByHash />
      },
      {
        path: '/transactions',
        element: <NewTxs />
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
        element: <L1Tx />
      },
      // {
      //   path: '/vsc-tx/:txid',
      //   element: <L2Tx />
      // },
      // {
      //   path: '/vsc-tx-output/:txid',
      //   element: <ContractOut />
      // },
      // {
      //   path: '/event/:cid',
      //   element: <Event />
      // },
      // {
      //   path: '/bridge/hive',
      //   element: <HiveBridgeOverview />
      // },
      // {
      //   path: '/bridge/hive/deposits/:page?',
      //   element: <HiveDeposits />
      // },
      // {
      //   path: '/bridge/hive/withdrawals/:page?',
      //   element: <HiveWithdrawals />
      // },
      {
        path: '/tools/verify/contract',
        element: <VerifyContract />
      },
      {
        path: '*',
        element: <Maintenance />
      }
    ]
  }
])

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
