import { useCallback, useEffect, useState } from 'react'
import { useColorMode } from '../components/ui/color-mode'

export type BgTheme = 'default' | 'blue'

const STORAGE_KEY = 'magi-bg-theme'
const BG_THEME_EVENT = 'magi-bg-theme-change'

interface ThemeColors {
  bg: string
  surface: string
  surfaceHover: string
  border: string
  popover: string
  tooltip: string
  card: string
}

const themeColors: Record<BgTheme, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: { bg: '#ffffff', surface: '#edf2f7', surfaceHover: '#e2e8f0', border: '#e2e8f0', popover: '#ffffff', tooltip: '#edf2f7', card: '#edf2f7' },
    dark: { bg: '#000000', surface: '#171923', surfaceHover: '#1a202c', border: '#171923', popover: '#1a202c', tooltip: '#1a1a1a', card: '#171923' }
  },
  blue: {
    light: { bg: '#ebf8ff', surface: '#e2f0fb', surfaceHover: '#d0e8f5', border: '#bee3f8', popover: '#ffffff', tooltip: '#e2f0fb', card: '#e2f0fb' },
    dark: { bg: '#1a202c', surface: '#2d3748', surfaceHover: '#4a5568', border: '#2d3748', popover: '#2d3748', tooltip: '#2d3748', card: '#2D3748' }
  }
}

function getStoredTheme(): BgTheme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'default' || stored === 'blue') return stored
  return 'default'
}

function applyThemeColors(bgTheme: BgTheme, colorMode: string) {
  const mode = colorMode === 'light' ? 'light' : 'dark'
  const colors = themeColors[bgTheme][mode]
  document.body.style.backgroundColor = colors.bg
  document.documentElement.style.backgroundColor = colors.bg
  const root = document.documentElement
  root.style.setProperty('--magi-bg', colors.bg)
  root.style.setProperty('--magi-surface', colors.surface)
  root.style.setProperty('--magi-surface-hover', colors.surfaceHover)
  root.style.setProperty('--magi-border', colors.border)
  root.style.setProperty('--magi-popover', colors.popover)
  root.style.setProperty('--magi-tooltip', colors.tooltip)
  root.style.setProperty('--magi-card', colors.card)
  root.dataset.bgTheme = bgTheme
}

export function useBgTheme() {
  const { colorMode } = useColorMode()
  const [bgTheme, setBgThemeState] = useState<BgTheme>(getStoredTheme)

  const setBgTheme = useCallback(
    (theme: BgTheme) => {
      localStorage.setItem(STORAGE_KEY, theme)
      setBgThemeState(theme)
      applyThemeColors(theme, colorMode)
      window.dispatchEvent(new CustomEvent(BG_THEME_EVENT, { detail: theme }))
    },
    [colorMode]
  )

  useEffect(() => {
    const handler = (e: Event) => {
      const theme = (e as CustomEvent<BgTheme>).detail
      setBgThemeState(theme)
    }
    window.addEventListener(BG_THEME_EVENT, handler)
    return () => window.removeEventListener(BG_THEME_EVENT, handler)
  }, [])

  useEffect(() => {
    applyThemeColors(bgTheme, colorMode)
  }, [bgTheme, colorMode])

  return { bgTheme, setBgTheme }
}
