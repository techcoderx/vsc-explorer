import { Card, Flex, Grid, Image, Text } from '@chakra-ui/react'
import { toaster } from '../../ui/toaster'
import { Link as ReactRouterLink } from 'react-router'
import { themeColor } from '../../../settings'
import { PageTitle } from '../../PageTitle'

const metrics = [
  {
    title: 'Blocks',
    icon: '/img/stats/block.svg',
    href: '/charts/blocks'
  },
  {
    title: 'Transactions',
    icon: '/img/stats/transaction.svg',
    href: '/charts/txs'
  },
  {
    title: 'Addresses',
    icon: '/img/stats/wallet.svg',
    href: '/charts/addresses'
  },
  {
    title: 'Contracts',
    icon: '/img/stats/contract.svg',
    href: '/charts/contracts'
  },
  {
    title: 'Witnesses',
    icon: '/img/stats/witness.svg',
    href: '/charts/witnesses'
  },
  {
    title: 'NAM',
    icon: '/img/stats/bridge.svg',
    href: '/charts/bridge'
  }
]

export const ChartsDirectory = () => {
  return (
    <Flex direction={'column'} gap={'3'}>
      <PageTitle title="Network Charts Directory" />
      <Text fontSize={'5xl'}>Network Charts</Text>
      <Grid templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']} gap={'3'}>
        {metrics.map((m, i) => (
          <Card.Root
            asChild
            key={i}
            _hover={{ borderColor: themeColor, borderWidth: '0.5px' }}
            _light={{ _hover: { borderWidth: '1px' } }}
          >
            <ReactRouterLink
              to={m.href}
              onClick={(evt) => {
                if (m.href === '#') {
                  evt.preventDefault()
                  toaster.info({
                    title: 'Soon 🔜'
                  })
                }
              }}
            >
              <Card.Body textAlign={'center'}>
                <Flex direction={'column'} gap={'5'}>
                  <Image src={m.icon} width={'36'} height={'36'} mx={'auto'} my={'3'} objectFit={'contain'} />
                  <Text fontSize={'xl'} fontWeight={'bold'}>
                    {m.title}
                  </Text>
                </Flex>
              </Card.Body>
            </ReactRouterLink>
          </Card.Root>
        ))}
      </Grid>
    </Flex>
  )
}
