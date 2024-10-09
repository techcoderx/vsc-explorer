import { useState } from 'react'
import { Box, Text, Table, Thead, Tbody, Th, Tr, Td, Link, FormControl, FormLabel, Switch } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { l1Explorer, themeColorScheme } from '../../settings'
import { fetchProps, getWitnessSchedule } from '../../requests'
import { thousandSeperator } from '../../helpers'

const WitnessSchedule = () => {
  const [expSchedule, setExpSchedule] = useState(false)
  const { data: prop, isSuccess: isPropSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  const { data: schedule, isSuccess: isScheduleSuccess } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-witness-schedule'],
    queryFn: async () => getWitnessSchedule()
  })
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
            </Tr>
          </Thead>
          <Tbody>
            {isScheduleSuccess && isPropSuccess
              ? schedule.data.witnessSchedule.map((sch, i) => {
                  return sch.bn - prop.last_processed_block > -50 || expSchedule ? (
                    <Tr
                      key={i}
                      opacity={sch.bn - prop.last_processed_block > -9 ? '100%' : '50%'}
                      fontWeight={
                        sch.bn - prop.last_processed_block >= -10 && sch.bn - prop.last_processed_block < 0 ? 'bold' : 'normal'
                      }
                    >
                      <Td>
                        <Link as={ReactRouterLink} to={'/@' + sch.account}>
                          {sch.account}
                        </Link>
                      </Td>
                      <Td>{thousandSeperator(sch.bn)}</Td>
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
