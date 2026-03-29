import { Badge, Card, Text } from '@chakra-ui/react'
import { Link } from 'react-router'
import { ReactNode } from 'react'
import { themeColor, themeColorScheme } from '../settings'
import { timeAgo } from '../helpers'
import { Tooltip } from './ui/tooltip'

type Attr = {
  id: number
  ts: string
  txid: string
  children?: ReactNode
}

export const TxCard = ({ children, ts, txid }: Attr) => {
  return (
    <Card.Root
      asChild
      width="100%"
      _hover={{ borderColor: themeColor, borderWidth: '0.5px' }}
      _light={{ _hover: { borderWidth: '1px' } }}
    >
      <Link to={'/tx/' + txid}>
      <Card.Body margin={'-5px'} py={'3'} display={'inline'}>
        <Text display={'inline'} marginRight={'5px'}>{children}</Text>
        <Tooltip content={ts} positioning={{ placement: 'top' }}>
          <Badge colorPalette={themeColorScheme} style={{}}>
            {timeAgo(ts)}
          </Badge>
        </Tooltip>
      </Card.Body>
      </Link>
    </Card.Root>
  )
}
