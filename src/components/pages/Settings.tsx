import { Box, Card, Heading, HStack, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { LuMoon, LuSun } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import { useColorMode, useColorModeValue } from '../ui/color-mode'
import { Switch } from '../ui/switch'
import { useBgTheme, BgTheme } from '../../hooks/useBgTheme'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ar', label: 'العربية' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ms', label: 'Bahasa Malaysia' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ru', label: 'Русский' },
  { value: 'pl', label: 'Polski' },
  { value: 'hr', label: 'Hrvatski' },
  { value: 'it', label: 'Italiano' },
]

const Settings = () => {
  const { t, i18n } = useTranslation('settings')
  const { colorMode, setColorMode } = useColorMode()
  const { bgTheme, setBgTheme } = useBgTheme()
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const selectedBorder = useColorModeValue('pink.400', 'pink.400')

  const bgOptions: { value: BgTheme; label: string; lightColor: string; darkColor: string }[] = [
    { value: 'default', label: t('themes.default'), lightColor: '#ffffff', darkColor: '#000000' },
    { value: 'red', label: t('themes.red'), lightColor: '#fff5f5', darkColor: '#1a1215' },
    { value: 'green', label: t('themes.green'), lightColor: '#f0fff4', darkColor: '#121a14' },
    { value: 'blue', label: t('themes.blue'), lightColor: '#ebf8ff', darkColor: '#1a202c' }
  ]

  return (
    <Stack gap={6} maxW="lg" mx="auto">
      <Heading size="5xl" fontWeight="normal">{t('title')}</Heading>

      <Card.Root>
        <Card.Header>
          <Heading size="md">{t('colorMode')}</Heading>
        </Card.Header>
        <Card.Body>
          <Switch
            checked={colorMode === 'dark'}
            onCheckedChange={(e) => setColorMode(e.checked ? 'dark' : 'light')}
            colorPalette="pink"
            size="lg"
            thumbLabel={{ on: <LuMoon color="var(--chakra-colors-pink-400)" />, off: <LuSun color="var(--chakra-colors-pink-400)" /> }}
          >
            {t('darkMode')}
          </Switch>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md">{t('colorTheme')}</Heading>
        </Card.Header>
        <Card.Body>
          <HStack gap={4} role="radiogroup" aria-label="Color theme">
            {bgOptions.map((opt) => {
              const isSelected = bgTheme === opt.value
              const previewColor = colorMode === 'light' ? opt.lightColor : opt.darkColor
              return (
                <Box
                  key={opt.value}
                  asChild
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${opt.label} theme`}
                  cursor="pointer"
                  borderWidth="2px"
                  borderColor={isSelected ? selectedBorder : borderColor}
                  borderRadius="lg"
                  p={3}
                  textAlign="center"
                  transition="all 0.2s"
                  _hover={{ borderColor: selectedBorder }}
                >
                  <button type="button" onClick={() => setBgTheme(opt.value)}>
                    <Box
                      w="60px"
                      h="40px"
                      borderRadius="md"
                      bg={previewColor}
                      border="1px solid"
                      borderColor={borderColor}
                      mb={2}
                    />
                    <Text fontSize="sm">{opt.label}</Text>
                  </button>
                </Box>
              )
            })}
          </HStack>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md">{t('language')}</Heading>
        </Card.Header>
        <Card.Body>
          <NativeSelect.Root maxW="xs">
            <NativeSelect.Field
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

export default Settings
