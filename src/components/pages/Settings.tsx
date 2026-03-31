import { Box, Card, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { LuMoon, LuSun } from 'react-icons/lu'
import { useColorMode, useColorModeValue } from '../ui/color-mode'
import { Switch } from '../ui/switch'
import { useBgTheme, BgTheme } from '../../hooks/useBgTheme'

const bgOptions: { value: BgTheme; label: string; lightColor: string; darkColor: string }[] = [
  { value: 'default', label: 'Default', lightColor: '#ffffff', darkColor: '#000000' },
  { value: 'red', label: 'Red', lightColor: '#fff5f5', darkColor: '#1a1215' },
  { value: 'green', label: 'Green', lightColor: '#f0fff4', darkColor: '#121a14' },
  { value: 'blue', label: 'Blue', lightColor: '#ebf8ff', darkColor: '#1a202c' }
]

const Settings = () => {
  const { colorMode, setColorMode } = useColorMode()
  const { bgTheme, setBgTheme } = useBgTheme()
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const selectedBorder = useColorModeValue('pink.400', 'pink.400')

  return (
    <Stack gap={6} maxW="lg" mx="auto">
      <Heading size="5xl" fontWeight="normal">Settings</Heading>

      <Card.Root>
        <Card.Header>
          <Heading size="md">Color Mode</Heading>
        </Card.Header>
        <Card.Body>
          <Switch
            checked={colorMode === 'dark'}
            onCheckedChange={(e) => setColorMode(e.checked ? 'dark' : 'light')}
            colorPalette="pink"
            size="lg"
            thumbLabel={{ on: <LuMoon color="var(--chakra-colors-pink-400)" />, off: <LuSun color="var(--chakra-colors-pink-400)" /> }}
          >
            Dark Mode
          </Switch>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md">Background Color</Heading>
        </Card.Header>
        <Card.Body>
          <HStack gap={4}>
            {bgOptions.map((opt) => {
              const isSelected = bgTheme === opt.value
              const previewColor = colorMode === 'light' ? opt.lightColor : opt.darkColor
              return (
                <Box
                  key={opt.value}
                  cursor="pointer"
                  onClick={() => setBgTheme(opt.value)}
                  borderWidth="2px"
                  borderColor={isSelected ? selectedBorder : borderColor}
                  borderRadius="lg"
                  p={3}
                  textAlign="center"
                  transition="all 0.2s"
                  _hover={{ borderColor: selectedBorder }}
                >
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
                </Box>
              )
            })}
          </HStack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

export default Settings
