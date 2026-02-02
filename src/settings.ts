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

let network: 'mainnet' | 'testnet' = import.meta.env.VITE_NETWORK || 'mainnet'
if (network !== 'mainnet' && network !== 'testnet') network = 'mainnet'

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

export const getConf = (): Conf => {
  switch (network) {
    case 'mainnet':
      return mainnetConf
    case 'testnet':
      return testnetConf
  }
}
