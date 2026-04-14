import { Heading, Table, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useTokenRegistry } from '../../../hasuraRequests'
import { timeAgo } from '../../../helpers'
import { PageTitle } from '../../PageTitle'
import { AccountLink, ContractLink } from '../../TableLink'
import { Tooltip } from '../../ui/tooltip'

const TokenList = () => {
  const { t } = useTranslation(['pages', 'tables'])
  const { tokens, isLoading } = useTokenRegistry()
  return (
    <>
      <PageTitle title={t('tokens.title', { ns: 'pages' })} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('tokens.title', { ns: 'pages' })}</Heading>
      <hr />
      <Table.ScrollArea marginTop={'15px'}>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('tokens.name', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.symbol', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.contractId', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.decimals', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.maxSupply', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.owner', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('tokens.age', { ns: 'tables' })}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                {[...Array(7)].map((_, i) => (
                  <Table.Cell key={i}>
                    <Skeleton height="20px" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ) : tokens?.length ? (
              tokens.map((token, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Link asChild fontWeight="medium">
                      <ReactRouterLink to={`/token/${token.contract_id}`}>{token.name}</ReactRouterLink>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{token.symbol}</Table.Cell>
                  <Table.Cell>
                    <ContractLink val={token.contract_id} truncate={20} />
                  </Table.Cell>
                  <Table.Cell>{token.decimals}</Table.Cell>
                  <Table.Cell>{token.max_supply}</Table.Cell>
                  <Table.Cell>
                    <AccountLink val={token.owner} />
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={token.init_ts} positioning={{ placement: 'top' }}>
                      {timeAgo(token.init_ts)}
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={7}>{t('tokens.noTokens', { ns: 'pages' })}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}

export default TokenList
