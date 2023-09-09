import { Text, Box, Table, Tbody, Skeleton, Link, Button, Heading, Card, CardHeader, CardBody, Badge } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { fetchTxByL1Id } from '../../requests'
import { thousandSeperator, timeAgo } from '../../helpers'
import { l1Explorer, l1ExplorerName, themeColor, themeColorScheme } from '../../settings'

const L1Tx = () => {
  const { txid } = useParams()
  const { data, isLoading, isSuccess } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-l1-tx', txid],
    queryFn: async () => fetchTxByL1Id(txid!)
  })
  return (
    <>
      <Box marginBottom={'15px'}>
        <Text fontSize={'5xl'}>Hive L1 Transaction</Text>
        <Text fontSize={'3xl'} opacity={'0.7'}>{txid}</Text>
        {isSuccess ? (data.length > 0 ?
          <Box marginTop={'10px'}>
            <Text fontSize={'xl'} display={'inline'}>Included in L1 block </Text>
            <Link href={l1Explorer+'/b/'+data[0].l1_block} target='_blank' fontSize={'xl'}>{'#'+thousandSeperator(data[0].l1_block)}</Link>
          </Box> :
          <Text fontSize={'xl'} marginTop={'10px'}>No operations found</Text>
        ) : null}
        {isLoading ? <Skeleton height={'20px'} marginTop={'10px'}/> : null}
      </Box>
      <hr/>
      <Button as={ReactRouterLink} margin={'20px 0px'} colorScheme={themeColorScheme} variant={'outline'} to={l1Explorer+'/tx/'+txid} target='_blank'>View in {l1ExplorerName}</Button>
      { isLoading ?
        <Card w='100%'>
          <CardBody>
            Loading VSC Operations...
          </CardBody>
        </Card>
      : isSuccess ?
        data.map((trx, i) => 
          <Card key={i}>
            <CardHeader><Heading fontSize={'2xl'}>Operation #{i}</Heading></CardHeader>
            <CardBody>
              <Table margin={'-20px 0 0'} variant={'unstyled'}>
                <Tbody>
                  <TableRow isInCard label='ID' value={trx.id}/>
                  <TableRow isInCard label='Timestamp' value={trx.ts+' ('+timeAgo(trx.ts)+')'}/>
                  <TableRow isInCard label='Username' value={trx.username} link={'/@'+trx.username}/>
                  <TableRow isInCard label='Operation Type'><Badge color={themeColor}>{trx.type}</Badge></TableRow>
                  <TableRow isInCard label='Nonce' value={trx.nonce}/>
                </Tbody>
              </Table>
            </CardBody>
            <CardHeader><Heading fontSize={'xl'}>Payload</Heading></CardHeader>
            <CardBody marginTop={'-25px'}>
              <JsonToTableRecursive isInCard minimalSpace json={trx.payload as object}/>
            </CardBody>
          </Card>)
      : null}
    </>
  )
}

export default L1Tx