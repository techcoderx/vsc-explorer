import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Witnesses from './components/pages/Witnesses'
import Blocks from './components/pages/Blocks'
import NewTxs from './components/pages/NewTxs'
import NewContracts from './components/pages/NewContracts'
import MultisigRefs from './components/pages/MultisigRefs'

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
        path: '/blocks',
        element: <Blocks/>
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