import { Flex, Box, Progress, Text } from '@chakra-ui/react'
import { themeColorScheme } from '../settings'

export const ProgressBarPct = ({
  val,
  fontSize = 'sm',
  width = 'sm'
}: {
  val: number
  height?: string
  width?: string
  fontSize?: 'sm' | 'md' | 'lg'
}) => {
  return (
    <Flex alignItems="center">
      <Box width={width}>
        <Progress.Root colorPalette={themeColorScheme} size={'xs'} value={val} max={100}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>
      <Text ml={2} fontSize={fontSize}>
        {val.toFixed(2)}%
      </Text>
    </Flex>
  )
}
