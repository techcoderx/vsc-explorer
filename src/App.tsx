import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Witnesses from './components/pages/Witnesses'
import Blocks from './components/pages/Blocks'
import NewTxs from './components/pages/NewTxs'
import NewContracts from './components/pages/NewContracts'
import MultisigRefs from './components/pages/MultisigRefs'
import PageNotFound from './components/pages/404'
import { BlockByID, BlockByHash } from './components/pages/Block'
import L1User from './components/pages/L1User'
import L1Tx from './components/pages/L1Tx'
import L2Tx from './components/pages/L2Tx'

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
        path: '/txrefs',
        element: <MultisigRefs/>
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