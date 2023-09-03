import { Tr, Td, Skeleton, Link } from '@chakra-ui/react'
import { ReactNode } from 'react'

const cardBorder = '0.75px solid grey'

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
  <Tr borderTop={isInCard ? cardBorder : 'unset'} borderBottom={isInCard ? cardBorder : 'unset'} borderLeft={allCardBorders ? cardBorder : 'unset'} borderRight={allCardBorders ? cardBorder : 'unset'}>
    <Td fontWeight='bold'>{label}</Td>
    <Td>{isLoading ? <Skeleton height='20px'/> : (children ? children : (link ? <Link href={link} target='_blank'>{value}</Link> : value))}</Td>
  </Tr>
)

export default TableRow