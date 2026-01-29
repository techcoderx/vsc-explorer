import { useEffect, useRef, useState } from 'react'
import { Box, Text, Table, Thead, Tbody, Th, Tr, Td, Link, FormControl, FormLabel, Switch } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { themeColorScheme, beApi } from '../../settings'
import { fetchBlock, fetchProps, getWitnessSchedule } from '../../requests'
import { abbreviateHash, beL1BlockUrl, thousandSeperator } from '../../helpers'
import { Block } from '../../types/HafApiResult'
import { PageTitle } from '../PageTitle'

const WitnessSchedule = () => {
  const [expSchedule, setExpSchedule] = useState(false)
  const blocksProduced = useRef<{ [blockNum: string]: Block }>({})
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps,
    refetchOnWindowFocus: false,
    refetchInterval: 10000
  })
  const { data: schedule, isSuccess: isScheduleSuccess } = useQuery({
    queryKey: ['vsc-witness-schedule', prop?.last_processed_block],
    queryFn: async () => getWitnessSchedule(prop!.last_processed_block),
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
    enabled: !!prop && !!prop.last_processed_block
  })
  const currentSlot = prop ? prop.last_processed_block - (prop.last_processed_block % 10) : 0
  const { data: blockAtCurrentSlot } = useQuery({
    queryKey: ['vsc-block', 'slot', currentSlot],
    queryFn: () => fetchBlock(currentSlot, 'slot'),
    enabled: !!currentSlot,
    refetchInterval: 3000
  })
  if (blockAtCurrentSlot && !blockAtCurrentSlot.error) blocksProduced.current[currentSlot] = blockAtCurrentSlot
  useEffect(() => {
    const l2BlockNums = Object.keys(blocksProduced.current)
    if (l2BlockNums.length > 50) {
      // cleanup blocksProduced periodically
      let min = parseInt(l2BlockNums[0])
      for (let i in l2BlockNums) if (parseInt(l2BlockNums[i]) < min) min = parseInt(l2BlockNums[i])
      delete blocksProduced.current[min.toString()]
    }
  }, [blockAtCurrentSlot])
  useEffect(() => {
    const fb = async () => {
      const blocks: Block[] = await (await fetch(`${beApi}/blocks?count=50`)).json()
      for (let b in blocks) blocksProduced.current[blocks[b].slot_height] = blocks[b]
    }
    fb()
  }, [])
  return (
    <>
      <PageTitle title="Schedule" />
      <Text fontSize={'5xl'}>Schedule</Text>
      <hr />
      <br />
      <Text>
        Hive head block:{' '}
        <Link as={ReactRouterLink} to={beL1BlockUrl(prop?.last_processed_block || 0)} target="_blank">
          {isPropSuccess ? thousandSeperator(prop.last_processed_block) : 0}
        </Link>
      </Text>
      <Box overflowX="auto" maxW={'xl'} margin={'10px auto 15px auto'}>
        <FormControl display="flex" alignItems="center" mb={'10px'}>
          <FormLabel htmlFor="witsch-expand" mb="0">
            Show Older Slots
          </FormLabel>
          <Switch id="witsch-expand" colorScheme={themeColorScheme} size={'lg'} onChange={() => setExpSchedule(!expSchedule)} />
        </FormControl>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>L1 Block</Th>
              <Th>Magi Block</Th>
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
                        <Link as={ReactRouterLink} to={'/address/hive:' + sch.account}>
                          {sch.account}
                        </Link>
                      </Td>
                      <Td>
                        {sch.bn - prop.last_processed_block < 0 ? (
                          <Link as={ReactRouterLink} to={beL1BlockUrl(sch.bn)} target="_blank">
                            {thousandSeperator(sch.bn)}
                          </Link>
                        ) : (
                          thousandSeperator(sch.bn)
                        )}
                      </Td>
                      <Td>
                        {blocksProduced.current[sch.bn] ? (
                          <Link as={ReactRouterLink} to={'/block/' + blocksProduced.current[sch.bn].block}>
                            {abbreviateHash(blocksProduced.current[sch.bn].block, 12, 0)}
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
