import { ReactNode } from 'react'
import { HStack, Link, Tooltip } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { abbreviateHash, validateHiveUsername } from '../helpers'
import { FaEthereum, FaHive, FaFileContract } from 'react-icons/fa6'
import { Flairs } from '../flairs'

type TableLinkParams = { val: string; ttVal?: string; truncate?: number; icon?: ReactNode }

const iconByAddr = (addr: string) => {
  if (addr.startsWith('hive:')) return <FaHive />
  else if (addr.startsWith('did:pkh:eip155:1:0x')) return <FaEthereum />
}

const rmPrefix = (addr: string) => {
  const sections = addr.split(':')
  return sections[sections.length - 1]
}

const TheLink = ({ val, ttVal, truncate, href, icon }: TableLinkParams & { href: string }) => {
  const display = ttVal ?? abbreviateHash(rmPrefix(val), truncate, 0)
  return (
    <Link as={ReactRouterLink} to={href}>
      <HStack gap={'1.5'}>
        {icon}
        <Tooltip label={val} placement={'top'}>
          {display}
        </Tooltip>
      </HStack>
    </Link>
  )
}

export const TxLink = ({ val, truncate = 15 }: TableLinkParams) => {
  const href = '/tx/' + val
  return <TheLink val={val} truncate={truncate} href={href} />
}

export const AccountLink = ({ val, truncate = 16 }: TableLinkParams) => {
  if (val.startsWith('contract:') || (val.startsWith('vsc') && validateHiveUsername(val) !== null))
    return <ContractLink val={val} truncate={truncate} />
  const href = `/address/${val}`
  return <TheLink val={val} truncate={truncate} href={href} icon={iconByAddr(val)} />
}

export const ContractLink = ({ val, truncate = 16 }: TableLinkParams) => {
  const id = val.replace('contract:', '')
  const href = '/contract/' + id
  return <TheLink val={val} ttVal={Flairs[val]} truncate={truncate} href={href} icon={<FaFileContract />} />
}
