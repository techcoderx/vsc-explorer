import { Link, Skeleton, Table, Text } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TssCommitment } from '../../types/L2ApiResult'
import { abbreviateHash, timeAgo } from '../../helpers'
import { Tooltip } from '../ui/tooltip'
import { ContractLink } from '../TableLink'

export const TssCommitments = ({ commitments, isLoading }: { commitments?: TssCommitment[]; isLoading?: boolean }) => {
  const { t } = useTranslation('tables')
  return (
    <Table.ScrollArea my={'3'} w={'full'}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t('tssCommitments.txId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('tssCommitments.age')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('tssCommitments.type')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('tssCommitments.contractId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('tssCommitments.keyId')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('tssCommitments.publicKey')}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Row>
              {[...Array(6)].map((_, i) => (
                <Table.Cell key={i}>
                  <Skeleton height="20px" />
                </Table.Cell>
              ))}
            </Table.Row>
          ) : Array.isArray(commitments) ? (
            commitments.map((item, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Tooltip content={item.tx_id} positioning={{ placement: 'top' }}>
                    <Link asChild>
                      <ReactRouterLink to={'/tx/' + item.tx_id}>{abbreviateHash(item.tx_id, 20, 0)}</ReactRouterLink>
                    </Link>
                  </Tooltip>
                </Table.Cell>
                <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                  <Tooltip content={item.timestamp} positioning={{ placement: 'top' }}>
                    {timeAgo(item.timestamp)}
                  </Tooltip>
                </Table.Cell>
                <Table.Cell>{item.type}</Table.Cell>
                <Table.Cell>
                  <ContractLink val={item.key_id.split('-')[0]} />
                </Table.Cell>
                <Table.Cell>{item.key_id.split('-').slice(1).join('-')}</Table.Cell>
                <Table.Cell>
                  {item.public_key ? (
                    <Tooltip content={item.public_key} positioning={{ placement: 'top' }}>
                      <Text>{abbreviateHash(item.public_key)}</Text>
                    </Tooltip>
                  ) : (
                    <Text>-</Text>
                  )}
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
