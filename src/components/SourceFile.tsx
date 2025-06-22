import { Box, useColorMode } from '@chakra-ui/react'

export const SourceFile = ({ content }: { content: string }) => {
  const { colorMode } = useColorMode()
  return (
    <Box
      as="pre"
      padding="2"
      borderRadius="md"
      overflow="auto"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'gray.500' : 'gray.200'}
    >
      <code>{content}</code>
    </Box>
  )
}
