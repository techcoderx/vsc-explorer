import { defineConfig, type SystemStyleObject } from '@chakra-ui/react'
import { tabsSlotRecipe } from './tabs'
import { globalCss } from './globalCss'

export const themeConfig = defineConfig({
  globalCss,
  theme: {
    tokens: {
      fontSizes: {
        xs: { value: '0.875rem' },
        sm: { value: '1rem' },
        md: { value: '1.125rem' },
        lg: { value: '1.25rem' },
        xl: { value: '1.375rem' },
        '2xl': { value: '1.5rem' },
        '3xl': { value: '1.875rem' },
        '4xl': { value: '2.25rem' },
        '5xl': { value: '3rem' },
        '6xl': { value: '3.75rem' }
      },
      sizes: {
        ss: { value: '22em' }
      }
    },
    semanticTokens: {
      colors: {
        gray: {
          focusRing: { value: '{colors.pink.400}' }
        },
        pink: {
          solid: { value: '{colors.pink.400}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.pink.400}' }
        }
      }
    },
    recipes: {
      input: {
        variants: {
          variant: {
            outline: {
              focusVisibleRing: 'none',
              _focusVisible: {
                borderColor: 'var(--focus-color)'
              }
            }
          }
        }
      },
      button: {
        compoundVariants: [
          {
            variant: 'outline',
            colorPalette: 'gray',
            css: {
              '.dark[data-bg-theme="blue"] &': {
                backgroundColor: 'var(--magi-surface)',
                borderColor: '#4a5568',
                transition: 'border-color 0.2s, background-color 0.2s'
              },
              '.dark[data-bg-theme="blue"] &:hover': {
                backgroundColor: 'var(--magi-surface-hover)',
                borderColor: '#718096'
              },
              '.dark[data-bg-theme="blue"] &:focus-visible': {
                borderColor: '#4a5568'
              }
            } as SystemStyleObject
          }
        ]
      },
      textarea: {
        variants: {
          variant: {
            outline: {
              focusVisibleRing: 'none',
              _focusVisible: {
                borderColor: 'var(--focus-color)'
              }
            }
          }
        }
      }
    },
    slotRecipes: {
      tabs: tabsSlotRecipe,
      nativeSelect: {
        slots: ['root', 'field', 'indicator'],
        variants: {
          variant: {
            outline: {
              field: {
                focusVisibleRing: 'none',
                _focusVisible: {
                  borderColor: 'var(--focus-color, {colors.pink.400})'
                }
              }
            }
          }
        }
      }
    }
  }
})
