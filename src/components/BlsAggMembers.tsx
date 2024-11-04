import { Table, Tbody, Grid, GridItem, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import TableRow from './TableRow'
import { bitsGrid, getBitsetStrFromHex } from '../helpers'

export const ParticipatedMembers = ({
  bvHex,
  sig,
  members,
  isLoading
}: {
  bvHex: string
  sig: string
  members: string[]
  isLoading: boolean
}) => {
  return (
    <Table>
      <Tbody>
        <TableRow overflowWrap={'normal'} whitespace={'pre'} label={'Aggregation Bits'}>
          {bitsGrid(getBitsetStrFromHex(bvHex))}
        </TableRow>
        <TableRow label={`Voted Members (${members.length})`}>
          <Grid
            templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
            gap={3}
          >
            {members.map((m, i) => {
              return (
                <GridItem key={i}>
                  <Link as={ReactRouterLink} to={'/@' + m}>
                    {m}
                  </Link>
                </GridItem>
              )
            })}
          </Grid>
        </TableRow>
        <TableRow label="BLS Signature" value={'0x' + sig} isLoading={isLoading} overflowWrap={'anywhere'} />
      </Tbody>
    </Table>
  )
}
