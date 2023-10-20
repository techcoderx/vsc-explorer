import { Badge, Box, Button, Card, CardBody, CardHeader, Heading, Skeleton, Table, Tbody, Text } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import { cid as isCID } from 'is-ipfs'
import { CID } from 'multiformats/cid'
import { useVerifyJWS } from '../../did'
import PageNotFound from './404'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { useFindCID } from '../../requests'
import { themeColorLight, themeColorScheme, ipfsSubGw } from '../../settings'
import { L2TxCID } from '../../types/L2ApiResult'

const L2Tx = () => {
  const { txid } = useParams()
  const validCID = typeof txid === 'string' && isCID(txid) && CID.parse(txid).code === 0x71
  const { data, isLoading, isError, isSuccess } = useFindCID(txid, true, true, validCID)
  const l2Tx = data as L2TxCID
  const notActuallyTx = isSuccess && (data.findCID.type !== 'vsc-tx' || !l2Tx.findCID.payload || !l2Tx.findCID.signatures)
  const proof = useVerifyJWS(l2Tx ? l2Tx.findCID.payload : '', l2Tx ? l2Tx.findCID.signatures : [], !notActuallyTx)
  if (!validCID)
    return <PageNotFound/>
  return (
    <Box marginBottom={'15px'}>
      <Text fontSize={'5xl'}>L2 Transaction</Text>
      <Text fontSize={'3xl'} opacity={'0.7'}>{txid}</Text>
      <Button as={ReactRouterLink} margin={'20px 0px'} colorScheme={themeColorScheme} variant={'outline'} to={ipfsSubGw(txid)} target='_blank'>View in IPFS</Button>
      {isLoading ? <Skeleton h={'20px'} mt={'20px'}/> : null}
      {isSuccess && !notActuallyTx ? (
        <Box>
          <Table>
            <Tbody>
              <TableRow label='Version' value={l2Tx.findCID.data.__v}/>
              <TableRow label='Transaction Type'>
                <Badge color={themeColorLight}>{l2Tx.findCID.data.tx.op}</Badge>
              </TableRow>
              <TableRow label='Contract' value={l2Tx.findCID.data.tx.contract_id} link={'/tx/'+l2Tx.findCID.data.tx.contract_id}/>
              <TableRow label='Lock Block' value={l2Tx.findCID.data.lock_block} link={'/block-by-hash/'+l2Tx.findCID.data.lock_block}/>
              <TableRow label='Sender' isLoading={!proof}>{proof ? proof.kid.split('#')[0] : <Skeleton h={'20px'}/>}</TableRow>
              {l2Tx.findCID.data.tx.op === 'call_contract' ? <TableRow label='Salt' value={l2Tx.findCID.data.tx.salt}/> : null}
              {l2Tx.findCID.data.tx.op === 'call_contract' ? <TableRow label='Action' value={l2Tx.findCID.data.tx.action}/> : null}
              {l2Tx.findCID.data.tx.op === 'contract_output' ? <TableRow label='Parent Transaction' value={l2Tx.findCID.data.tx.parent_tx_id} link={'/vsc-tx/'+l2Tx.findCID.data.tx.parent_tx_id}/> : null}
              {l2Tx.findCID.data.tx.op === 'contract_output' ? <TableRow label='State Merkle' value={l2Tx.findCID.data.tx.state_merkle}/> : null}
              {l2Tx.findCID.data.tx.op === 'contract_output' ? <TableRow label='Inputs'><JsonToTableRecursive json={l2Tx.findCID.data.tx.inputs} minimalSpace isInCard/></TableRow> : null}
              <TableRow label='JWS Payload' value={l2Tx.findCID.payload}/>
              <TableRow label='Signatures'><JsonToTableRecursive json={l2Tx.findCID.signatures} minimalSpace isInCard/></TableRow>
            </Tbody>
          </Table>
          {l2Tx.findCID.data.tx.op === 'call_contract' ? (
            <Card mt={'30px'}>
              <CardHeader><Heading fontSize={'2xl'}>Transaction Payload</Heading></CardHeader>
              <CardBody mt={'-20px'}>
                <JsonToTableRecursive json={l2Tx.findCID.data.tx.payload} minimalSpace isInCard/>
              </CardBody>
            </Card>
          ) : null}
        </Box>
      ) : (notActuallyTx ? <Text>CID is not a VSC L2 transaction</Text> : (isError ? <Text>Failed to fetch VSC L2 transaction</Text> : null))}
    </Box>
  )
}

export default L2Tx