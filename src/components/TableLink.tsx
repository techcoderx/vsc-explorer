import { ReactNode } from 'react'
import { HStack, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { abbreviateHash, validateHiveUsername } from '../helpers'
import { FaEthereum, FaHive, FaFileContract, FaNetworkWired } from 'react-icons/fa6'
import { Flairs } from '../flairs'
import { Tooltip } from './ui/tooltip'

type TableLinkParams = { val: string; ttVal?: string; truncate?: number; icon?: ReactNode }

const iconByAddr = (addr: string) => {
  if (addr.startsWith('hive:')) return <FaHive />
  else if (addr.startsWith('did:pkh:eip155:1:0x')) return <FaEthereum />
  else if (addr.startsWith('did:vsc:')) return <FaNetworkWired />
}

const rmPrefix = (addr: string) => {
  const sections = addr.split(':')
  return sections[sections.length - 1]
}

const TheLink = ({ val, ttVal, truncate, href, icon }: TableLinkParams & { href: string }) => {
  const display = ttVal ?? abbreviateHash(rmPrefix(val), truncate, 0)
  return (
    <Link asChild>
      <ReactRouterLink to={href}>
        <HStack gap={'1.5'}>
          {icon}
          <Tooltip content={val} positioning={{ placement: 'top' }}>
            {display}
          </Tooltip>
        </HStack>
      </ReactRouterLink>
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
  return <TheLink val={val} ttVal={Flairs[val]} truncate={truncate} href={href} icon={iconByAddr(val)} />
}

export const ContractLink = ({ val, truncate = 16 }: TableLinkParams) => {
  const id = val.replace('contract:', '')
  const href = '/contract/' + id
  return <TheLink val={val} ttVal={Flairs[id]} truncate={truncate} href={href} icon={<FaFileContract />} />
}
