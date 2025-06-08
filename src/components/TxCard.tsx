import { Badge, Card, CardBody, Text, Tooltip } from '@chakra-ui/react'
import { Link } from 'react-router'
import { ReactNode } from 'react'
import { themeColor, themeColorScheme } from '../settings'
import { timeAgo } from '../helpers'

type Attr = {
  id: number
  ts: string
  txid: string
  children?: ReactNode
}

export const TxCard = ({ children, ts, txid }: Attr) => {
  return (
    <Card
      as={Link}
      to={'/tx/' + txid}
      width="100%"
      _hover={{ borderColor: themeColor, borderWidth: '0.5px' }}
      _light={{ _hover: { borderWidth: '1px' } }}
    >
      <CardBody margin={'-5px'}>
        <Text style={{ display: 'inline', marginRight: '5px' }}>{children}</Text>
        <Tooltip label={ts} placement="top">
          <Badge colorScheme={themeColorScheme} style={{}}>
            {timeAgo(ts)}
          </Badge>
        </Tooltip>
      </CardBody>
    </Card>
  )
}
