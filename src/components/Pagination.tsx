import { Flex, ButtonGroup, Button, Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Link as ReactRouterLink, To } from 'react-router-dom'

interface PaginationProps {
  path: string
  currentPageNum: number
  maxPageNum: number
}

interface Wrapper {
  to: To
  children: ReactNode
}

const LinkedBtn = ({ to, children }: Wrapper) => {
  return (
    <Button padding='0 0'>
      <Box as={ReactRouterLink} to={to} w='100%' h='100%' display='flex' alignItems='center' justifyContent='center' padding='0px 16px'>
        {children}
      </Box>
    </Button>
  )
}

const Pagination = ({path, currentPageNum, maxPageNum}: PaginationProps) => {
  return (
    <Flex justifyContent={'flex-end'}>
      <ButtonGroup size={'md'} isAttached variant={'outline'}>
        {currentPageNum > 1 ? <LinkedBtn to={path+'/'+(currentPageNum-1)}>Previous</LinkedBtn> : null}
        {currentPageNum > 2 ? <LinkedBtn to={path+'/'+(currentPageNum-2)}>{currentPageNum-2}</LinkedBtn> : null}
        {currentPageNum > 1 ? <LinkedBtn to={path+'/'+(currentPageNum-1)}>{currentPageNum-1}</LinkedBtn> : null}
        <Button disabled cursor='not-allowed'>{currentPageNum}</Button>
        {maxPageNum >= currentPageNum+1 ? <LinkedBtn to={path+'/'+(currentPageNum+1)}>{currentPageNum+1}</LinkedBtn> : null}
        {maxPageNum >= currentPageNum+2 ? <LinkedBtn to={path+'/'+(currentPageNum+2)}>{currentPageNum+2}</LinkedBtn> : null}
        {maxPageNum > currentPageNum+3 ? <Button disabled cursor='not-allowed'>...</Button> : null}
        {maxPageNum >= currentPageNum+3 ? <LinkedBtn to={path+'/'+maxPageNum}>{maxPageNum}</LinkedBtn> : null}
        {currentPageNum < maxPageNum ? <LinkedBtn to={path+'/'+((currentPageNum || 1)+1)}>Next</LinkedBtn> : null}
      </ButtonGroup>
    </Flex>
  )
}

export default Pagination