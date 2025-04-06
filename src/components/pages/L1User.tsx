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
  // Tr,
  Tag,
  Stack
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router'
import PageNotFound from './404'
import {
  fetchAccHistory,
  // fetchAccInfo,
  fetchL1AccInfo,
  fetchL1Rest,
  // fetchMsOwners,
  fetchWitness,
  getL2BalanceByL1User
} from '../../requests'
import { describeL1TxBriefly, roundFloat, thousandSeperator, timeAgo } from '../../helpers'
import { TxCard } from '../TxCard'
import TableRow from '../TableRow'
import Pagination from '../Pagination'
import { L1Accs as L1AccFlairs } from '../../flairs'
import { L1AccountAuthority } from '../../types/L1ApiResult'
import { themeColorScheme } from '../../settings'

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
  const {
    data: witness,
    isLoading: isWitLoading,
    isSuccess: isWitSuccess
  } = useQuery({
    queryKey: ['vsc-witness', username],
    queryFn: async () => fetchWitness(user),
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
  // const { data: msNames, isSuccess: isMsNamesSuccess } = useQuery({
  //   queryKey: ['vsc-ms-names', 'sk_owner'],
  //   queryFn: async () => fetchMsOwners(l1Acc!.owner.key_auths.map((a) => a[0])),
  //   enabled: user === multisigAccount && !!l1Acc && !invalidParams && !isL1AccErr
  // })
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
      ) : isL1AccErr ? (
        <Text fontSize={'xl'} margin={'10px 0px'}>
          Failed to fetch L1 Hive account
        </Text>
      ) : (
        <Flex direction={{ base: 'column', lg: 'row' }} marginTop="20px" gap="6">
          <VStack width={{ base: '100%', lg: 'ss' }} spacing={'6'}>
            {/* {user === multisigAccount ? (
              <Card width={'100%'}>
                <CardHeader marginBottom="-15px">
                  <Heading size={'md'} textAlign={'center'}>
                    Multisig Key Holders ({l1Acc ? l1Acc.owner.weight_threshold : '...'}/
                    {l1Acc ? l1Acc.owner.key_auths.length + l1Acc.owner.account_auths.length : '...'})
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Table variant={'unstyled'}>
                    <Tbody>
                      {!!msNames && isMsNamesSuccess && !!l1Acc ? (
                        msNames
                          .map((a, i) => (
                            <Tr key={i}>
                              <Link as={ReactRouterLink} to={'/@' + a}>
                                {a}
                              </Link>
                            </Tr>
                          ))
                          .concat(
                            l1Acc.owner.account_auths.map((a, i) => (
                              <Tr key={i}>
                                <Link as={ReactRouterLink} to={'/@' + a[0]}>
                                  {a[0]}
                                </Link>
                                {a[1] > 1 ? ' (' + a[1] + ')' : ''}
                              </Tr>
                            ))
                          )
                      ) : (
                        <Tr></Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            ) : ( */}
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
                      value={thousandSeperator(roundFloat((l2Balance?.hive || 0) / 1000, 3)) + ' HIVE'}
                      isLoading={!isL2BalSuccess}
                    />
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="HIVE Staked"
                      value={thousandSeperator(roundFloat((l2Balance?.hive_consensus || 0) / 1000, 3)) + ' HIVE'}
                      isLoading={!isL2BalSuccess}
                    />
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="HBD Balance"
                      value={thousandSeperator(roundFloat((l2Balance?.hbd || 0) / 1000, 3)) + ' HBD'}
                      isLoading={!isL2BalSuccess}
                    />
                    <TableRow
                      isInCard
                      minimalSpace
                      minWidthLabel="115px"
                      label="HBD Staked"
                      value={thousandSeperator(roundFloat((l2Balance?.hbd_savings || 0) / 1000, 3)) + ' HBD'}
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
                      <TableRow
                        isInCard
                        minimalSpace
                        minWidthLabel="115px"
                        label="ID"
                        isLoading={isWitLoading}
                        value={isWitSuccess ? witness.id : 'Error'}
                      />
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Peer ID" isLoading={isWitLoading}>
                        <Text wordBreak={'break-all'}>{isWitSuccess ? witness.peer_id : 'Error'}</Text>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Consensus DID Key" isLoading={isWitLoading}>
                        <Text wordBreak={'break-all'}>{isWitSuccess ? witness.consensus_did : 'Error'}</Text>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Gateway Key" isLoading={isWitLoading}>
                        <Text wordBreak={'break-all'}>{isWitSuccess ? witness.gateway_key : 'Error'}</Text>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Enabled" isLoading={isWitLoading}>
                        {isWitSuccess ? (
                          witness.enabled ? (
                            <Badge colorScheme="green">True</Badge>
                          ) : (
                            <Badge colorScheme="red">False</Badge>
                          )
                        ) : (
                          'Error'
                        )}
                      </TableRow>
                      {isWitSuccess ? (
                        <TableRow isInCard minimalSpace minWidthLabel="115px" label="Last Update" isLoading={isWitLoading}>
                          <Tooltip placement="top" label={witness.last_update_ts}>
                            <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/' + witness.last_update_tx}>
                              {timeAgo(witness.last_update_ts)}
                            </Link>
                          </Tooltip>
                        </TableRow>
                      ) : null}
                      {isWitSuccess ? (
                        <TableRow isInCard minimalSpace minWidthLabel="115px" label="First Seen" isLoading={isWitLoading}>
                          <Tooltip placement="top" label={witness.first_seen_ts}>
                            <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/' + witness.first_seen_tx}>
                              {timeAgo(witness.first_seen_ts)}
                            </Link>
                          </Tooltip>
                        </TableRow>
                      ) : null}
                      {/* <TableRow isInCard minimalSpace minWidthLabel="115px" label="Git Commit" isLoading={isWitLoading}>
                        <Link
                          as={ReactRouterLink}
                          wordBreak={'break-all'}
                          target={'_blank'}
                          to={'https://github.com/vsc-eco/vsc-node/commit/' + (witness?.git_commit ?? '')}
                        >
                          {(witness?.git_commit ?? '').slice(0, 8)}
                        </Link>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Up To Date" isLoading={isWitLoading}>
                        {isWitSuccess ? (
                          witness.is_up_to_date ? (
                            <Badge colorScheme="green">True</Badge>
                          ) : (
                            <Tooltip label={'Latest: ' + (witness.latest_git_commit ?? '').slice(0, 8)} placement={'top'}>
                              <Link
                                as={ReactRouterLink}
                                target={'_blank'}
                                to={'https://github.com/vsc-eco/vsc-node/commit/' + (witness?.latest_git_commit ?? '')}
                              >
                                <Badge colorScheme="red">False</Badge>
                              </Link>
                            </Tooltip>
                          )
                        ) : (
                          'Error'
                        )}
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Last Block" isLoading={isWitLoading}>
                        <Link
                          as={ReactRouterLink}
                          wordBreak={'break-all'}
                          to={witness.last_block ? '/block/' + witness.last_block : '#'}
                        >
                          {thousandSeperator(witness.last_block ?? 'N/A')}
                        </Link>
                      </TableRow>
                      <TableRow isInCard minimalSpace minWidthLabel="115px" label="Produced" isLoading={isWitLoading}>
                        <Text>{isWitSuccess ? (witness.produced ? thousandSeperator(witness.produced) : 'NULL') : 'Error'}</Text>
                      </TableRow> */}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            ) : null}
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
