import { Heading, Table, Skeleton, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useNftRegistry } from '../../../hasuraRequests'
import { timeAgo } from '../../../helpers'
import { PageTitle } from '../../PageTitle'
import { AccountLink, ContractLink } from '../../TableLink'
import { Tooltip } from '../../ui/tooltip'

const NftList = () => {
  const { t } = useTranslation(['pages', 'tables'])
  const { nfts, isLoading } = useNftRegistry()
  return (
    <>
      <PageTitle title={t('nfts.title', { ns: 'pages' })} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('nfts.title', { ns: 'pages' })}</Heading>
      <hr />
      <Table.ScrollArea marginTop={'15px'}>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('nfts.name', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.symbol', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.contractId', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.owner', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('nfts.age', { ns: 'tables' })}</Table.ColumnHeader>
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
            ) : nfts?.length ? (
              nfts.map((nft, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Link asChild fontWeight="medium">
                      <ReactRouterLink to={`/nfts/${nft.contract_id}`}>{nft.name}</ReactRouterLink>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{nft.symbol}</Table.Cell>
                  <Table.Cell>
                    <ContractLink val={nft.contract_id} truncate={20} />
                  </Table.Cell>
                  <Table.Cell>
                    <AccountLink val={nft.owner} />
                  </Table.Cell>
                  <Table.Cell css={{ whiteSpace: 'nowrap' }}>
                    <Tooltip content={nft.init_ts} positioning={{ placement: 'top' }}>
                      {timeAgo(nft.init_ts)}
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={5}>{t('nfts.noNfts', { ns: 'pages' })}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}

export default NftList
