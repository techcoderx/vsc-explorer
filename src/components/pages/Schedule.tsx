import { useEffect, useRef, useState } from 'react'
import { Box, Text, Table, Thead, Tbody, Th, Tr, Td, Link, FormControl, FormLabel, Switch } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { l1Explorer, themeColorScheme } from '../../settings'
import { fetchBlocks, fetchProps, getWitnessSchedule } from '../../requests'
import { thousandSeperator } from '../../helpers'
import { BlockRangeItm } from '../../types/HafApiResult'

const WitnessSchedule = () => {
  const [expSchedule, setExpSchedule] = useState(false)
  const blocksProduced = useRef<{ [blockNum: string]: BlockRangeItm }>({})
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    refetchOnWindowFocus: false,
    refetchInterval: 10000
  })
  const { data: schedule, isSuccess: isScheduleSuccess } = useQuery({
    queryKey: ['vsc-witness-schedule'],
    queryFn: async () => getWitnessSchedule(),
    refetchOnWindowFocus: false,
    refetchInterval: 60000
  })
  const { data: latestBlock } = useQuery({
    queryKey: ['vsc-latest-block'],
    queryFn: () => fetchBlocks(prop!.l2_block_height, 1),
    enabled: !!prop && !!prop.l2_block_height,
    refetchInterval: 10000
  })
  if (latestBlock && Array.isArray(latestBlock) && latestBlock.length >= 1)
    blocksProduced.current[(latestBlock[0].l1_block - (latestBlock[0].l1_block % 10)).toString()] = latestBlock[0]
  useEffect(() => {
    const l2BlockNums = Object.keys(blocksProduced.current)
    if (l2BlockNums.length > 50) {
      // cleanup blocksProduced periodically
      let min = parseInt(l2BlockNums[0])
      for (let i in l2BlockNums) if (parseInt(l2BlockNums[i]) < min) min = parseInt(l2BlockNums[i])
      delete blocksProduced.current[min.toString()]
    }
  }, [latestBlock])
  return (
    <>
      <Text fontSize={'5xl'}>Schedule</Text>
      <hr />
      <br />
      <Text>
        Hive head block:{' '}
        <Link as={ReactRouterLink} to={l1Explorer + '/b/' + prop?.last_processed_block} target="_blank">
          {isPropSuccess ? thousandSeperator(prop.last_processed_block) : 0}
        </Link>
      </Text>
      <Box overflowX="auto" maxW={'xl'} margin={'10px auto 15px auto'}>
        <FormControl display="flex" alignItems="center" mb={'10px'}>
          <FormLabel htmlFor="witsch-expand" mb="0">
            Show Older Blocks
          </FormLabel>
          <Switch id="witsch-expand" colorScheme={themeColorScheme} size={'lg'} onChange={() => setExpSchedule(!expSchedule)} />
        </FormControl>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>L1 Block</Th>
              <Th>VSC Block</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isScheduleSuccess && isPropSuccess
              ? schedule.data.witnessSchedule.map((sch, i) => {
                  return sch.bn - prop.last_processed_block > -50 || expSchedule ? (
                    <Tr
                      key={i}
                      opacity={sch.bn - prop.last_processed_block > -10 ? '100%' : '50%'}
                      fontWeight={
                        sch.bn - prop.last_processed_block > -10 && sch.bn - prop.last_processed_block <= 0 ? 'bold' : 'normal'
                      }
                    >
                      <Td>
                        <Link as={ReactRouterLink} to={'/@' + sch.account}>
                          {sch.account}
                        </Link>
                      </Td>
                      <Td>
                        {sch.bn - prop.last_processed_block < 0 ? (
                          <Link as={ReactRouterLink} to={l1Explorer + '/b/' + sch.bn} target="_blank">
                            {thousandSeperator(sch.bn)}
                          </Link>
                        ) : (
                          thousandSeperator(sch.bn)
                        )}
                      </Td>
                      <Td>
                        {blocksProduced.current[sch.bn] ? (
                          <Link as={ReactRouterLink} to={'/block/' + blocksProduced.current[sch.bn].id}>
                            {thousandSeperator(blocksProduced.current[sch.bn].id)}
                          </Link>
                        ) : null}
                      </Td>
                    </Tr>
                  ) : null
                })
              : null}
          </Tbody>
        </Table>
      </Box>
    </>
  )
}

export default WitnessSchedule
