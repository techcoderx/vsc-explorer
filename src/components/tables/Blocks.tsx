import { Link, Skeleton, Table, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { Block } from '../../types/HafApiResult'
import { abbreviateHash, thousandSeperator, timeAgo } from '../../helpers'
import { ProgressBarPct } from '../ProgressPercent'

export const Blocks = ({ blocks, isLoading }: { blocks?: Block[]; isLoading?: boolean }) => {
  return (
    <TableContainer my={'3'} w={'full'}>
      <Table>
        <Thead>
          <Tr>
            <Th>Id</Th>
            <Th>Age</Th>
            <Th>Proposer</Th>
            <Th>Block Hash</Th>
            <Th>Voted</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            <Tr>
              {[...Array(5)].map((_, i) => (
                <Td key={i}>
                  <Skeleton height="20px" />
                </Td>
              ))}
            </Tr>
          ) : Array.isArray(blocks) ? (
            blocks.map((item, i) => (
              <Tr key={i}>
                <Td>
                  <Link as={ReactRouterLink} to={'/block/' + item.be_info.block_id}>
                    {thousandSeperator(item.be_info.block_id)}
                  </Link>
                </Td>
                <Td sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip label={item.ts} placement="top">
                    {timeAgo(item.ts)}
                  </Tooltip>
                </Td>
                <Td>
                  <Link as={ReactRouterLink} to={'/address/hive:' + item.proposer}>
                    {item.proposer}
                  </Link>
                </Td>
                <Td>
                  <Tooltip label={item.block} placement="top">
                    <Link as={ReactRouterLink} to={'/block/' + item.be_info.block_id}>
                      {abbreviateHash(item.block)}
                    </Link>
                  </Tooltip>
                </Td>
                <Td maxW={'200px'}>
                  <ProgressBarPct val={(item.be_info.voted_weight / item.be_info.eligible_weight) * 100} />
                </Td>
              </Tr>
            ))
          ) : (
            <Tr></Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
