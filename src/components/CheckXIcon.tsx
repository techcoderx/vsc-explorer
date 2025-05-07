import { CheckCircleIcon } from '@chakra-ui/icons'
import { Icon, useColorModeValue } from '@chakra-ui/react'
import { FaCircleArrowRight, FaCircleXmark, FaClock } from 'react-icons/fa6'
import { themeColorScheme } from '../settings'

export const CheckXIcon = ({ ok }: { ok: boolean }) => {
  const okFill = useColorModeValue('green.500', 'green.200')
  const notOkFill = useColorModeValue('red.500', 'red.400')

  return ok ? (
    <CheckCircleIcon fontSize={'lg'} color={okFill} aria-label="Success" />
  ) : (
    <Icon fontSize={'lg'} as={FaCircleXmark} color={notOkFill} aria-label="Failed" />
  )
}

export const PendingIcon = () => {
  const fill = useColorModeValue('yellow.500', 'yellow.300')
  return <Icon fontSize={'lg'} as={FaClock} color={fill} aria-label="Pending" />
}

export const ToIcon = () => {
  return <Icon fontSize={'lg'} as={FaCircleArrowRight} color={themeColorScheme} />
}
