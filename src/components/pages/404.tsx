import { Text } from '@chakra-ui/react'
import { PageTitle } from '../PageTitle'

const PageNotFound = () => {
  return (
    <>
      <PageTitle title="404" />
      <Text fontSize={'5xl'}>404 page not found</Text>
    </>
  )
}

export default PageNotFound
