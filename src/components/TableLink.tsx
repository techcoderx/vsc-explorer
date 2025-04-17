import { Link, Tooltip } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { abbreviateHash } from '../helpers'

type TableLinkParams = { val: string; tooltip?: boolean; truncate?: number }

const TheLink = ({ val, truncate, href }: TableLinkParams & { href: string }) => {
  return (
    <Link as={ReactRouterLink} to={href}>
      {abbreviateHash(val, truncate, 0)}
    </Link>
  )
}

export const TxLink = ({ val, tooltip, truncate = 15 }: TableLinkParams) => {
  const href = '/tx/' + val
  return tooltip ? (
    <Tooltip label={val} placement={'top'}>
      <TheLink val={val} truncate={truncate} href={href} />
    </Tooltip>
  ) : (
    <TheLink val={val} truncate={truncate} href={href} />
  )
}

export const AccountLink = ({ val, tooltip, truncate = 20 }: TableLinkParams) => {
  const href = !val.startsWith('did:') ? `/@${val.replace('hive:', '')}` : `/address/${val}`
  return tooltip ? (
    <Tooltip label={val} placement={'top'}>
      <TheLink val={val} truncate={truncate} href={href} />
    </Tooltip>
  ) : (
    <TheLink val={val} truncate={truncate} href={href} />
  )
}
