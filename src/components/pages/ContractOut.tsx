import { Badge, Box, Button, Card, CardBody, CardHeader, Heading, Link, Skeleton, Table, Tbody, Text } from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { themeColorLight, themeColorScheme, ipfsSubGw } from '../../settings'
import { useQuery } from '@tanstack/react-query'
import { thousandSeperator, timeAgo } from '../../helpers'
import { fetchContractOut } from '../../requests'

export const ContractOut = () => {
  const { txid } = useParams()
  const {
    data: l2TxOut,
    isLoading,
    isError,
    isSuccess
  } = useQuery({
    queryKey: ['vsc-tx-output', txid],
    queryFn: () => fetchContractOut(txid!),
    enabled: !!txid
  })
  return (
    <Box marginBottom={'15px'}>
      <Text fontSize={'5xl'}>Contract Output</Text>
      <Text fontSize={'2xl'} opacity={'0.7'}>
        {txid}
      </Text>
      <Button
        as={ReactRouterLink}
        margin={'20px 0px'}
        colorScheme={themeColorScheme}
        variant={'outline'}
        to={ipfsSubGw(txid || '')}
        target="_blank"
      >
        View in IPFS
      </Button>
      {isLoading ? <Skeleton h={'20px'} mt={'20px'} /> : null}
      {isSuccess && !l2TxOut.error ? (
        <Box>
          <Table>
            <Tbody>
              <TableRow label="Contract ID" value={l2TxOut.contract_id} link={'/contract/' + l2TxOut.contract_id} />
              <TableRow
                label="Timestamp"
                value={l2TxOut ? l2TxOut.ts + ' (' + timeAgo(l2TxOut.ts) + ')' : ''}
                isLoading={isLoading}
              />
              <TableRow label="Included In Block">
                <Link as={ReactRouterLink} to={'/block/' + l2TxOut.block_num}>
                  {l2TxOut.block_num}
                </Link>{' '}
                <Badge color={themeColorLight}>Position: {l2TxOut.idx_in_block}</Badge>
              </TableRow>
              {l2TxOut.total_io_gas ? (
                <TableRow label="Total Gas Used">{thousandSeperator(l2TxOut.total_io_gas)}</TableRow>
              ) : null}
            </Tbody>
          </Table>
          {Array.isArray(l2TxOut.outputs)
            ? l2TxOut.outputs.map((output, i) => (
                <Card key={i} mt={'30px'}>
                  <CardHeader>
                    <Heading fontSize={'2xl'}>Output #{i}</Heading>
                    <Link
                      as={ReactRouterLink}
                      to={(output.src === 'vsc' ? '/vsc-tx/' : '/tx/') + output.tx_id}
                      fontSize={'md'}
                      opacity={'0.7'}
                    >
                      {output.tx_id}
                      {output.src === 'hive' ? '-' + output.op_pos : ''}
                    </Link>
                  </CardHeader>
                  <CardBody mt={'-20px'}>
                    <JsonToTableRecursive json={output.output} minimalSpace isInCard />
                  </CardBody>
                </Card>
              ))
            : null}
        </Box>
      ) : isSuccess && l2TxOut.error ? (
        <Text>{l2TxOut.error}</Text>
      ) : isError ? (
        <Text>Failed to fetch VSC contract output</Text>
      ) : null}
    </Box>
  )
}
