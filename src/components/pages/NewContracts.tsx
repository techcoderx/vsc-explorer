import { Heading, Table, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { abbreviateHash, timeAgo } from '../../helpers'
import { useContracts } from '../../requests'
import { PageTitle } from '../PageTitle'
import { AccountLink, ContractLink } from '../TableLink'
import { Tooltip } from '../ui/tooltip'

const NewContracts = () => {
  const { contracts, isLoading } = useContracts({})
  return (
    <>
      <PageTitle title="Latest Contracts" />
      <Heading as="h1" size="5xl" fontWeight="normal">Latest Contracts</Heading>
      <hr />
      <Table.ScrollArea marginTop={'15px'}>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Contract Id</Table.ColumnHeader>
              <Table.ColumnHeader>Age</Table.ColumnHeader>
              <Table.ColumnHeader>Creator</Table.ColumnHeader>
              <Table.ColumnHeader>Creation Tx</Table.ColumnHeader>
              <Table.ColumnHeader>Code</Table.ColumnHeader>
              <Table.ColumnHeader>Runtime</Table.ColumnHeader>
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
            ) : !!contracts ? (
              contracts.map((item, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <ContractLink val={item.id} truncate={20} />
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={item.creation_ts} positioning={{ placement: 'top' }}>
                      {timeAgo(item.creation_ts)}
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>
                    <AccountLink val={item.creator} />
                  </Table.Cell>
                  <Table.Cell>
                    <Tooltip content={item.tx_id} positioning={{ placement: 'top' }}>
                      <Link asChild>
                        <ReactRouterLink to={'/tx/' + item.tx_id}>
                          {abbreviateHash(item.tx_id, 15, 0)}
                        </ReactRouterLink>
                      </Link>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>
                    <Tooltip content={item.code} positioning={{ placement: 'top' }}>
                      {abbreviateHash(item.code)}
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>{item.runtime}</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row></Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}

export default NewContracts
