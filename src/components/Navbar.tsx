import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  HStack,
  Collapsible,
  Popover,
  Container,
  useBreakpointValue,
  Tag
} from '@chakra-ui/react'
import { LuMenu, LuX, LuChevronDown, LuChevronRight, LuMoon, LuSun } from 'react-icons/lu'
import { Link as ReactRouterLink, Outlet } from 'react-router'
import { getConf, themeColor, themeColorScheme, themeColorULight } from '../settings'
import SearchBar from './SearchBar'
import { useColorMode, useColorModeValue } from './ui/color-mode'
import { useState } from 'react'

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen((v) => !v)

  return (
    <Box>
      <Flex
        bg={useColorModeValue('gray.100', 'gray.900')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex flex={{ base: 1, md: 'auto' }} ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
          <IconButton onClick={onToggle} variant={'ghost'} aria-label={'Toggle Navigation'}>
            {isOpen ? <LuX size={12} /> : <LuMenu size={20} />}
          </IconButton>
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align={'center'} gap={'2'}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
          >
            <ReactRouterLink to="/">Magi Blocks</ReactRouterLink>
          </Text>

          {getConf().netId === 'vsc-testnet' && (
            <Tag.Root size={'sm'} variant={'outline'} colorPalette={themeColorScheme}>
              Testnet
            </Tag.Root>
          )}

          <Flex display={{ base: 'none', md: 'flex' }} ml={3}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify={'flex-end'} direction={'row'} gap={3}>
          <Box width={{ base: 'fit-content', lg: '270px' }}>
            <SearchBar miniBtn={useBreakpointValue({ base: true, lg: false })} />
          </Box>
          <Button
            variant={'subtle'}
            colorPalette={'gray'}
            bg={useColorModeValue('gray.200', 'gray.800')}
            onClick={toggleColorMode}
            aria-label={'Switch color theme'}
          >
            {colorMode === 'light' ? <LuMoon /> : <LuSun />}
          </Button>
        </Stack>
      </Flex>

      <Collapsible.Root open={isOpen}>
        <Collapsible.Content>
          <MobileNav />
        </Collapsible.Content>
      </Collapsible.Root>

      <Container width={'100%'} maxW={'8xl'} marginTop={'15px'} marginBottom={'40px'}>
        <Outlet />
      </Container>
    </Box>
  )
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'gray.800')

  return (
    <Stack direction={'row'} gap={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover.Root positioning={{ placement: 'bottom-start' }}>
            <Popover.Trigger asChild>
              <Box
                asChild
                p={2}
                fontSize={'md'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor
                }}
              >
                <ReactRouterLink to={navItem.href ?? '#'}>{navItem.label}</ReactRouterLink>
              </Box>
            </Popover.Trigger>

            {navItem.children && (
              <Popover.Positioner>
                <Popover.Content border={0} boxShadow={'xl'} bg={popoverContentBgColor} p={4} rounded={'xl'} minW={'sm'}>
                  <Stack>
                    {navItem.children.map((child) => (
                      <DesktopSubNav key={child.label} {...child} />
                    ))}
                  </Stack>
                </Popover.Content>
              </Popover.Positioner>
            )}
          </Popover.Root>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Box role={'group'} display={'block'} p={2} rounded={'md'} _hover={{ bg: useColorModeValue(themeColorULight, 'gray.900') }}>
      <ReactRouterLink to={href ?? '#'}>
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text transition={'all .3s ease'} _groupHover={{ color: themeColor }} fontWeight={500}>
              {label}
            </Text>
            <Text fontSize={'xs'} color={'gray.500'} _dark={{ color: 'gray.400' }}>
              {subLabel}
            </Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Box as={LuChevronRight} color={themeColor} w={5} h={5} />
          </Flex>
        </Stack>
      </ReactRouterLink>
    </Box>
  )
}

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('gray.100', 'gray.900')} px={5} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen((v) => !v)

  return (
    <Stack gap={0} onClick={children && onToggle}>
      <Box
        py={3}
        asChild
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none'
        }}
      >
        <ReactRouterLink to={href ?? '#'}>
          <HStack>
            <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
              {label}
            </Text>
            {children && (
              <Box
                as={LuChevronDown}
                transition={'all .25s ease-in-out'}
                transform={isOpen ? 'rotate(180deg)' : ''}
                w={6}
                h={6}
              />
            )}
          </HStack>
        </ReactRouterLink>
      </Box>

      <Collapsible.Root open={isOpen}>
        <Collapsible.Content style={{ marginTop: '0!important' }}>
          <Stack
            mt={0}
            pl={4}
            borderLeft={1}
            borderStyle={'solid'}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            align={'start'}
          >
            {children &&
              children.map((child) => (
                <Box asChild key={child.label} py={2}>
                  <ReactRouterLink to={child.href ?? '#'}>{child.label}</ReactRouterLink>
                </Box>
              ))}
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Stack>
  )
}

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Witnesses',
    children: [
      {
        label: 'Overview',
        subLabel: 'List of active witnesses',
        href: '/witnesses'
      },
      {
        label: 'Elections',
        subLabel: 'Witness selection of each epoch',
        href: '/elections'
      },
      {
        label: 'Multisig Account',
        subLabel: 'Activities of multisig account',
        href: '/address/hive:' + getConf().msAccount + '/hiveops'
      },
      {
        label: 'Schedule',
        subLabel: 'Block production schedule',
        href: '/schedule'
      }
    ]
  },
  {
    label: 'Blockchain',
    children: [
      {
        label: 'Blocks',
        subLabel: 'Latest Magi blocks',
        href: '/blocks'
      },
      {
        label: 'Transactions',
        subLabel: 'Latest Magi transactions',
        href: '/transactions'
      },
      {
        label: 'Contracts',
        subLabel: 'Deployed smart contracts',
        href: '/contracts'
      }
    ]
  },
  {
    label: 'NAM',
    href: '/bridge/hive'
  },
  {
    label: 'Charts',
    href: '/charts'
  },
  {
    label: 'Tools',
    children: [
      {
        label: 'Verify Contract',
        subLabel: 'Submit contract source code for verification',
        href: '/tools/verify/contract'
      },
      {
        label: 'DAG Inspector',
        subLabel: 'View a DAG by CID pinned by nodes',
        href: '/tools/dag'
      },
      {
        label: 'Broadcast Transaction',
        subLabel: 'Sign and broadcast a Magi transaction',
        href: '/tools/broadcast'
      }
    ]
  }
]

export default Navbar
