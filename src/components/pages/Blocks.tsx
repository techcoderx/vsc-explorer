import { Heading, Text } from '@chakra-ui/react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import PageNotFound from './404'
import { Blocks as BlocksTbl } from '../tables/Blocks'
import Pagination from '../Pagination'
import { fetchProps, fetchBlocks } from '../../requests'
import { thousandSeperator } from '../../helpers'
import { PageTitle } from '../PageTitle'

const count = 50

const Blocks = () => {
  const { t } = useTranslation('pages')
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1
  const { data: prop } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    enabled: !invalidPage
  })
  const height = prop?.l2_block_height
  const lastBlock = (prop?.l2_block_height || 0) - (pageNumber - 1) * count
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['vsc-blocks', height, page],
    queryFn: async () => fetchBlocks(lastBlock, count),
    enabled: !!height && !invalidPage
  })
  if (invalidPage) return <PageNotFound />

  return (
    <>
      <PageTitle title={t('blocks.title')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('blocks.title')}</Heading>
      <hr />
      <br />
      <Text>{t('blocks.total', { count: prop ? thousandSeperator(prop.l2_block_height) : 0 })}</Text>
      <BlocksTbl blocks={blocks} isLoading={isLoading} />
      <Pagination path="/blocks" currentPageNum={pageNumber} maxPageNum={Math.ceil((height || 0) / count)} />
    </>
  )
}

export default Blocks
