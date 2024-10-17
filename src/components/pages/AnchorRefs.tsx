import { Text, Table, Thead, Tbody, Tr, Th, Td, Box, Skeleton, Tooltip, Link } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProps, fetchAnchorRefs } from '../../requests'
import { abbreviateHash, timeAgo } from '../../helpers'

const AnchorRefs = () => {
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  const refs = prop?.anchor_refs
  const {
    data: txRefs,
    isLoading: isTxRefsLoading,
    isSuccess: isTxRefsSuccess
  } = useQuery({
    queryKey: ['vsc-anchor-refs', refs],
    queryFn: async () => (await fetchAnchorRefs(refs!)).reverse(),
    enabled: !!refs
  })

  return (
    <>
      <Text fontSize={'5xl'}>Latest Anchor Refs</Text>
      <hr />
      <br />
      <Text>Total {isPropSuccess ? prop.anchor_refs : 0} Anchor Refs</Text>
      <Box overflowX="auto" marginTop={'15px'}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Age</Th>
              <Th>Block Number</Th>
              <Th>Ref CID</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isTxRefsLoading ? (
              <Tr>
                {[...Array(4)].map((_, i) => (
                  <Td key={i}>
                    <Skeleton height="20px" />
                  </Td>
                ))}
              </Tr>
            ) : isTxRefsSuccess ? (
              txRefs.map((item, i) => (
                <Tr key={i}>
                  <Td>
                    <Link as={ReactRouterLink} to={'/anchor-ref/' + item.id}>
                      {item.id}
                    </Link>
                  </Td>
                  <Td sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip label={item.ts} placement="top">
                      {timeAgo(item.ts)}
                    </Tooltip>
                  </Td>
                  <Td isTruncated>
                    <Link as={ReactRouterLink} to={'/block/' + item.block_num}>
                      {item.block_num}
                    </Link>
                  </Td>
                  <Td isTruncated>
                    <Link as={ReactRouterLink} to={'/anchor-ref/' + item.id}>
                      {abbreviateHash(item.cid)}
                    </Link>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr></Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  )
}

export default AnchorRefs
