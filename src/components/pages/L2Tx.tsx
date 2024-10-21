import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
  Skeleton,
  Spinner,
  Stack,
  Table,
  Tag,
  Tbody,
  Text
} from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { fetchL2Tx, fetchL2TxGql } from '../../requests'
import { themeColorLight, themeColorScheme, ipfsSubGw } from '../../settings'
import { useQuery } from '@tanstack/react-query'
import { timeAgo, thousandSeperator } from '../../helpers'

const ContractCallInfo = ({ contract_id, action }: { contract_id: string; action: string }) => {
  return (
    <>
      <TableRow overflowWrap={'anywhere'} label="Contract ID">
        <Link as={ReactRouterLink} to={'/contract/' + contract_id} overflowWrap={'anywhere'}>
          {contract_id}
        </Link>
      </TableRow>
      <TableRow overflowWrap={'anywhere'} label="Contract Action" value={action} />
    </>
  )
}

const Payload = ({ payload }: { payload: any }) => {
  return (
    <Card mt={'30px'}>
      <CardHeader>
        <Heading fontSize={'2xl'}>Transaction Payload</Heading>
      </CardHeader>
      <CardBody mt={'-20px'}>
        {typeof payload === 'object' ? <JsonToTableRecursive json={payload} minimalSpace isInCard /> : payload}
      </CardBody>
    </Card>
  )
}

