import maintenance from '../../svg/undraw_maintenance.svg'
import { Center, Image, Stack, Text } from '@chakra-ui/react'

export const Maintenance = () => {
  return (
    <Center>
      <Stack direction={'column'}>
        <Image src={maintenance} w={'md'} h={'md'} />
        <Text fontSize={'3xl'} textAlign={'center'}>
          We will be right back.
        </Text>
      </Stack>
    </Center>
  )
}
