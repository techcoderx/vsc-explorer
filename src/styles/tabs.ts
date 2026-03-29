import { defineSlotRecipe } from '@chakra-ui/react'
import { themeColorLight } from '../settings'

export const tabsSlotRecipe = defineSlotRecipe({
  className: 'chakra-tabs',
  slots: ['root', 'list', 'trigger', 'content', 'indicator', 'contentGroup'],
  variants: {
    variant: {
      'solid-rounded': {
        trigger: {
          borderWidth: '1px',
          borderColor: 'gray.600',
          borderRadius: 'md',
          _hover: {
            bgColor: 'gray.600'
          },
          _selected: {
            bgColor: themeColorLight,
            borderColor: themeColorLight,
            _hover: {
              bgColor: themeColorLight
            }
          }
        },
        list: {
          display: 'flex',
          gap: '2'
        }
      }
    }
  }
})
