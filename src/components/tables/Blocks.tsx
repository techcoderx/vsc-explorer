import { Link, Skeleton, Table } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { Block } from '../../types/HafApiResult'
import { abbreviateHash, thousandSeperator, timeAgo } from '../../helpers'
import { ProgressBarPct } from '../ProgressPercent'
import { Tooltip } from '../ui/tooltip'

export const Blocks = ({ blocks, isLoading }: { blocks?: Block[]; isLoading?: boolean }) => {
  return (
    <Table.ScrollArea my={'3'} w={'full'}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Id</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Proposer</Table.ColumnHeader>
            <Table.ColumnHeader>Block Hash</Table.ColumnHeader>
            <Table.ColumnHeader>Voted</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Row>
              {[...Array(5)].map((_, i) => (
                <Table.Cell key={i}>
                  <Skeleton height="20px" />
                </Table.Cell>
              ))}
            </Table.Row>
          ) : Array.isArray(blocks) ? (
            blocks.map((item, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Link asChild>
                    <ReactRouterLink to={'/block/' + item.be_info.block_id}>
                      {thousandSeperator(item.be_info.block_id)}
                    </ReactRouterLink>
                  </Link>
                </Table.Cell>
                <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                  <Tooltip content={item.ts} positioning={{ placement: 'top' }}>
                    {timeAgo(item.ts)}
                  </Tooltip>
                </Table.Cell>
                <Table.Cell>
                  <Link asChild>
                    <ReactRouterLink to={'/address/hive:' + item.proposer}>
                      {item.proposer}
                    </ReactRouterLink>
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Tooltip content={item.block} positioning={{ placement: 'top' }}>
                    <Link asChild>
                      <ReactRouterLink to={'/block/' + item.be_info.block_id}>
                        {abbreviateHash(item.block)}
                      </ReactRouterLink>
                    </Link>
                  </Tooltip>
                </Table.Cell>
                <Table.Cell maxW={'200px'}>
                  <ProgressBarPct val={(item.be_info.voted_weight / item.be_info.eligible_weight) * 100} />
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row></Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
