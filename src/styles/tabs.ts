import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { themeColorLight } from '../settings'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)

const roundedTabStyle = definePartsStyle({
  tab: {
    _selected: {
      bgColor: themeColorLight,
      borderColor: themeColorLight,
      _hover: {
        bgColor: themeColorLight
      }
    },
    _hover: {
      bgColor: 'gray.600'
    },
    borderWidth: '1px',
    borderColor: 'gray.600'
  },
  tablist: {
    display: 'flex',
    gap: '2'
  }
})

export const tabStyles = defineMultiStyleConfig({ variants: { 'solid-rounded': roundedTabStyle } })
