import { Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { PageTitle } from '../PageTitle'

const PageNotFound = () => {
  const { t } = useTranslation()
  return (
    <>
      <PageTitle title="404" description={t('pageNotFound') as string} noindex />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('pageNotFound')}</Heading>
    </>
  )
}

export default PageNotFound
