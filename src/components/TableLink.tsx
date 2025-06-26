import { Link, Tooltip } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { abbreviateHash, validateHiveUsername } from '../helpers'

type TableLinkParams = { val: string; tooltip?: boolean; truncate?: number }

const TheLink = ({ val, tooltip, truncate, href }: TableLinkParams & { href: string }) => {
  const display = abbreviateHash(val, truncate, 0)
  return (
    <Link as={ReactRouterLink} to={href}>
      {tooltip ? (
        <Tooltip label={val} placement={'top'}>
          {display}
        </Tooltip>
      ) : (
        display
      )}
    </Link>
  )
}

export const TxLink = ({ val, tooltip, truncate = 15 }: TableLinkParams) => {
  const href = '/tx/' + val
  return <TheLink val={val} tooltip={tooltip} truncate={truncate} href={href} />
}

export const AccountLink = ({ val, tooltip, truncate = 20 }: TableLinkParams) => {
  if (val.startsWith('vsc') && validateHiveUsername(val) !== null)
    return <ContractLink val={val} tooltip={tooltip} truncate={truncate} />
  const href = `/address/${val}`
  return <TheLink val={val} tooltip={tooltip} truncate={truncate} href={href} />
}

export const ContractLink = ({ val, tooltip, truncate = 20 }: TableLinkParams) => {
  const href = '/contract/' + val
  return <TheLink val={val} tooltip={tooltip} truncate={truncate} href={href} />
}
