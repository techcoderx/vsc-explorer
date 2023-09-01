import { Tr, Td, Skeleton, Link } from '@chakra-ui/react'

type TableRowProps = {
  label: string
  value?: string | number | undefined
  isLoading: boolean
  link?: string
}

const TableRow = ({label, value, link, isLoading}: TableRowProps) => (
  <Tr>
    <Td fontWeight='bold'>{label}</Td>
    <Td>{isLoading ? <Skeleton height='20px'/> : (link ? <Link href={link} target='_blank'>{value}</Link> : value)}</Td>
  </Tr>
)

export default TableRow