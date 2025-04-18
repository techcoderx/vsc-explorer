import { Table, Tbody, Grid, GridItem, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import BitSet from 'bitset'
import TableRow from './TableRow'
import { WeightedMembers } from '../types/HafApiResult'

const getVotedMembers = (
  bv: string,
  members: WeightedMembers[],
  weights: number[]
): { votedMembers: WeightedMembers[]; votedWeight: number; totalWeight: number } => {
  const bs = BitSet.fromHexString(bv)
  const voted = []
  let votedWeight = 0
  let totalWeight = 0
  for (const m in members) {
    totalWeight += weights[m]
    if (bs.get(Number(m)) === 1) {
      voted.push(members[m])
      votedWeight += weights[m]
    }
  }
  return { votedMembers: voted, votedWeight, totalWeight }
}

const base64UrlToHex = (base64url: string) => {
  if (!base64url) return '0'
  // Convert base64url to standard base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if necessary
  const padLength = (4 - (base64.length % 4)) % 4
  base64 += '='.repeat(padLength)

  // Decode base64 to binary string
  const binaryString = atob(base64)

  // Convert each byte to hex
  let hex = ''
  for (let i = 0; i < binaryString.length; i++) {
    const byte = binaryString.charCodeAt(i)
    hex += byte.toString(16).padStart(2, '0')
  }

  return hex
}

const getBitsetStrFromHex = (bv: string) => {
  return BitSet.fromHexString(bv).toString(2)
}

const bitsGrid = (input: string, count?: number) => {
  if (count) {
    input = '0'.repeat(Math.max(0, count - input.length)) + input
  }
  let output = ''
  let spaceCount = 0

  for (let i = 0; i < input.length; i++) {
    output += input[i]

    // If this is an 8th character, add a space
    if ((i + 1) % 8 === 0) {
      output += ' '
      spaceCount++
    }

    // If we've added 8 spaces, add a newline and reset the space counter
    if (spaceCount === 8) {
      output += '\n'
      spaceCount = 0
    }
  }

  return output
}

export const ParticipatedMembers = ({
  bv,
  sig,
  members,
  weights
}: {
  bv: string
  sig: string
  members: WeightedMembers[]
  weights: number[]
}) => {
  const bvHex = base64UrlToHex(bv)
  const { votedMembers } = getVotedMembers(bvHex, members, weights)
  return (
    <Table>
      <Tbody>
        <TableRow overflowWrap={'normal'} whitespace={'pre'} label={'Aggregation Bits'}>
          {bitsGrid(getBitsetStrFromHex(bvHex), members.length)}
        </TableRow>
        <TableRow label={`Voted Members (${votedMembers.length})`}>
          <Grid
            templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)', 'repeat(5, 1fr)', 'repeat(6, 1fr)']}
            gap={3}
          >
            {votedMembers.map((m, i) => {
              return (
                <GridItem key={i}>
                  <Link as={ReactRouterLink} to={'/@' + m}>
                    {m.account}
                  </Link>
                </GridItem>
              )
            })}
          </Grid>
        </TableRow>
        <TableRow label="BLS Signature" value={sig} overflowWrap={'anywhere'} />
      </Tbody>
    </Table>
  )
}
