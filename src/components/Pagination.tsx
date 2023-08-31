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

const ButtonWrapper = ({ to, children }: Wrapper) => {
  return (
    <Box as={ReactRouterLink} to={to} w='100%' h='100%' display='flex' alignItems='center' justifyContent='center' padding='0px 16px'>
      {children}
    </Box>
  )
}

const Btn: React.CSSProperties = {
  padding: '0 0',
}

const Pagination = ({path, currentPageNum, maxPageNum}: PaginationProps) => {
  return (
    <Flex justifyContent={'flex-end'}>
      <ButtonGroup size={'md'} isAttached variant={'outline'}>
        {currentPageNum > 1 ? <Button style={Btn}><ButtonWrapper to={path+'/'+(currentPageNum-1)}>Previous</ButtonWrapper></Button> : null}
        {currentPageNum > 2 ? <Button style={Btn}><ButtonWrapper to={path+'/'+(currentPageNum-2)}>{currentPageNum-2}</ButtonWrapper></Button> : null}
        {currentPageNum > 1 ? <Button style={Btn}><ButtonWrapper to={path+'/'+(currentPageNum-1)}>{currentPageNum-1}</ButtonWrapper></Button> : null}
        <Button disabled style={{cursor: 'not-allowed'}}>{currentPageNum}</Button>
        {maxPageNum >= currentPageNum+1 ? <Button style={Btn}><ButtonWrapper to={path+'/'+(currentPageNum+1)}>{currentPageNum+1}</ButtonWrapper></Button> : null}
        {maxPageNum >= currentPageNum+2 ? <Button style={Btn}><ButtonWrapper to={path+'/'+(currentPageNum+2)}>{currentPageNum+2}</ButtonWrapper></Button> : null}
        {maxPageNum > currentPageNum+3 ? <Button disabled style={{cursor: 'not-allowed'}}>...</Button> : null}
        {maxPageNum >= currentPageNum+3 ? <Button style={Btn}><ButtonWrapper to={path+'/'+maxPageNum}>{maxPageNum}</ButtonWrapper></Button> : null}
        {currentPageNum < maxPageNum ? <Button style={Btn}><ButtonWrapper to={path+'/'+((currentPageNum || 1)+1)}>Next</ButtonWrapper></Button> : null}
      </ButtonGroup>
    </Flex>
  )
}

export default Pagination