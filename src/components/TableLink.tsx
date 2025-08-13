import { ReactNode } from 'react'
import { HStack, Link, Tooltip } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { abbreviateHash, validateHiveUsername } from '../helpers'
import { FaEthereum, FaHive, FaFileContract } from 'react-icons/fa6'

type TableLinkParams = { val: string; tooltip?: boolean; truncate?: number; icon?: ReactNode }

const iconByAddr = (addr: string) => {
  if (addr.startsWith('hive:')) return <FaHive />
  else if (addr.startsWith('did:pkh:eip155:1:0x')) return <FaEthereum />
}

const rmPrefix = (addr: string) => {
  return addr.replace('hive:', '').replace('did:pkh:eip155:1:', '')
}

const TheLink = ({ val, truncate, href, icon }: TableLinkParams & { href: string }) => {
  const display = abbreviateHash(rmPrefix(val), truncate, 0)
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

export const TxLink = ({ val, tooltip, truncate = 15 }: TableLinkParams) => {
  const href = '/tx/' + val
  return <TheLink val={val} tooltip={tooltip} truncate={truncate} href={href} />
}

export const AccountLink = ({ val, tooltip, truncate = 16 }: TableLinkParams) => {
  if (val.startsWith('contract:') || (val.startsWith('vsc') && validateHiveUsername(val) !== null))
    return <ContractLink val={val} tooltip={tooltip} truncate={truncate} />
  const href = `/address/${val}`
  return <TheLink val={val} tooltip={tooltip} truncate={truncate} href={href} icon={iconByAddr(val)} />
}

export const ContractLink = ({ val, tooltip, truncate = 16 }: TableLinkParams) => {
  const href = '/contract/' + val.replace('contract:', '')
  return <TheLink val={val} tooltip={tooltip} truncate={truncate} href={href} icon={<FaFileContract />} />
}
