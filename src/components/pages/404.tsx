import { Heading } from '@chakra-ui/react'
import { PageTitle } from '../PageTitle'

const PageNotFound = () => {
  return (
    <>
      <PageTitle title="404" />
      <Heading as="h1" size="5xl" fontWeight="normal">404 page not found</Heading>
    </>
  )
}

export default PageNotFound
