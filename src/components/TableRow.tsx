import { Tr, Td, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { ReactNode } from 'react'

const cardBorder = '1px solid rgb(255,255,255,0.16)'
const cardBorderLight = '1px solid #e2e8f0'

type TableRowProps = {
  label: string
  value?: string | number | undefined
  children?: ReactNode
  isLoading: boolean
  link?: string
  isInCard?: boolean
  allCardBorders?: boolean
}

const TableRow = ({label, value, link, isLoading, children, isInCard = false, allCardBorders = false}: TableRowProps) => (
  <Tr _dark={{
    borderTop: isInCard ? cardBorder : 'unset',
    borderBottom: isInCard ? cardBorder : 'unset',
    borderLeft: allCardBorders ? cardBorder : 'unset',
    borderRight: allCardBorders ? cardBorder : 'unset'
  }} _light={{
    borderTop: isInCard ? cardBorderLight : 'unset',
    borderBottom: isInCard ? cardBorderLight : 'unset',
    borderLeft: allCardBorders ? cardBorderLight : 'unset',
    borderRight: allCardBorders ? cardBorderLight : 'unset'
  }}>
    <Td fontWeight='bold'>{label}</Td>
    <Td>{isLoading ? <Skeleton height='20px'/> : (children ? children : (link ? <Link as={ReactRouterLink} to={link} target={!link.startsWith('/')?'_blank':'_self'}>{value}</Link> : value))}</Td>
  </Tr>
)

export default TableRow