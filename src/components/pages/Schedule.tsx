import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Heading, Text, Table, Link } from '@chakra-ui/react'
import { Switch } from '../ui/switch'
import { Link as ReactRouterLink } from 'react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { themeColorScheme, getConf } from '../../settings'
import { fetchBlock, fetchProps, getWitnessSchedule } from '../../requests'
import { abbreviateHash, beL1BlockUrl, thousandSeperator } from '../../helpers'
import { Block } from '../../types/HafApiResult'
import { PageTitle } from '../PageTitle'

const WitnessSchedule = () => {
  const { t } = useTranslation('pages')
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
    enabled: !!prop && !!prop.last_processed_block,
    placeholderData: keepPreviousData
  })
  const currentSlot = prop ? prop.last_processed_block - (prop.last_processed_block % 10) : 0
  const { data: blockAtCurrentSlot } = useQuery({
    queryKey: ['vsc-block', 'slot', currentSlot],
    queryFn: () => fetchBlock(currentSlot, 'slot'),
    enabled: !!currentSlot,
    refetchInterval: 3000
  })
  // eslint-disable-next-line react-hooks/refs
  if (blockAtCurrentSlot && !blockAtCurrentSlot.error) blocksProduced.current[currentSlot] = blockAtCurrentSlot
  useEffect(() => {
    const l2BlockNums = Object.keys(blocksProduced.current)
    if (l2BlockNums.length > 50) {
      // cleanup blocksProduced periodically
      let min = parseInt(l2BlockNums[0])
      for (const i in l2BlockNums) if (parseInt(l2BlockNums[i]) < min) min = parseInt(l2BlockNums[i])
      delete blocksProduced.current[min.toString()]
    }
  }, [blockAtCurrentSlot])
  useEffect(() => {
    const fb = async () => {
      const blocks: Block[] = await (await fetch(`${getConf().beApi}/blocks?count=50`)).json()
      for (const b in blocks) blocksProduced.current[blocks[b].slot_height] = blocks[b]
    }
    fb()
  }, [])
  return (
    <>
      <PageTitle title={t('schedule.title')} />
      <Heading as="h1" size="5xl" fontWeight="normal">{t('schedule.title')}</Heading>
      <hr />
      <br />
      <Text>
        {t('schedule.hiveHeadBlock')}{' '}
        <Link asChild>
          <ReactRouterLink to={beL1BlockUrl(prop?.last_processed_block || 0)} target="_blank" rel="noopener noreferrer" aria-label={`Block ${isPropSuccess ? thousandSeperator(prop.last_processed_block) : 0} (opens in new tab)`}>
            {isPropSuccess ? thousandSeperator(prop.last_processed_block) : 0}
          </ReactRouterLink>
        </Link>
      </Text>
      <Box overflowX="auto" maxW={'xl'} margin={'10px auto 15px auto'}>
        <Flex alignItems="center" gap={3} mb={'10px'}>
          <label htmlFor="witsch-expand">{t('schedule.showOlderSlots')}</label>
          <Switch id="witsch-expand" colorPalette={themeColorScheme} size={'lg'} onCheckedChange={() => setExpSchedule(!expSchedule)} />
        </Flex>
        <Table.Root variant={'line'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('schedule.username', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('schedule.l1Block', { ns: 'tables' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('schedule.magiBlock', { ns: 'tables' })}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isScheduleSuccess && isPropSuccess
              // eslint-disable-next-line react-hooks/refs
              ? schedule.data.witnessSchedule.map((sch, i) => {
                  return sch.bn - prop.last_processed_block > -50 || expSchedule ? (
                    <Table.Row
                      key={i}
                      opacity={sch.bn - prop.last_processed_block > -10 ? '100%' : '50%'}
                      fontWeight={
                        sch.bn - prop.last_processed_block > -10 && sch.bn - prop.last_processed_block <= 0 ? 'bold' : 'normal'
                      }
                    >
                      <Table.Cell>
                        <Link asChild>
                          <ReactRouterLink to={'/address/hive:' + sch.account}>
                            {sch.account}
                          </ReactRouterLink>
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        {sch.bn - prop.last_processed_block < 0 ? (
                          <Link asChild>
                            <ReactRouterLink to={beL1BlockUrl(sch.bn)} target="_blank" rel="noopener noreferrer" aria-label={`Block ${thousandSeperator(sch.bn)} (opens in new tab)`}>
                              {thousandSeperator(sch.bn)}
                            </ReactRouterLink>
                          </Link>
                        ) : (
                          thousandSeperator(sch.bn)
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {blocksProduced.current[sch.bn] ? (
                          <Link asChild>
                            <ReactRouterLink to={'/block/' + blocksProduced.current[sch.bn].block}>
                              {abbreviateHash(blocksProduced.current[sch.bn].block, 12, 0)}
                            </ReactRouterLink>
                          </Link>
                        ) : null}
                      </Table.Cell>
                    </Table.Row>
                  ) : null
                })
              : null}
          </Table.Body>
        </Table.Root>
      </Box>
    </>
  )
}

export default WitnessSchedule
