import { CheckCircleIcon } from '@chakra-ui/icons'
import { Icon, useColorModeValue } from '@chakra-ui/react'
import { FaCircleXmark } from 'react-icons/fa6'

export const CheckXIcon = ({ ok }: { ok: boolean }) => {
  const okFill = useColorModeValue('green.500', 'green.200')
  const notOkFill = useColorModeValue('red.500', 'red.400')
  return ok ? <CheckCircleIcon fontSize={'lg'} color={okFill} /> : <Icon fontSize={'lg'} as={FaCircleXmark} color={notOkFill} />
}
