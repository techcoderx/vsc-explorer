import { Card, Flex, Grid, Heading, Image, Text } from '@chakra-ui/react'
import { toaster } from '../../ui/toaster'
import { Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { themeColor } from '../../../settings'
import { PageTitle } from '../../PageTitle'

const getMetrics = (t: TFunction<'pages'>) => [
  {
    title: t('charts.titles.blocks'),
    icon: '/img/stats/block.svg',
    href: '/charts/blocks'
  },
  {
    title: t('charts.titles.transactions'),
    icon: '/img/stats/transaction.svg',
    href: '/charts/txs'
  },
  {
    title: t('charts.titles.addresses'),
    icon: '/img/stats/wallet.svg',
    href: '/charts/addresses'
  },
  {
    title: t('charts.titles.contracts'),
    icon: '/img/stats/contract.svg',
    href: '/charts/contracts'
  },
  {
    title: t('charts.titles.witnesses'),
    icon: '/img/stats/witness.svg',
    href: '/charts/witnesses'
  },
  {
    title: t('charts.titles.nam'),
    icon: '/img/stats/bridge.svg',
    href: '/charts/bridge'
  }
]

export const ChartsDirectory = () => {
  const { t } = useTranslation('pages')
  const metrics = getMetrics(t)
  return (
    <Flex direction={'column'} gap={'3'}>
      <PageTitle title="Network Charts Directory" />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('charts.directory')}</Heading>
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
                    title: t('charts.soon') + ' \uD83D\uDD1C'
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
