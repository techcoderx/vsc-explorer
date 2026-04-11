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
import { LuMenu, LuX, LuChevronDown, LuChevronRight, LuMoon, LuSun, LuSettings } from 'react-icons/lu'
import { Link as ReactRouterLink, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { getConf, themeColor, themeColorScheme, themeColorULight } from '../settings'
import SearchBar from './SearchBar'
import { useColorMode, useColorModeValue } from './ui/color-mode'
import { useBgTheme } from '../hooks/useBgTheme'
import { useState } from 'react'

const Navbar = () => {
  const { t } = useTranslation('nav')
  const { colorMode, toggleColorMode } = useColorMode()
  const { bgTheme } = useBgTheme()
  const isThemed = bgTheme !== 'default'
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen((v) => !v)
  const defaultNavBg = useColorModeValue('gray.100', 'gray.900')
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.900')
  const defaultBtnBg = useColorModeValue('gray.200', 'gray.800')

  return (
    <Box as="header">
      <Box asChild position="absolute" top="-40px" left="0" bg={themeColor} color="white" p="2" zIndex="9999" _focus={{ top: '0' }}>
        <a href="#main-content">{t('skipToMain', { ns: 'common' })}</a>
      </Box>
      <Flex
        bg={isThemed ? 'var(--magi-surface)' : defaultNavBg}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={isThemed ? 'var(--magi-border)' : defaultBorderColor}
        align={'center'}
      >
        <Flex flex={{ base: 1, md: 'auto' }} ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
          <IconButton onClick={onToggle} variant={'ghost'} aria-label={t('toggleNav')}>
            {isOpen ? <LuX size={12} /> : <LuMenu size={20} />}
          </IconButton>
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align={'center'} gap={'2'}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
          >
            <ReactRouterLink to="/">{t('magiBlocks')}</ReactRouterLink>
          </Text>

          {getConf().netId === 'vsc-testnet' && (
            <Tag.Root size={'sm'} variant={'outline'} colorPalette={themeColorScheme}>
              {t('testnet')}
            </Tag.Root>
          )}

          <Flex display={{ base: 'none', md: 'flex' }} ml={3} as="nav" aria-label="Main navigation">
            <DesktopNav isThemed={isThemed} t={t} />
          </Flex>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify={'flex-end'} direction={'row'} gap={3}>
          <Box width={{ base: 'fit-content', lg: '270px' }}>
            <SearchBar miniBtn={useBreakpointValue({ base: true, lg: false })} />
          </Box>
          <Button
            variant={'subtle'}
            colorPalette={'gray'}
            bg={isThemed ? 'var(--magi-surface-hover)' : defaultBtnBg}
            onClick={toggleColorMode}
            aria-label={t('switchColorTheme')}
          >
            {colorMode === 'light' ? <LuMoon /> : <LuSun />}
          </Button>
          <Box asChild>
            <ReactRouterLink to="/settings">
              <Button variant={'subtle'} colorPalette={'gray'} bg={isThemed ? 'var(--magi-surface-hover)' : defaultBtnBg} aria-label={t('settings')}>
                <LuSettings />
              </Button>
            </ReactRouterLink>
          </Box>
        </Stack>
      </Flex>

      <Collapsible.Root open={isOpen}>
        <Collapsible.Content>
          <Box as="nav" aria-label="Mobile navigation">
            <MobileNav isThemed={isThemed} t={t} />
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>

      <Container as="main" id="main-content" width={'100%'} maxW={'8xl'} marginTop={'15px'} marginBottom={'40px'}>
        <Outlet />
      </Container>
    </Box>
  )
}

const getNavItems = (t: TFunction): NavItem[] => [
  {
    label: t('witnesses'),
    children: [
      { label: t('overview'), subLabel: t('overviewSub'), href: '/witnesses' },
      { label: t('elections'), subLabel: t('electionsSub'), href: '/elections' },
      { label: t('multisigAccount'), subLabel: t('multisigAccountSub'), href: '/address/hive:' + getConf().msAccount + '/hiveops' },
      { label: t('schedule'), subLabel: t('scheduleSub'), href: '/schedule' }
    ]
  },
  {
    label: t('blockchain'),
    children: [
      { label: t('blocks'), subLabel: t('blocksSub'), href: '/blocks' },
      { label: t('transactions'), subLabel: t('transactionsSub'), href: '/transactions' },
      { label: t('contracts'), subLabel: t('contractsSub'), href: '/contracts' }
    ]
  },
  { label: t('nam'), href: '/bridge/hive' },
  { label: t('charts'), href: '/charts' },
  {
    label: t('tools'),
    children: [
      { label: t('verifyContract'), subLabel: t('verifyContractSub'), href: '/tools/verify/contract' },
      { label: t('dagInspector'), subLabel: t('dagInspectorSub'), href: '/tools/dag' },
      { label: t('broadcastTransaction'), subLabel: t('broadcastTransactionSub'), href: '/tools/broadcast' }
    ]
  }
]

const DesktopNav = ({ isThemed, t }: { isThemed: boolean; t: TFunction }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const defaultPopoverBg = useColorModeValue('white', 'gray.800')
  const popoverContentBgColor = isThemed ? 'var(--magi-popover)' : defaultPopoverBg
  const navItems = getNavItems(t)

  return (
    <Stack direction={'row'} gap={4}>
      {navItems.map((navItem) => (
        <Box key={navItem.label}>
          <Popover.Root positioning={{ placement: 'bottom-start' }}>
            <Popover.Trigger asChild>
              <Box
                asChild={!!navItem.href}
                p={2}
                fontSize={'md'}
                fontWeight={500}
                color={linkColor}
                cursor={'pointer'}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor
                }}
              >
                {navItem.href ? <ReactRouterLink to={navItem.href}>{navItem.label}</ReactRouterLink> : navItem.label}
              </Box>
            </Popover.Trigger>

            {navItem.children && (
              <Popover.Positioner>
                <Popover.Content border={0} boxShadow={'xl'} bg={popoverContentBgColor} p={4} rounded={'xl'} minW={'sm'}>
                  <Stack>
                    {navItem.children.map((child) => (
                      <DesktopSubNav key={child.label} {...child} isThemed={isThemed} />
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

const DesktopSubNav = ({ label, href, subLabel, isThemed }: NavItem & { isThemed: boolean }) => {
  const defaultHoverBg = useColorModeValue(themeColorULight, 'gray.900')
  return (
    <Box role={'group'} display={'block'} p={2} rounded={'md'} _hover={{ bg: isThemed ? 'var(--magi-surface-hover)' : defaultHoverBg }} _focusWithin={{ outline: 'none' }}>
      <ReactRouterLink to={href ?? '#'} style={{ outline: 'none' }}>
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

const MobileNav = ({ isThemed, t }: { isThemed: boolean; t: TFunction }) => {
  const defaultBg = useColorModeValue('gray.100', 'gray.900')
  const navItems = getNavItems(t)
  return (
    <Stack bg={isThemed ? 'var(--magi-surface)' : defaultBg} px={5} display={{ md: 'none' }}>
      {navItems.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen((v) => !v)
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const borderColorVal = useColorModeValue('gray.200', 'gray.700')

  return (
    <Stack gap={0}>
      {children ? (
        <Box
          asChild
          py={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          background="none"
          border="none"
          cursor="pointer"
          aria-expanded={isOpen}
          focusRing="none"
        >
          <button type="button" onClick={onToggle}>
            <HStack>
              <Text fontWeight={600} color={textColor}>
                {label}
              </Text>
              <Box
                as={LuChevronDown}
                transition={'all .25s ease-in-out'}
                transform={isOpen ? 'rotate(180deg)' : ''}
                w={6}
                h={6}
              />
            </HStack>
          </button>
        </Box>
      ) : (
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
              <Text fontWeight={600} color={textColor}>
                {label}
              </Text>
            </HStack>
          </ReactRouterLink>
        </Box>
      )}

      {children && (
        <Collapsible.Root open={isOpen}>
          <Collapsible.Content style={{ marginTop: '0!important' }}>
            <Stack
              mt={0}
              pl={4}
              borderLeft={1}
              borderStyle={'solid'}
              borderColor={borderColorVal}
              align={'start'}
            >
              {children.map((child) => (
                <Box asChild key={child.label} py={2}>
                  <ReactRouterLink to={child.href ?? '#'}>{child.label}</ReactRouterLink>
                </Box>
              ))}
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </Stack>
  )
}

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}

export default Navbar
