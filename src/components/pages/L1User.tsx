import {
  Text,
  Flex,
  Heading,
  Card,
  CardHeader,
  CardBody,
  VStack,
  Tooltip,
  Badge,
  Link,
  Table,
  Tbody,
  Tag,
  Stack
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router'
import PageNotFound from './404'
import {
  fetchAccHistory,
  fetchL1AccInfo,
  fetchL1Rest,
  fetchWitness,
  fetchWitnessStat,
  getL2BalanceByL1User
} from '../../requests'
import { describeL1TxBriefly, fmtmAmount, thousandSeperator, timeAgo } from '../../helpers'
import { TxCard } from '../TxCard'
import TableRow from '../TableRow'
import Pagination from '../Pagination'
import { L1Accs as L1AccFlairs } from '../../flairs'
import { L1AccountAuthority } from '../../types/L1ApiResult'
import { themeColorScheme } from '../../settings'
import { AddressRcInfo } from './address/RcInfo'

const count = 50

const L1User = () => {
  const { username, page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidParams = !username || !username.startsWith('@') || isNaN(pageNumber) || pageNumber < 1
  const user = !invalidParams ? username.replace('@', '') : ''
  const { data: l1Acc, isError: isL1AccErr } = useQuery({
    queryKey: ['hive-account', username],
    queryFn: async () => fetchL1Rest<L1AccountAuthority>(`/hafbe-api/accounts/${user}/authority`),
    enabled: !invalidParams
  })
  const { data: witness, isSuccess: isWitSuccess } = useQuery({
    queryKey: ['vsc-witness', username],
    queryFn: async () => fetchWitness(user),
    enabled: !invalidParams
  })
  const { data: witnessStats, isSuccess: isWitStatsSuccess } = useQuery({
    queryKey: ['vsc-witness-stats', username],
    queryFn: async () => fetchWitnessStat(user),
    enabled: !invalidParams
  })
  const {
    data: l1Accv,
    isLoading: isL1AccvLoading,
    isSuccess: isL1AccvSuccess
  } = useQuery({
    queryKey: ['vsc-l1-account', username],
    queryFn: async () => fetchL1AccInfo(user),
    enabled: !invalidParams
  })
  const last_nonce = l1Accv ? Math.max(l1Accv.tx_count - (pageNumber - 1) * 50 - 1, 0) : undefined
  const {
    data: history,
    isLoading: isHistLoading,
    isSuccess: isHistSuccess,
    isError: isHistError
  } = useQuery({
    queryKey: ['vsc-l1-acc-history', username, last_nonce],
    queryFn: async () => fetchAccHistory(user, count, last_nonce),
    enabled: !!l1Accv && !invalidParams
  })
  const { data: l2Balance, isSuccess: isL2BalSuccess } = useQuery({
    queryKey: ['vsc-l2-balance-by-l1-user', user],
    queryFn: async () => getL2BalanceByL1User('hive:' + user!),
    enabled: !invalidParams
  })
  if (invalidParams) return <PageNotFound />
  return (
    <>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize={'5xl'} marginBottom="10px">
          {username}
        </Text>
        {/* Note: Wrap with another HStack when there are more than one flair */}
        {L1AccFlairs[user] ? (
          <Tag colorScheme={themeColorScheme} size={'lg'} variant={'outline'} alignSelf={'end'} mb={'3'}>
            {L1AccFlairs[user]}
          </Tag>
        ) : null}
      </Stack>
      <hr />
      {l1Acc && !l1Acc.owner ? (
        <Text fontSize={'xl'} margin={'10px 0px'}>
          Account does not exist
        </Text>
      ) : isL1AccErr && (!l1Accv || l1Accv.name !== user) ? (
        <Text fontSize={'xl'} margin={'10px 0px'}>
          Failed to fetch L1 Hive account
        </Text>
      ) : (
        <Flex direction={{ base: 'column', lg: 'row' }} marginTop="20px" gap="6">
          <VStack width={{ base: '100%', lg: 'ss' }} spacing={'6'}>
            <AddressRcInfo addr={'hive:' + user} />
            <Card width={'100%'}>
              <CardHeader marginBottom={'-15px'}>
                <Heading size={'md'} textAlign={'center'}>
                  L2 Balances
                </Heading>
              </CardHeader>
              <CardBody>
                <Table variant={'unstyled'}>
                  <Tbody>
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="HIVE Balance"
                      value={fmtmAmount(l2Balance?.hive || 0, 'HIVE')}
                      isLoading={!isL2BalSuccess}
                    />
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="Consensus Stake"
                      value={fmtmAmount(l2Balance?.hive_consensus || 0, 'HIVE')}
                      isLoading={!isL2BalSuccess}
                    />
                    {l2Balance && l2Balance.hive_unstaking ? (
                      <TableRow
                        isInCard
                        minimalSpace
                        minWidthLabel="115px"
                        label="Consensus Unstaking"
                        value={fmtmAmount(l2Balance.hive_unstaking, 'HIVE')}
                        isLoading={!isL2BalSuccess}
                      />
                    ) : null}
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="HBD Balance"
                      value={fmtmAmount(l2Balance?.hbd || 0, 'HBD')}
                      isLoading={!isL2BalSuccess}
                    />
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="HBD Staked"
                      value={fmtmAmount(l2Balance?.hbd_savings || 0, 'HBD')}
                      isLoading={!isL2BalSuccess}
                    />
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            {isWitSuccess && witness.id ? (
              <Card width={'100%'}>
                <CardHeader marginBottom={'-15px'}>
                  <Heading size={'md'} textAlign={'center'}>
                    VSC Witness
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Table variant={'unstyled'}>
                    <Tbody>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="ID" value={witness.id} />
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Peer ID">
                        <Text wordBreak={'break-all'}>{witness.peer_id}</Text>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Consensus DID Key">
                        <Text wordBreak={'break-all'}>{witness.consensus_did}</Text>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Gateway Key">
                        <Text wordBreak={'break-all'}>{witness.gateway_key}</Text>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Enabled">
                        {witness.enabled ? <Badge colorScheme="green">True</Badge> : <Badge colorScheme="red">False</Badge>}
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Last Update">
                        <Tooltip placement="top" label={witness.last_update_ts}>
                          <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/' + witness.last_update_tx}>
                            {timeAgo(witness.last_update_ts)}
                          </Link>
                        </Tooltip>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="First Seen">
                        <Tooltip placement="top" label={witness.first_seen_ts}>
                          <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/' + witness.first_seen_tx}>
                            {timeAgo(witness.first_seen_ts)}
                          </Link>
                        </Tooltip>
                      </TableRow>
                      {isWitStatsSuccess ? (
                        <>
                          <TableRow isInCard minimalSpace minWidthLabel="115px" label="Last Block">
                            <Link as={ReactRouterLink} to={witnessStats.last_block ? '/block/' + witnessStats.last_block : '#'}>
                              {thousandSeperator(witnessStats.last_block ?? 'N/A')}
                            </Link>
                          </TableRow>
                          <TableRow isInCard minimalSpace minWidthLabel="115px" label="Blocks Produced">
                            <Text>{thousandSeperator(witnessStats.block_count ?? 0)}</Text>
                          </TableRow>
                          <TableRow isInCard minimalSpace minWidthLabel="115px" label="Last Epoch">
                            <Link as={ReactRouterLink} to={witnessStats.last_epoch ? '/epoch/' + witnessStats.last_epoch : '#'}>
                              {thousandSeperator(witnessStats.last_epoch ?? 'N/A')}
                            </Link>
                          </TableRow>
                          <TableRow isInCard minimalSpace minWidthLabel="115px" label="Elections Held">
                            <Text>{thousandSeperator(witnessStats.election_count ?? 0)}</Text>
                          </TableRow>
                        </>
                      ) : null}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            ) : null}
            <Card width={'100%'}>
              <CardHeader marginBottom={'-15px'}>
                <Heading size={'md'} textAlign={'center'}>
                  L1 User Info
                </Heading>
              </CardHeader>
              <CardBody>
                <Table variant={'unstyled'}>
                  <Tbody>
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="Tx Count"
                      isLoading={isL1AccvLoading}
                      value={!!l1Acc ? thousandSeperator((l1Accv && l1Accv.tx_count) ?? 0) : 'Error'}
                    />
                    <TableRow isInCard minimalSpace minWidthLabel="115px" label="Last Activity" isLoading={isL1AccvLoading}>
                      {isL1AccvSuccess ? (
                        <Tooltip label={l1Accv.last_activity} placement={'top'}>
                          {l1Accv.last_activity === '1970-01-01T00:00:00' ? 'Never' : timeAgo(l1Accv.last_activity)}
                        </Tooltip>
                      ) : (
                        'Error'
                      )}
                    </TableRow>
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </VStack>
          <VStack spacing={'3'} flexGrow={'1'}>
            {isL1AccvLoading || isHistLoading ? (
              <Card width="100%">
                <CardBody>Loading VSC L1 transaction history...</CardBody>
              </Card>
            ) : null}
            {isHistError ? (
              <Card width="100%">
                <CardBody>Failed to load VSC L1 transaction history</CardBody>
              </Card>
            ) : null}
            {isHistSuccess ? (
              history.length === 0 ? (
                <Card width="100%">
                  <CardBody>There are no VSC L1 transactions for this account.</CardBody>
                </Card>
              ) : (
                history.map((itm, i) => (
                  <TxCard key={i} id={itm.id} ts={itm.ts} txid={itm.l1_tx}>
                    {describeL1TxBriefly(itm)}
                  </TxCard>
                ))
              )
            ) : null}
            {isHistSuccess && isL1AccvSuccess ? (
              <Pagination path={'/' + username} currentPageNum={pageNumber} maxPageNum={Math.ceil(l1Accv.tx_count / count)} />
            ) : null}
          </VStack>
        </Flex>
      )}
    </>
  )
}

export default L1User
