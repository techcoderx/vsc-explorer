import { Flex, Box, Progress, Text } from '@chakra-ui/react'
import { themeColorScheme } from '../settings'

export const ProgressBarPct = ({ val, fontSize = 'sm' }: { val: number; fontSize?: 'sm' | 'md' | 'lg' }) => {
  return (
    <Flex alignItems="center">
      <Box width="sm">
        <Progress colorScheme={themeColorScheme} height={'6px'} value={val} />
      </Box>
      <Text ml={2} fontSize={fontSize}>
        {val.toFixed(2)}%
      </Text>
    </Flex>
  )
}
