import { Badge, Box, Button, Card, CardBody, CardHeader, Heading, Link, Skeleton, Table, Tbody, Text } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { fetchL2Tx } from '../../requests'
import { themeColorLight, themeColorScheme, ipfsSubGw } from '../../settings'
import { useQuery } from '@tanstack/react-query'
import { thousandSeperator } from '../../helpers'

const L2Tx = () => {
  const { txid } = useParams()
  const { data: l2Tx, isLoading, isError, isSuccess } = useQuery({
    cacheTime: 15000,
    queryKey: ['vsc-tx-l2', txid],
    queryFn: () => fetchL2Tx(txid!),
    enabled: !!txid
  })
  return (
    <Box marginBottom={'15px'}>
      <Text fontSize={'5xl'}>L2 Transaction</Text>
      <Text fontSize={'3xl'} opacity={'0.7'}>{txid}</Text>
      <Button as={ReactRouterLink} margin={'20px 0px'} colorScheme={themeColorScheme} variant={'outline'} to={ipfsSubGw(txid || '')} target='_blank'>View in IPFS</Button>
      {isLoading ? <Skeleton h={'20px'} mt={'20px'}/> : null}
      {isSuccess && !l2Tx.error ? (
        <Box>
          <Table>
            <Tbody>
              <TableRow label='Transaction Type'>
                <Badge color={themeColorLight}>{l2Tx.tx_type}</Badge>
              </TableRow>
              <TableRow label='Contract ID' value={l2Tx.contract_id}/>
              <TableRow label='Contract Action' value={l2Tx.contract_action}/>
              <TableRow label='Included In Block'>
                <Link as={ReactRouterLink} to={'/block/'+l2Tx.block_num}>{l2Tx.block_num}</Link> <Badge color={themeColorLight}>Position: {l2Tx.idx_in_block}</Badge>
              </TableRow>
              {l2Tx.tx_type === 'call_contract' ? <TableRow label={`Signers (${l2Tx.signers.length})`}>{l2Tx.signers.join('\n')}</TableRow> : null}
              {l2Tx.tx_type === 'call_contract' ? <TableRow label={'Output Transaction'}><Link as={ReactRouterLink} to={'/vsc-tx/'+l2Tx.output}>{l2Tx.input}</Link></TableRow> : null}
              {l2Tx.tx_type === 'contract_output' ? <TableRow label={'Input Transaction'}><Link as={ReactRouterLink} to={(l2Tx.input_src === 'vsc' ? '/vsc-tx/' : '/tx/')+l2Tx.input}>{l2Tx.input}</Link></TableRow> : null}
              {l2Tx.io_gas ? <TableRow label='Gas Used'>{thousandSeperator(l2Tx.io_gas)}</TableRow> : null}
            </Tbody>
          </Table>
          <Card mt={'30px'}>
            <CardHeader><Heading fontSize={'2xl'}>Transaction Payload</Heading></CardHeader>
            <CardBody mt={'-20px'}>{
              typeof l2Tx.payload === 'object' ?
                <JsonToTableRecursive json={l2Tx.payload} minimalSpace isInCard/>
                : l2Tx.payload
            }</CardBody>
          </Card>
          {l2Tx.contract_output ? l2Tx.contract_output.map((out, i) =>
            <Card key={i} mt={'30px'}>
              <CardHeader><Heading fontSize={'2xl'}>Contract Output #{i}</Heading></CardHeader>
              <CardBody mt={'-20px'}>
                <JsonToTableRecursive json={out} minimalSpace isInCard/>
              </CardBody>
            </Card>
          ): null}
        </Box>
      ) : (isSuccess && l2Tx.error ? <Text>{l2Tx.error}</Text> : (isError ? <Text>Failed to fetch VSC L2 transaction</Text> : null))}
    </Box>
  )
}

export default L2Tx