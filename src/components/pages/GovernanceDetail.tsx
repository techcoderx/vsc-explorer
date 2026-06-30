import { Heading, Text, Table, Badge, Box } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import PageNotFound from './404'
import { findGovernanceProposals } from '../../requests'
import { fmtmAmount, thousandSeperator } from '../../helpers'
import TableRow from '../TableRow'
import { PageTitle } from '../PageTitle'
import { AccountLink, TxLink } from '../TableLink'

const GovernanceDetail = () => {
  const { t } = useTranslation('pages')
  const { proposalId } = useParams()

  const {
    data: proposals,
    isLoading,
    isError,
    isSuccess
  } = useQuery({
    queryKey: ['governance-proposal', proposalId],
    queryFn: async () =>
      findGovernanceProposals({
        byProposalId: proposalId
      }),
    enabled: !!proposalId
  })

  if (!proposalId) return <PageNotFound />

  const proposal = proposals?.[0]
  const notFound = isSuccess && !proposal

  return (
    <>
      <PageTitle title={proposal ? t('governanceDetail.title', { id: proposal.proposalId }) : t('governanceDetail.titleFallback')} />
      <Heading as="h1" size="5xl" fontWeight="normal">
        {t('governanceDetail.title')}
      </Heading>
      <hr />

      {isError ? (
        <Text mt="3">{t('governanceDetail.loadError')}</Text>
      ) : notFound ? (
        <Text mt="3">{t('governanceDetail.notFound')}</Text>
      ) : (
        proposal && (
          <Box>
            <Table.Root mt="20px">
              <Table.Body>
                <TableRow label={t('governanceDetail.proposalId')} value={proposal.proposalId} isLoading={isLoading} />
                <TableRow label={t('governanceDetail.type')} isLoading={isLoading}>
                  {proposal.type === 'slash_restore' ? t('governance.typeSlashRestore') : t('governance.typeReservePayout')}
                </TableRow>
                <TableRow label={t('governanceDetail.status')} isLoading={isLoading}>
                  <Badge
                    colorPalette={proposal.status === 'open' ? 'blue' : proposal.status === 'applied' ? 'green' : 'gray'}
                  >
                    {t('governance.status.' + proposal.status)}
                  </Badge>
                </TableRow>
                <TableRow label={t('governanceDetail.creationBlock')} value={thousandSeperator(proposal.creationBlock)} isLoading={isLoading} />
                <TableRow label={t('governanceDetail.beneficiary')} isLoading={isLoading}>
                  <AccountLink val={'hive:' + proposal.beneficiary} truncate={16} />
                </TableRow>
                <TableRow label={t('governanceDetail.amount')} value={fmtmAmount(proposal.amount, 'HIVE')} isLoading={isLoading} />

                {proposal.status === 'applied' && (
                  <>
                    <TableRow
                      label={t('governanceDetail.appliedBlock')}
                      value={proposal.appliedBlock ? thousandSeperator(proposal.appliedBlock) : '-'}
                      isLoading={isLoading}
                    />
                    <TableRow
                      label={t('governanceDetail.appliedTxId')}
                      value={proposal.appliedTxId || '-'}
                      isLoading={isLoading}
                      link={proposal.appliedTxId ? '/tx/' + proposal.appliedTxId : undefined}
                    />
                  </>
                )}

                {proposal.type === 'slash_restore' && (
                  <>
                    <TableRow
                      label={t('governanceDetail.slashTxId')}
                      value={proposal.slashTxId || '-'}
                      isLoading={isLoading}
                      link={proposal.slashTxId ? '/tx/' + proposal.slashTxId : undefined}
                    />
                    <TableRow label={t('governanceDetail.evidenceKind')} value={proposal.evidenceKind || '-'} isLoading={isLoading} />
                    <TableRow label={t('governanceDetail.slashedAccount')} isLoading={isLoading}>
                      {proposal.slashedAccount ? (
                        <AccountLink val={'hive:' + proposal.slashedAccount} truncate={16} />
                      ) : (
                        '-'
                      )}
                    </TableRow>
                  </>
                )}

                {proposal.type === 'reserve_payout' && (
                  <>
                    <TableRow label={t('governanceDetail.recipient')} isLoading={isLoading}>
                      {proposal.recipient ? (
                        <AccountLink val={'hive:' + proposal.recipient} truncate={16} />
                      ) : (
                        '-'
                      )}
                    </TableRow>
                    <TableRow label={t('governanceDetail.reason')} value={proposal.reason || '-'} isLoading={isLoading} />
                  </>
                )}
              </Table.Body>
            </Table.Root>

            {proposal.votes.length > 0 && (
              <>
                <Heading as="h2" size="lg" mt="8" mb="3">
                  {t('governanceDetail.votes', { count: proposal.votes.length })}
                </Heading>
                <Table.ScrollArea>
                  <Table.Root variant="line">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>{t('governanceDetail.voter')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('governanceDetail.txId')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('governanceDetail.blockHeight')}</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {proposal.votes.map((vote, i) => (
                        <Table.Row key={i}>
                          <Table.Cell>
                            <AccountLink val={'hive:' + vote.voter} truncate={16} />
                          </Table.Cell>
                          <Table.Cell>
                            <TxLink val={vote.txId} />
                          </Table.Cell>
                          <Table.Cell>
                            <ReactRouterLink to={'/block/' + vote.blockHeight}>
                              {thousandSeperator(vote.blockHeight)}
                            </ReactRouterLink>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              </>
            )}
          </Box>
        )
      )}
    </>
  )
}

export default GovernanceDetail
