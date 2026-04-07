import { Flex, Button, Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Link as ReactRouterLink, To } from 'react-router'
import { useTranslation } from 'react-i18next'
import { themeColor, themeColorULight, themeColorDark, themeColorScheme } from '../settings'
import { btnGroupCss } from '../styles/btnGroup'

interface PaginationProps {
  path: string
  currentPageNum: number
  maxPageNum: number
  buildLink?: (page: number) => string
}

interface Wrapper {
  to: To
  children: ReactNode
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
      aria-current="page"
    >
      {children}
    </Button>
  )
}

export const LinkedBtn = ({ to, children }: Wrapper) => {
  return (
    <Button size="md" variant="outline" colorPalette="gray" padding="0 0">
      <Box asChild w="100%" h="100%" display="flex" alignItems="center" justifyContent="center" padding="0px 16px">
        <ReactRouterLink to={to}>{children}</ReactRouterLink>
      </Box>
    </Button>
  )
}

const Pagination = ({ path, currentPageNum, maxPageNum, buildLink }: PaginationProps) => {
  const { t } = useTranslation()
  const link = (page: number) => {
    if (buildLink) return buildLink(page)
    return path + '/' + page
  }
  return (
    <Flex justifyContent={'center'}>
      <Box css={btnGroupCss}>
        {currentPageNum > 1 ? <LinkedBtn to={link(currentPageNum - 1)}>{t('previous')}</LinkedBtn> : null}
        {currentPageNum > 2 ? <LinkedBtn to={link(currentPageNum - 2)}>{currentPageNum - 2}</LinkedBtn> : null}
        {currentPageNum > 1 ? <LinkedBtn to={link(currentPageNum - 1)}>{currentPageNum - 1}</LinkedBtn> : null}
        <CurrentPageBtn>{currentPageNum}</CurrentPageBtn>
        {maxPageNum >= currentPageNum + 1 ? (
          <LinkedBtn to={link(currentPageNum + 1)}>{currentPageNum + 1}</LinkedBtn>
        ) : null}
        {maxPageNum >= currentPageNum + 2 ? (
          <LinkedBtn to={link(currentPageNum + 2)}>{currentPageNum + 2}</LinkedBtn>
        ) : null}
        {maxPageNum > currentPageNum + 3 ? (
          <Button size="md" variant="outline" colorPalette="gray" disabled cursor="not-allowed">
            ...
          </Button>
        ) : null}
        {maxPageNum >= currentPageNum + 3 ? <LinkedBtn to={link(maxPageNum)}>{maxPageNum}</LinkedBtn> : null}
        {currentPageNum < maxPageNum ? <LinkedBtn to={link((currentPageNum || 1) + 1)}>{t('next')}</LinkedBtn> : null}
      </Box>
    </Flex>
  )
}

interface prevNextBtnProps {
  toPrev?: string
  toNext?: string
}

export const PrevNextBtns = ({ toPrev, toNext }: prevNextBtnProps) => {
  const { t } = useTranslation()
  return (
    <Box margin="10px 0px">
      <Box css={btnGroupCss} float="right">
        {toPrev ? <LinkedBtn to={toPrev}>{t('previous')}</LinkedBtn> : null}
        {toNext ? <LinkedBtn to={toNext}>{t('next')}</LinkedBtn> : null}
      </Box>
    </Box>
  )
}

export default Pagination
