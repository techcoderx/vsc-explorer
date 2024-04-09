import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Witnesses from './components/pages/Witnesses'
import Blocks from './components/pages/Blocks'
import NewTxs from './components/pages/NewTxs'
import NewContracts from './components/pages/NewContracts'
import AnchorRefs from './components/pages/AnchorRefs'
import PageNotFound from './components/pages/404'
import { BlockByID, BlockByHash } from './components/pages/Block'
import L1User from './components/pages/L1User'
import L1Tx from './components/pages/L1Tx'
import L2Tx from './components/pages/L2Tx'
import Elections from './components/pages/Elections'
import Epoch from './components/pages/Epoch'
import { AnchorRefByHash, AnchorRefByID } from './components/pages/AnchorRef'
import { Contract } from './components/pages/Contract'
import HiveBridgeOverview from './components/pages/bridge/Overview'
import { HiveDeposits, HiveWithdrawals } from './components/pages/bridge/HiveLatestTxs'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navbar/>,
    children: [
      {
        path: '/',
        element: <Home/>
      },
      {
        path: '/witnesses',
        element: <Witnesses/>
      },
      {
        path: '/witnesses/:page?',
        element: <Witnesses/>
      },
      {
        path: '/elections',
        element: <Elections/>
      },
      {
        path: '/epoch/:epochNum',
        element: <Epoch/>
      },
      {
        path: '/blocks/:page?',
        element: <Blocks/>
      },
      {
        path: '/block/:blockNum',
        element: <BlockByID/>
      },
      {
        path: '/block-by-hash/:blockId',
        element: <BlockByHash/>
      },
      {
        path: '/transactions',
        element: <NewTxs/>
      },
      {
        path: '/contracts',
        element: <NewContracts/>
      },
      {
        path: '/contract/:contractId',
        element: <Contract/>
      },
      {
        path: '/anchor-refs',
        element: <AnchorRefs/>
      },
      {
        path: '/anchor-ref/:refid',
        element: <AnchorRefByID/>
      },
      {
        path: '/anchor-ref-cid/:cid',
        element: <AnchorRefByHash/>
      },
      {
        path: '/:username/:page?',
        element: <L1User/>
      },
      {
        path: '/tx/:txid',
        element: <L1Tx/>
      },
      {
        path: '/vsc-tx/:txid',
        element: <L2Tx/>
      },
      {
        path: '/bridge/hive',
        element: <HiveBridgeOverview/>
      },
      {
        path: '/bridge/hive/deposits/:page?',
        element: <HiveDeposits/>
      },
      {
        path: '/bridge/hive/withdrawals/:page?',
        element: <HiveWithdrawals/>
      },
      {
        path: '*',
        element: <PageNotFound/>
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