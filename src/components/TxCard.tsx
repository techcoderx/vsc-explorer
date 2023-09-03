import { Badge, Card, CardBody, Text, Tooltip } from "@chakra-ui/react"
import { Link } from 'react-router-dom'
import { ReactNode } from "react"
import { themeColor, themeColorLight } from "../settings"
import { timeAgo } from "../helpers"

type Attr = {
  id: number
  ts: string
  txid: string
  children?: ReactNode
  width?: any
}

const TxCard = ({children, ts, txid, width}: Attr) => {
  return (
    <Card as={Link} to={'/tx/'+txid} width={width} _hover={{borderColor: themeColor, borderWidth: '0.5px'}} _light={{_hover: { borderWidth: '1px' }}}>
      <CardBody margin={'-5px'}>
        <Text style={{display: 'inline', marginRight: '5px'}}>{children}</Text>
        <Tooltip label={ts} placement='top'>
          <Badge color={themeColorLight} style={{}}>{timeAgo(ts)}</Badge>
        </Tooltip>
      </CardBody>
    </Card>
  )
}

export default TxCard