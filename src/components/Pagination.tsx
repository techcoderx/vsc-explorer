import { Flex, Button, Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Link as ReactRouterLink, To } from 'react-router'
import { themeColor, themeColorULight, themeColorDark, themeColorScheme } from '../settings'

interface PaginationProps {
  path: string
  currentPageNum: number
  maxPageNum: number
}

interface Wrapper {
  to: To
  children: ReactNode
}

export const attachedGroupCss = {
  display: 'inline-flex',
  isolation: 'isolate',
  '& > button': {
    borderRadius: 0
  },
  '& > button:first-of-type': {
    borderStartStartRadius: 'l2',
    borderEndStartRadius: 'l2'
  },
  '& > button:last-of-type': {
    borderStartEndRadius: 'l2',
    borderEndEndRadius: 'l2'
  },
  '& > button:not(:last-of-type)': {
    marginInlineEnd: '-1px'
  }
}

export const CurrentPageBtn = ({ children }: { children: ReactNode }) => {
  return (
    <Button
      size="md"
      variant="outline"
      colorPalette={themeColorScheme}
      zIndex={2}
      bg={themeColor}
      color={'white'}
      _hover={{ bg: themeColor }}
      _light={{ borderColor: themeColor, bg: themeColorULight, color: themeColorDark, _hover: { bg: themeColorULight } }}
    >
      {children}
    </Button>
  )
}

export const LinkedBtn = ({ to, children }: Wrapper) => {
  return (
    <Button size="md" variant="outline" colorPalette="gray" padding="0 0">
      <Box
        asChild
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="0px 16px"
      >
        <ReactRouterLink to={to}>
          {children}
        </ReactRouterLink>
      </Box>
    </Button>
  )
}

const Pagination = ({ path, currentPageNum, maxPageNum }: PaginationProps) => {
  return (
    <Flex justifyContent={'center'}>
      <Box css={attachedGroupCss}>
        {currentPageNum > 1 ? <LinkedBtn to={path + '/' + (currentPageNum - 1)}>Previous</LinkedBtn> : null}
        {currentPageNum > 2 ? <LinkedBtn to={path + '/' + (currentPageNum - 2)}>{currentPageNum - 2}</LinkedBtn> : null}
        {currentPageNum > 1 ? <LinkedBtn to={path + '/' + (currentPageNum - 1)}>{currentPageNum - 1}</LinkedBtn> : null}
        <CurrentPageBtn>{currentPageNum}</CurrentPageBtn>
        {maxPageNum >= currentPageNum + 1 ? (
          <LinkedBtn to={path + '/' + (currentPageNum + 1)}>{currentPageNum + 1}</LinkedBtn>
        ) : null}
        {maxPageNum >= currentPageNum + 2 ? (
          <LinkedBtn to={path + '/' + (currentPageNum + 2)}>{currentPageNum + 2}</LinkedBtn>
        ) : null}
        {maxPageNum > currentPageNum + 3 ? (
          <Button size="md" variant="outline" colorPalette="gray" disabled cursor="not-allowed">
            ...
          </Button>
        ) : null}
        {maxPageNum >= currentPageNum + 3 ? <LinkedBtn to={path + '/' + maxPageNum}>{maxPageNum}</LinkedBtn> : null}
        {currentPageNum < maxPageNum ? <LinkedBtn to={path + '/' + ((currentPageNum || 1) + 1)}>Next</LinkedBtn> : null}
      </Box>
    </Flex>
  )
}

interface prevNextBtnProps {
  toPrev?: string
  toNext?: string
}

export const PrevNextBtns = ({ toPrev, toNext }: prevNextBtnProps) => {
  return (
    <Box margin="10px 0px">
      <Box css={attachedGroupCss} float="right">
        {toPrev ? <LinkedBtn to={toPrev}>Previous</LinkedBtn> : null}
        {toNext ? <LinkedBtn to={toNext}>Next</LinkedBtn> : null}
      </Box>
    </Box>
  )
}

export default Pagination
