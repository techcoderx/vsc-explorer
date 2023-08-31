import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Witnesses from './components/pages/Witnesses'
import Blocks from './components/pages/Blocks'
import NewTxs from './components/pages/NewTxs'
import NewContracts from './components/pages/NewContracts'
import MultisigRefs from './components/pages/MultisigRefs'
import PageNotFound from './components/pages/404'
import Block from './components/pages/Block'

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
        path: '/blocks/:page?',
        element: <Blocks/>
      },
      {
        path: '/block/:blockNum',
        element: <Block/>
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