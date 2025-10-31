import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  HStack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Container,
  useColorModeValue,
  useColorMode,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronRightIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Link as ReactRouterLink, Outlet } from 'react-router'
import { multisigAccount, themeColor, themeColorULight } from '../settings'
import SearchBar from './SearchBar'

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
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
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
          >
            <ReactRouterLink to="/">Magi Blocks</ReactRouterLink>
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify={'flex-end'} direction={'row'} spacing={3}>
          <Box width={{ base: 'fit-content', lg: '270px' }}>
            <SearchBar miniBtn={useBreakpointValue({ base: true, lg: false })} />
          </Box>
          <Button onClick={toggleColorMode} aria-label={'Switch color theme'}>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>

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
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Box
                as={ReactRouterLink}
                to={navItem.href ?? '#'}
                p={2}
                fontSize={'md'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor
                }}
              >
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent border={0} boxShadow={'xl'} bg={popoverContentBgColor} p={4} rounded={'xl'} minW={'sm'}>
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
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
            <Text fontSize={'sm'}>{subLabel}</Text>
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
            <Icon color={themeColor} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </ReactRouterLink>
    </Box>
  )
}

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} px={5} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={0} onClick={children && onToggle}>
      <Box
        py={3}
        as={ReactRouterLink}
        to={href ?? '#'}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none'
        }}
      >
        <HStack>
          <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
            {label}
          </Text>
          {children && (
            <Icon
              as={ChevronDownIcon}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={6}
              h={6}
            />
          )}
        </HStack>
      </Box>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
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
              <Box as={ReactRouterLink} key={child.label} py={2} to={child.href}>
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
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
        href: '/address/hive:' + multisigAccount + '/hiveops'
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
      // {
      //   label: 'Broadcast Transaction',
      //   subLabel: 'Sign and broadcast a Magi transaction'
      // },
      {
        label: 'Verify Contract',
        subLabel: 'Submit contract source code for verification',
        href: '/tools/verify/contract'
      },
      {
        label: 'DAG Inspector',
        subLabel: 'View a DAG by CID pinned by nodes',
        href: '/tools/dag'
      }
    ]
  }
]

export default Navbar
