import { Text, Flex, Heading, Card, CardHeader, CardBody, HStack, StackDivider, VStack, Skeleton, Tooltip, Box, Badge, Link } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import PageNotFound from './404'
import { fetchAccHistory, fetchAccInfo, fetchL1, fetchWitness } from '../../requests'
import { l1Explorer } from '../../settings'
import { describeL1Tx, thousandSeperator } from '../../helpers'
import { ReactNode } from 'react'
import TxCard from '../TxCard'
import Pagination from '../Pagination'

const count = 50

interface CardTableRowProps {
  title: string
  children: ReactNode
  isLoading: boolean
}

const CardTableRow = ({ title, children, isLoading }: CardTableRowProps) => {
  return (
    <HStack divider={<StackDivider/>} w='100%' spacing='4'>
      <Box minW='105px'>
        <Text fontWeight={'bold'} minW='105px'>{title}</Text>
      </Box>
      {isLoading ? <Skeleton height='20px'/> : children}
    </HStack>
  )
}

const L1User = () => {
  const { username, page } = useParams()
  const pageNumber = parseInt(page || '1')
  if (!username || !username.startsWith('@') || isNaN(pageNumber) || pageNumber < 1)
    return <PageNotFound/>
  const user = username.replace('@','')
  const { data: l1Acc, isLoading: isL1AccLoading, isSuccess: isL1AccSuccess } = useQuery({
    cacheTime: 15000,
    queryKey: ['hive-account', username],
    queryFn: async () => fetchL1('condenser_api.get_accounts', [[user]])
  })
  const { data: l1Dgp, isLoading: isL1DgpLoading, isSuccess: isL1DgpSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['hive-dgp'],
    queryFn: async () => fetchL1('database_api.get_dynamic_global_properties', {})
  })
  const { data: witness, isLoading: isWitLoading, isSuccess: isWitSuccess } = useQuery({
    cacheTime: 60000,
    queryKey: ['vsc-witness', username],
    queryFn: async () => fetchWitness(user)
  })
  const { data: l1Accv, isLoading: isL1AccvLoading, isSuccess: isL1AccvSuccess } = useQuery({
    cacheTime: 15000,
    queryKey: ['vsc-account', username],
    queryFn: async () => fetchAccInfo(user)
  })
  const last_nonce = l1Accv ? Math.max(l1Accv.tx_count-((pageNumber-1)*50)-1,0) : null
  const { data: history, isLoading: isHistLoading, isSuccess: isHistSuccess, isError: isHistError } = useQuery({
    cacheTime: 15000,
    queryKey: ['vsc-l1-acc-history', username, last_nonce],
    queryFn: async () => fetchAccHistory(user,count,last_nonce),
    enabled: !!l1Accv
  })
  return (
    <>
      <Text fontSize={'5xl'} marginBottom='10px'>{username}</Text>
      <hr/>
      { isL1AccSuccess && !l1Acc.error && l1Acc.result.length === 0 ?
        <Text fontSize={'xl'} margin={'10px 0px'}>Account does not exist</Text> :

        isL1AccSuccess && l1Acc.error ?
        <Text fontSize={'xl'} margin={'10px 0px'}>Failed to fetch L1 Hive account, error: {l1Acc.error.toString()}</Text> :
        <Flex direction={{base: 'column', lg: 'row'}} marginTop='20px' gap='6'>
          <VStack width={{base: '100%', lg: 'ss'}} spacing={'6'}>
            <Card width={'100%'}>
              <CardHeader>
                <Heading size={'md'} textAlign={'center'}>VSC Witness</Heading>
              </CardHeader>
              <CardBody>
                <VStack divider={<StackDivider/>}>
                  <CardTableRow title='ID' isLoading={isWitLoading}>
                    <Text>{isWitSuccess ? witness.id : 'Error'}</Text>
                  </CardTableRow>
                  <CardTableRow title='DID Key' isLoading={isWitLoading}>
                    <Text wordBreak={'break-all'}>{isWitSuccess ? witness.did : 'Error'}</Text>
                  </CardTableRow>
                  <CardTableRow title='DID Trusted' isLoading={isWitLoading}>
                    <Text wordBreak={'break-all'}>{
                      isWitSuccess ? (
                        witness.trusted ? <Badge colorScheme='green'>True</Badge> : <Badge colorScheme='red'>False</Badge>
                      ) : 'Error'}
                    </Text>
                  </CardTableRow>
                  <CardTableRow title='Enabled' isLoading={isWitLoading}>
                    <Text wordBreak={'break-all'}>{
                      isWitSuccess ? (
                        witness.enabled ? <Badge colorScheme='green'>True</Badge> : <Badge colorScheme='red'>False</Badge>
                      ) : 'Error'}
                    </Text>
                  </CardTableRow>
                  { isWitSuccess && witness.enabled ?
                    <CardTableRow title='Last Update' isLoading={isWitLoading}>
                      {isWitSuccess ? ( witness.enabled_at ?
                        <Link wordBreak={'break-all'} href={l1Explorer+'/tx/'+witness.enabled_at} target='_blank'>{witness.enabled_at}</Link> : 'N/A') : 'Error'
                      }
                    </CardTableRow> : null
                  }
                  { isWitSuccess && !witness.enabled && witness.disabled_at ?
                    <CardTableRow title='Last Update' isLoading={isWitLoading}>
                      {isWitSuccess ? ( witness.disabled_at ?
                        <Link wordBreak={'break-all'} href={l1Explorer+'/tx/'+witness.disabled_at} target='_blank'>{witness.disabled_at}</Link> : 'N/A') : 'Error'
                      }
                    </CardTableRow> : null 
                  }
                  <CardTableRow title='Last Block' isLoading={isWitLoading}>
                    <Text wordBreak={'break-all'}>{isWitSuccess ? (witness.last_block ? thousandSeperator(witness.last_block) : 'NULL') : 'Error'}</Text>
                  </CardTableRow>
                  <CardTableRow title='Produced' isLoading={isWitLoading}>
                    <Text wordBreak={'break-all'}>{isWitSuccess ? (witness.produced ? thousandSeperator(witness.produced) : 0) : 'Error'}</Text>
                  </CardTableRow>
                </VStack>
              </CardBody>
            </Card>
            <Card width={'100%'}>
              <CardHeader marginBottom='-15px'>
                <Heading size={'md'} textAlign={'center'}>L1 Balances</Heading>
              </CardHeader>
              <CardBody>
                <VStack divider={<StackDivider/>}>
                  <CardTableRow title='HIVE Balance' isLoading={isL1AccLoading}>
                    <Text>{isL1AccSuccess && !l1Acc.error && l1Acc.result.length > 0 ? thousandSeperator(parseFloat(l1Acc?.result[0].balance)+parseFloat(l1Acc?.result[0].savings_balance))+' HIVE' : 'Error'}</Text>
                  </CardTableRow>
                  <CardTableRow title='HBD Balance' isLoading={isL1AccLoading}>
                    <Text>{isL1AccSuccess && !l1Acc.error && l1Acc.result.length > 0 ? thousandSeperator(parseFloat(l1Acc?.result[0].hbd_balance)+parseFloat(l1Acc?.result[0].savings_hbd_balance))+' HBD' : 'Error'}</Text>
                  </CardTableRow>
                  <CardTableRow title='Staked HIVE' isLoading={isL1AccLoading || isL1DgpLoading}>
                    { isL1DgpSuccess && !l1Dgp.error && isL1AccSuccess && !l1Acc.error && l1Acc.result.length > 0 ?
                      <Tooltip label={thousandSeperator(parseFloat(l1Acc?.result[0].vesting_shares))+' VESTS'} placement='top'>{
                          thousandSeperator((1000*parseFloat(l1Dgp?.result.total_vesting_fund_hive.amount)*parseFloat(l1Acc?.result[0].vesting_shares)/parseFloat(l1Dgp?.result.total_vesting_shares.amount)).toFixed(3))+' HP'
                        }
                      </Tooltip>
                      : 'Error'
                    }
                  </CardTableRow>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
          <VStack spacing={'3'} flexGrow={'1'}>
            { isL1AccvLoading || isHistLoading ? <Card width='100%'><CardBody>Loading VSC L1 transaction tistory...</CardBody></Card> : null }
            { isHistError ? <Card width='100%'><CardBody>Failed to load VSC L1 transaction gistory</CardBody></Card> : null }
            { isHistSuccess ? (
              history.length === 0 ? <Card width='100%'><CardBody>There are no VSC L1 transactions for this account.</CardBody></Card> :
              history.map((itm, i) => <TxCard key={i} width='100%' id={itm.id} ts={itm.ts}>{describeL1Tx(itm)}</TxCard>)
            ) : null }
            { isHistSuccess && history.length > count && isL1AccvSuccess ? <Pagination path={'/'+username} currentPageNum={pageNumber} maxPageNum={Math.ceil(l1Accv.tx_count/count)}/> : null }
          </VStack>
        </Flex>
      }
    </>
  )
}

export default L1User