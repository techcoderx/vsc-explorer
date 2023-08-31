import { Text, Table, Thead, Tbody, Tr, Th, Td, Box, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { fetchProps, fetchMultisigTxRefs } from '../../requests'
import { timeAgo } from '../../helpers'
import { ipfsSubGw, l1Explorer } from '../../settings'

const MultisigRefs = () => {
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  const refs = prop?.txrefs
  const { data: txRefs, isLoading: isTxRefsLoading, isSuccess: isTxRefsSuccess } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-multisig-txrefs', refs],
    queryFn: async () => await fetchMultisigTxRefs(refs!),
    enabled: !!refs
  })

  return (
    <>
      <Text fontSize={'5xl'}>Latest Multisig Tx Refs</Text>
      <hr/><br/>
      <Text>Total {isPropSuccess ? prop.txrefs : 0} Tx Refs</Text>
      <Box overflowX="auto" marginTop={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Age</Th>
              <Th>L1 Tx</Th>
              <Th>Ref ID</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isTxRefsLoading ? (
              <Tr>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
              </Tr>
            ) : ( isTxRefsSuccess ?
              txRefs.map((item, i) => (
                <Tr key={i}>
                  <Td>{item.id}</Td>
                  <Td sx={{whiteSpace: 'nowrap'}}>
                    <Tooltip label={item.ts} placement='top'>
                      {timeAgo(item.ts)}
                    </Tooltip>
                  </Td>
                  <Td isTruncated><Link href={l1Explorer+'/tx/'+item.l1_tx} target='_blank'>{item.l1_tx}</Link></Td>
                  <Td isTruncated><Link href={ipfsSubGw(item.ref_id)} target='_blank'>{item.ref_id}</Link></Td>
                </Tr>
              )) : <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  )
}

export default MultisigRefs