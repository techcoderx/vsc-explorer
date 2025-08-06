import { Card, CardBody, Flex, Grid, Image, Text, useToast } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { themeColor } from '../../../settings'
import { PageTitle } from '../../PageTitle'

const metrics = [
  {
    title: 'Blocks',
    icon: '/img/block.svg',
    href: '/charts/blocks'
  },
  {
    title: 'Transactions',
    icon: '/img/transaction.svg',
    href: '/charts/txs'
  },
  {
    title: 'Addresses',
    icon: '/img/wallet.svg',
    href: '/charts/addresses'
  },
  {
    title: 'Contracts',
    icon: '/img/contract.svg',
    href: '/charts/contracts'
  },
  {
    title: 'Witnesses',
    icon: '/img/witness.svg',
    href: '/charts/witnesses'
  },
  {
    title: 'NAM',
    icon: '/img/bridge.svg',
    href: '/charts/bridge'
  }
]

export const ChartsDirectory = () => {
  const toast = useToast()
  return (
    <Flex direction={'column'} gap={'3'}>
      <PageTitle title="Network Charts Directory" />
      <Text fontSize={'5xl'}>Network Charts</Text>
      <Grid templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']} gap={'3'}>
        {metrics.map((m, i) => (
          <Card
            as={ReactRouterLink}
            to={m.href}
            key={i}
            onClick={(evt) => {
              if (m.href === '#') {
                evt.preventDefault()
                toast({
                  title: 'Soon 🔜',
                  status: 'info'
                })
              }
            }}
            _hover={{ borderColor: themeColor, borderWidth: '0.5px' }}
            _light={{ _hover: { borderWidth: '1px' } }}
          >
            <CardBody textAlign={'center'}>
              <Flex direction={'column'} gap={'5'}>
                <Image src={m.icon} width={'36'} height={'36'} mx={'auto'} my={'3'} />
                <Text fontSize={'xl'} fontWeight={'bold'}>
                  {m.title}
                </Text>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Flex>
  )
}
