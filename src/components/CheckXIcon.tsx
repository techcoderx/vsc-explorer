import { LuCircleCheck } from 'react-icons/lu'
import { Box } from '@chakra-ui/react'
import { FaCircleArrowRight, FaCircleXmark, FaClock } from 'react-icons/fa6'
import { themeColorScheme } from '../settings'
import { useColorModeValue } from './ui/color-mode'

export const CheckXIcon = ({ ok }: { ok: boolean }) => {
  const okFill = useColorModeValue('green.500', 'green.200')
  const notOkFill = useColorModeValue('red.500', 'red.400')

  return ok ? (
    <Box as={LuCircleCheck} fontSize={'lg'} color={okFill} aria-label="Success" />
  ) : (
    <Box as={FaCircleXmark} fontSize={'lg'} color={notOkFill} aria-label="Failed" />
  )
}

export const PendingIcon = () => {
  const fill = useColorModeValue('yellow.500', 'yellow.300')
  return <Box as={FaClock} fontSize={'lg'} color={fill} aria-label="Pending" />
}

export const ToIcon = () => {
  return <Box as={FaCircleArrowRight} fontSize={'lg'} color={themeColorScheme} aria-label="To" />
}
