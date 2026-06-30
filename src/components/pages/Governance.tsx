import { Heading, Table, Skeleton, Badge, Link } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import PageNotFound from './404'
import Pagination from '../Pagination'
import { findGovernanceProposals } from '../../requests'
import { abbreviateHash, thousandSeperator, fmtmAmount } from '../../helpers'
import { PageTitle } from '../PageTitle'
import { AccountLink } from '../TableLink'
import { Tooltip } from '../ui/tooltip'

const PER_PAGE = 50

const Governance = () => {
  const { t } = useTranslation('pages')
  const { page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidPage = (page && isNaN(pageNumber)) || pageNumber < 1

  const {
    data: proposals,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: ['governance-proposals', pageNumber],
    queryFn: async () =>
      findGovernanceProposals({
        offset: (pageNumber - 1) * PER_PAGE,
        limit: PER_PAGE
      }),
    enabled: !invalidPage
  })

  if (invalidPage) return <PageNotFound />

  const showNextPage = proposals && proposals.length === PER_PAGE

  return (
    <>
      <PageTitle title={t('governance.title')} />
      <Heading as="h1" size="5xl" fontWeight="normal">
        {t('governance.title')}
      </Heading>
      <hr />
      <br />
      <Table.ScrollArea mb={'15px'}>
        <Table.Root variant={'line'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('governance.proposalId', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('governance.type', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('governance.status', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('governance.creationBlock', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('governance.beneficiary', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('governance.amount', { ns: 'tables' })}</Table.ColumnHeader>
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
            ) : isSuccess && proposals.length > 0 ? (
              proposals.map((proposal) => (
                <Table.Row key={proposal.proposalId}>
                  <Table.Cell>
                    <Link asChild>
                      <ReactRouterLink to={'/governance/proposal/' + proposal.proposalId}>
                        <Tooltip content={proposal.proposalId}>
                          {abbreviateHash(proposal.proposalId, 12, 8)}
                        </Tooltip>
                      </ReactRouterLink>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    {proposal.type === 'slash_restore' ? t('governance.typeSlashRestore') : t('governance.typeReservePayout')}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={proposal.status === 'open' ? 'blue' : proposal.status === 'applied' ? 'green' : 'gray'}>
                      {t('governance.status.' + proposal.status)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{thousandSeperator(proposal.creationBlock)}</Table.Cell>
                  <Table.Cell>
                    <AccountLink val={'hive:' + proposal.beneficiary} truncate={16} />
                  </Table.Cell>
                  <Table.Cell>{fmtmAmount(proposal.amount, 'HIVE')}</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={6} textAlign="center">
                  {t('governance.empty')}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Pagination
        path="/governance"
        currentPageNum={pageNumber}
        maxPageNum={showNextPage ? pageNumber + 1 : pageNumber}
      />
    </>
  )
}

export default Governance
