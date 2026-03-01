export const themeColor = 'pink.400'
export const themeColorULight = 'pink.50'
export const themeColorSLight = 'pink.100'
export const themeColorLight = 'pink.300'
export const themeColorDark = 'pink.500'
export const themeColorScheme = 'pink'

export const cvApi = 'https://vsc.techcoderx.com/cv-api/v1'

interface HiveBlockExplorer {
  url: string
  name: string
  blockRoute: string
}

interface Conf {
  hiveApi: string
  beApi: string
  gqlApi: string
  hiveBe: HiveBlockExplorer[]
  hiveChainId: string
  netId: string
  msAccount: string
}

type Networks = 'mainnet' | 'testnet' | 'devnet'

let network: Networks = import.meta.env.VITE_NETWORK || 'mainnet'
if (network !== 'mainnet' && network !== 'testnet' && network !== 'devnet') network = 'mainnet'

const testnetConf: Conf = {
  hiveApi: 'https://testnet.techcoderx.com',
  beApi: 'https://magi-test.techcoderx.com/be-api/v1',
  gqlApi: 'https://magi-test.techcoderx.com/api/v1/graphql',
  hiveBe: [
    {
      url: 'https://testnet.techcoderx.com/explorer',
      name: 'HAF BE',
      blockRoute: '/block/'
    }
  ],
  hiveChainId: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e',
  netId: 'vsc-testnet',
  msAccount: 'vsc.gateway'
}

const mainnetConf: Conf = {
  hiveApi: 'https://techcoderx.com',
  beApi: 'https://vsc.techcoderx.com/be-api/v1',
  gqlApi: 'https://vsc.techcoderx.com/api/v1/graphql',
  hiveBe: [
    {
      url: 'https://hivehub.dev',
      name: 'HiveHub',
      blockRoute: '/b/'
    },
    {
      url: 'https://hafscan.techcoderx.com',
      name: 'HAF BE',
      blockRoute: '/block/'
    }
  ],
  hiveChainId: 'beeab0de00000000000000000000000000000000000000000000000000000000',
  netId: 'vsc-mainnet',
  msAccount: 'vsc.gateway'
}

const devnetHiveApi = import.meta.env.VITE_DEVNET_HIVE_API || 'http://localhost:10710'
const devnetBeApi = import.meta.env.VITE_DEVNET_BE_API || 'http://localhost:10719/be-api/v1'
const devnetGqlApi = import.meta.env.VITE_DEVNET_GQL_API || 'http://localhost:8080/api/v1/graphql'

const devnetConf: Conf = {
  hiveApi: devnetHiveApi,
  beApi: devnetBeApi,
  gqlApi: devnetGqlApi,
  hiveBe: [
    {
      url: devnetHiveApi + '/explorer',
      name: 'HAF BE',
      blockRoute: '/block/'
    }
  ],
  hiveChainId: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e',
  netId: 'vsc-devnet',
  msAccount: 'vsc.gateway'
}

export const getConf = (): Conf => {
  switch (network) {
    case 'mainnet':
      return mainnetConf
    case 'testnet':
      return testnetConf
    case 'devnet':
      return devnetConf
  }
}
