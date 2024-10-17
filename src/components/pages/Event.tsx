import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
  Skeleton,
  Table,
  Tbody,
  Text
} from '@chakra-ui/react'
import { useParams, Link as ReactRouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import TableRow from '../TableRow'
import JsonToTableRecursive from '../JsonTableRecursive'
import { themeColorScheme, themeColorLight, ipfsSubGw } from '../../settings'
import { fetchEvents } from '../../requests'
import { timeAgo, isPuralArr } from '../../helpers'

export const Event = () => {
  const { cid } = useParams()
  const {
    data: events,
    isLoading,
    isError,
    isSuccess
  } = useQuery({
    queryKey: ['vsc-event', cid],
    queryFn: () => fetchEvents(cid!),
    enabled: !!cid
  })
  return (
    <Box marginBottom={'15px'}>
      <Text fontSize={'5xl'}>Event</Text>
      <Text fontSize={'2xl'} opacity={'0.7'}>
        {cid}
      </Text>
      <Button
        as={ReactRouterLink}
        margin={'20px 0px'}
        colorScheme={themeColorScheme}
        variant={'outline'}
        to={ipfsSubGw(cid || '')}
        target="_blank"
      >
        View in IPFS
      </Button>
      {isLoading ? <Skeleton h={'20px'} mt={'20px'} /> : null}
      {isSuccess && !events.error ? (
        <Box>
          <Table>
            <Tbody>
              <TableRow
                label="Timestamp"
                value={events ? events.ts + ' (' + timeAgo(events.ts) + ')' : ''}
                isLoading={isLoading}
              />
              <TableRow label="Included In Block">
                <Link as={ReactRouterLink} to={'/block/' + events.block_num}>
                  {events.block_num}
                </Link>{' '}
                <Badge color={themeColorLight}>Position: {events.idx_in_block}</Badge>
              </TableRow>
            </Tbody>
          </Table>
          {Array.isArray(events.events) ? (
            <Box>
              <Heading mt={'7'} fontSize={'xl'}>
                Events emitted for {events.events.length} transaction{isPuralArr(events.events) ? 's' : ''}
              </Heading>
              <Accordion mt={'4'} allowMultiple>
                {events.events.map((eventTx, i) => (
                  <AccordionItem key={i}>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        {eventTx.tx_id}
                        <Badge ml={'3'} color={themeColorLight}>
                          {eventTx.tx_type}
                        </Badge>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      {eventTx.events.map((evt, j) => (
                        <Card key={j} mb={'5'}>
                          <CardHeader>
                            <Heading fontSize={'2xl'}>Event #{j}</Heading>
                          </CardHeader>
                          <CardBody mt={'-20px'}>
                            <JsonToTableRecursive json={evt} minimalSpace isInCard />
                          </CardBody>
                        </Card>
                      ))}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
          ) : null}
        </Box>
      ) : isSuccess && events.error ? (
        <Text>{events.error}</Text>
      ) : isError ? (
        <Text>Failed to fetch VSC event</Text>
      ) : null}
    </Box>
  )
}
