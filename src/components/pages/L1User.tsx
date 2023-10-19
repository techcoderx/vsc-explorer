import { Text, Flex, Heading, Card, CardHeader, CardBody, VStack, Tooltip, Badge, Link, Table, Tbody } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import PageNotFound from './404'
import { fetchAccHistory, fetchAccInfo, fetchL1, fetchWitness } from '../../requests'
import { describeL1TxBriefly, thousandSeperator } from '../../helpers'
import { TxCard } from '../TxCard'
import TableRow from '../TableRow'
import Pagination from '../Pagination'
import { L1Account, L1Dgp } from '../../types/L1ApiResult'

const count = 50

const L1User = () => {
  const { username, page } = useParams()
  const pageNumber = parseInt(page || '1')
  const invalidParams = !username || !username.startsWith('@') || isNaN(pageNumber) || pageNumber < 1
  const user = !invalidParams ? username.replace('@','') : ''
  const { data: l1Acc, isLoading: isL1AccLoading, isSuccess: isL1AccSuccess } = useQuery({
    cacheTime: 15000,
    queryKey: ['hive-account', username],
    queryFn: async () => fetchL1('condenser_api.get_accounts', [[user]]),
    enabled: !invalidParams
  })
  const { data: l1Dgp, isLoading: isL1DgpLoading, isSuccess: isL1DgpSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['hive-dgp'],
    queryFn: async () => fetchL1('condenser_api.get_dynamic_global_properties', []),
    enabled: !invalidParams
  })
  const { data: witness, isLoading: isWitLoading, isSuccess: isWitSuccess } = useQuery({
    cacheTime: 60000,
    queryKey: ['vsc-witness', username],
    queryFn: async () => fetchWitness(user),
    enabled: !invalidParams
  })
  const { data: l1Accv, isLoading: isL1AccvLoading, isSuccess: isL1AccvSuccess } = useQuery({
    cacheTime: 15000,
    queryKey: ['vsc-account', username],
    queryFn: async () => fetchAccInfo(user),
    enabled: !invalidParams
  })
  const last_nonce = l1Accv ? Math.max(l1Accv.tx_count-((pageNumber-1)*50)-1,0) : null
  const { data: history, isLoading: isHistLoading, isSuccess: isHistSuccess, isError: isHistError } = useQuery({
    cacheTime: 15000,
    queryKey: ['vsc-l1-acc-history', username, last_nonce],
    queryFn: async () => fetchAccHistory(user,count,last_nonce),
    enabled: !!l1Accv && !invalidParams
  })
  const l1AccResult = l1Acc?.result as L1Account[]
  const l1DgpResult = l1Dgp?.result as L1Dgp
  if (invalidParams)
    return <PageNotFound/>
  return (
    <>
      <Text fontSize={'5xl'} marginBottom='10px'>{username}</Text>
      <hr/>
      { isL1AccSuccess && !l1Acc.error && l1AccResult.length === 0 ?
        <Text fontSize={'xl'} margin={'10px 0px'}>Account does not exist</Text> :

        isL1AccSuccess && l1Acc.error ?
        <Text fontSize={'xl'} margin={'10px 0px'}>Failed to fetch L1 Hive account, error: {l1Acc.error.toString()}</Text> :
        <Flex direction={{base: 'column', lg: 'row'}} marginTop='20px' gap='6'>
          <VStack width={{base: '100%', lg: 'ss'}} spacing={'6'}>
            <Card width={'100%'}>
              <CardHeader marginBottom={'-15px'}>
                <Heading size={'md'} textAlign={'center'}>VSC Witness</Heading>
              </CardHeader>
              <CardBody>
                <Table variant={'unstyled'}>
                  <Tbody>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='ID' isLoading={isWitLoading} value={isWitSuccess ? witness.id : 'Error'}/>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='DID Key' isLoading={isWitLoading}>
                      <Text wordBreak={'break-all'}>{isWitSuccess ? witness.did : 'Error'}</Text>
                    </TableRow>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='DID Trusted' isLoading={isWitLoading}>
                      { isWitSuccess ? ( witness.trusted ?
                        <Badge colorScheme='green'>True</Badge> : <Badge colorScheme='red'>False</Badge>
                      ) : 'Error'}
                    </TableRow>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='Enabled' isLoading={isWitLoading}>
                      { isWitSuccess ? ( witness.enabled ?
                        <Badge colorScheme='green'>True</Badge> : <Badge colorScheme='red'>False</Badge>
                      ) : 'Error'}
                    </TableRow>
                    { isWitSuccess && witness.enabled ?
                      <TableRow isInCard minimalSpace minWidthLabel='115px' label='Last Update' isLoading={isWitLoading}>
                        { witness.enabled_at ?
                          <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/'+witness.enabled_at}>{witness.enabled_at}</Link> : 'N/A'}
                      </TableRow> : null
                    }
                    { isWitSuccess && !witness.enabled && witness.disabled_at ?
                      <TableRow isInCard minimalSpace minWidthLabel='115px' label='Last Update' isLoading={isWitLoading}>
                        <Link as={ReactRouterLink} wordBreak={'break-all'} to={'/tx/'+witness.disabled_at}>{witness.disabled_at}</Link>
                      </TableRow> : null
                    }
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='Last Block' isLoading={isWitLoading}>
                      <Text>{isWitSuccess ? (witness.last_block ? thousandSeperator(witness.last_block) : 'NULL') : 'Error'}</Text>
                    </TableRow>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='Produced' isLoading={isWitLoading}>
                      <Text>{isWitSuccess ? (witness.produced ? thousandSeperator(witness.produced) : 'NULL') : 'Error'}</Text>
                    </TableRow>
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            <Card width={'100%'}>
              <CardHeader marginBottom='-15px'>
                <Heading size={'md'} textAlign={'center'}>L1 Balances</Heading>
              </CardHeader>
              <CardBody>
                <Table variant={'unstyled'}>
                  <Tbody>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='HIVE Balance' isLoading={isL1AccLoading} value={isL1AccSuccess && !l1Acc.error ? thousandSeperator(parseFloat(l1AccResult[0].balance)+parseFloat(l1AccResult[0].savings_balance))+' HIVE' : 'Error'}/>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='HBD Balance' isLoading={isL1AccLoading} value={isL1AccSuccess && !l1Acc.error ? thousandSeperator(parseFloat(l1AccResult[0].hbd_balance)+parseFloat(l1AccResult[0].savings_hbd_balance))+' HBD' : 'Error'}/>
                    <TableRow isInCard minimalSpace minWidthLabel='115px' label='Staked HIVE' isLoading={isL1AccLoading || isL1DgpLoading}>
                      { isL1DgpSuccess && !l1Dgp.error && isL1AccSuccess && !l1Acc.error ?
                        <Tooltip label={thousandSeperator(parseFloat(l1AccResult[0].vesting_shares))+' VESTS'} placement='top'>{
                            thousandSeperator((parseFloat(l1DgpResult.total_vesting_fund_hive)*parseFloat(l1AccResult[0].vesting_shares)/parseFloat(l1DgpResult.total_vesting_shares)).toFixed(3))+' HP'
                          }
                        </Tooltip>
                        : 'Error'
                      }
                    </TableRow>
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </VStack>
          <VStack spacing={'3'} flexGrow={'1'}>
            { isL1AccvLoading || isHistLoading ? <Card width='100%'><CardBody>Loading VSC L1 transaction tistory...</CardBody></Card> : null }
            { isHistError ? <Card width='100%'><CardBody>Failed to load VSC L1 transaction gistory</CardBody></Card> : null }
            { isHistSuccess ? (
              history.length === 0 ? <Card width='100%'><CardBody>There are no VSC L1 transactions for this account.</CardBody></Card> :
              history.map((itm, i) => <TxCard key={i} id={itm.id} ts={itm.ts} txid={itm.l1_tx}>{describeL1TxBriefly(itm)}</TxCard>)
            ) : null }
            { isHistSuccess && isL1AccvSuccess ? <Pagination path={'/'+username} currentPageNum={pageNumber} maxPageNum={Math.ceil(l1Accv.tx_count/count)}/> : null }
          </VStack>
        </Flex>
      }
    </>
  )
}

export default L1User