const L2Tx = () => {
  const { txid } = useParams()
  const {
    data: l2Tx,
    isLoading,
    isError,
    isSuccess,
    refetch
  } = useQuery({
    queryKey: ['vsc-tx-l2', txid],
    queryFn: () => fetchL2Tx(txid!),
    refetchOnWindowFocus: false,
    enabled: !!txid
  })
  const { data: l2Tx2, refetch: refetchL2Tx2 } = useQuery({
    queryKey: ['vsc-tx-l2-gql', txid],
    queryFn: () => fetchL2TxGql(txid!),
    refetchOnWindowFocus: false,
    enabled: !!txid
  })
  const l2TxGql = l2Tx2 && l2Tx2.data ? l2Tx2.data.findTransaction.txs[0] : null
  const status =
    isSuccess && !l2Tx.error
      ? l2Tx.contract_output || (l2Tx.events && l2Tx.events.length > 0)
        ? 'CONFIRMED'
        : 'INCLUDED'
      : isSuccess &&
        l2Tx.error &&
        l2Tx.error === 'transaction not found' &&
        l2TxGql &&
        l2TxGql.id === txid &&
        l2TxGql.src === 'vsc'
      ? l2TxGql.status
      : 'UNKNOWN'
  const confirmTime =
    l2TxGql && l2TxGql.sig_hash && l2Tx
      ? Math.max(0, Math.round((new Date(l2Tx.ts + 'Z').getTime() - new Date(l2TxGql.first_seen).getTime()) / 1000))
      : 0
  const intervalRef = useRef<number>()
  useEffect(() => {
    const shouldRefetch = status === 'UNCONFIRMED' || (l2Tx && l2Tx.tx_type === 'call_contract' && status === 'INCLUDED')
    if (shouldRefetch) {
      intervalRef.current = setInterval(() => {
        refetch()
        refetchL2Tx2()
      }, 10000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [status, refetch, refetchL2Tx2])
  return (
    <Box marginBottom={'15px'}>
      <Text fontSize={'5xl'}>L2 Transaction</Text>
      <Text fontSize={'2xl'} opacity={'0.7'}>
        {txid}
      </Text>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={'5'} justifyContent="space-between" m={'20px 0px'}>
        <Button
          as={ReactRouterLink}
          colorScheme={themeColorScheme}
          variant={'outline'}
          to={ipfsSubGw(txid || '')}
          target="_blank"
        >
          View in IPFS
        </Button>
        {status !== 'UNKNOWN' ? (
          <Tag colorScheme={themeColorScheme} size={'lg'} variant={'subtle'} alignSelf={'center'}>
            {status}
          </Tag>
        ) : null}
      </Stack>
      {isLoading ? <Skeleton h={'20px'} mt={'20px'} /> : null}
      {isSuccess && !l2Tx.error ? (
        <Box>
          <Table>
            <Tbody>
              <TableRow label="Transaction Type">
                <Badge color={themeColorLight}>{l2Tx.tx_type}</Badge>
              </TableRow>
              <TableRow overflowWrap={'anywhere'} label="Timestamp">
                <Text display={'inline-block'}>{l2Tx.ts + ' (' + timeAgo(l2Tx.ts) + ')'}</Text>
                {l2TxGql && l2TxGql.sig_hash ? (
                  <Text display={'inline-block'} opacity={'0.7'} ml={{ base: '0', md: '3', lg: '6' }}>
                    | Included in {confirmTime} seconds
                  </Text>
                ) : null}
              </TableRow>
              {l2Tx.tx_type === 'call_contract' ? (
                <ContractCallInfo contract_id={l2Tx.contract_id} action={l2Tx.contract_action} />
              ) : null}
              <TableRow label="Included In Block">
                <Link as={ReactRouterLink} to={'/block/' + l2Tx.block_num}>
                  {l2Tx.block_num}
                </Link>{' '}
                <Badge color={themeColorLight}>Position: {l2Tx.idx_in_block}</Badge>
              </TableRow>
              <TableRow overflowWrap={'anywhere'} label={`Signers (${l2Tx.signers.length})`}>
                {l2Tx.signers.map((signer, i) => {
                  return (
                    <Link key={i} as={ReactRouterLink} to={'/address/' + signer}>
                      {signer}
                    </Link>
                  )
                })}
              </TableRow>
              {l2TxGql && l2TxGql.sig_hash ? (
                <TableRow label={'Signature CID'}>
                  <Link as={ReactRouterLink} to={ipfsSubGw(l2TxGql.sig_hash)} target="_blank" overflowWrap={'anywhere'}>
                    {l2TxGql.sig_hash}
                  </Link>
                </TableRow>
              ) : null}
              {l2Tx.tx_type === 'call_contract' ? (
                <TableRow label={'Output Transaction'}>
                  {l2Tx.output ? (
                    <Link as={ReactRouterLink} to={'/vsc-tx-output/' + l2Tx.output} overflowWrap={'anywhere'}>
                      {l2Tx.output}
                    </Link>
                  ) : (
                    <Spinner size={'sm'} />
                  )}
                </TableRow>
              ) : null}
              {l2Tx.contract_output && typeof l2Tx.contract_output.IOGas === 'number' ? (
                <TableRow label="Gas Used">{thousandSeperator(l2Tx.contract_output.IOGas)}</TableRow>
              ) : null}
            </Tbody>
          </Table>
          <Payload payload={l2Tx.payload} />
          {l2Tx.contract_output && l2Tx.tx_type === 'call_contract' ? (
            <Card mt={'30px'}>
              <CardHeader>
                <Heading fontSize={'2xl'}>Contract Output</Heading>
              </CardHeader>
              <CardBody mt={'-20px'}>
                <JsonToTableRecursive json={l2Tx.contract_output} minimalSpace isInCard />
              </CardBody>
            </Card>
          ) : null}
          {Array.isArray(l2Tx.events)
            ? l2Tx.events.map((event, i) => (
                <Card key={i} mt={'30px'}>
                  <CardHeader>
                    <Heading fontSize={'2xl'}>Event #{i}</Heading>
                  </CardHeader>
                  <CardBody mt={'-20px'}>
                    <JsonToTableRecursive json={event} minimalSpace isInCard />
                  </CardBody>
                </Card>
              ))
            : null}
        </Box>
      ) : isSuccess && l2Tx.error ? (
        l2TxGql && l2TxGql.id === txid ? (
          // transaction may exist in graphql node but yet to be indexed by vsc-haf
          <Box>
            <Table>
              <Tbody>
                <TableRow label="Transaction Type">
                  <Badge color={themeColorLight}>{l2TxGql.data.op}</Badge>
                </TableRow>
                <TableRow label="First Seen">
                  {status === 'UNCONFIRMED' ? <Spinner size={'sm'} mr={'2'} /> : null}
                  <Text display={'inline-block'}>{l2TxGql.first_seen + ' (' + timeAgo(l2TxGql.first_seen) + ')'}</Text>
                </TableRow>
                {l2TxGql.data.op === 'call_contract' ? (
                  <ContractCallInfo contract_id={l2TxGql.data.contract_id!} action={l2TxGql.data.action!} />
                ) : null}
              </Tbody>
            </Table>
            <Payload payload={l2TxGql.data.payload} />
          </Box>
        ) : (
          <Text>{l2Tx.error}</Text>
        )
      ) : isError ? (
        <Text>Failed to fetch VSC L2 transaction</Text>
      ) : null}
    </Box>
  )
}

export default L2Tx
