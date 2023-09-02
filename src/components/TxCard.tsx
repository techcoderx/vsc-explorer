import { Badge, Card, CardBody, Text, Tooltip } from "@chakra-ui/react"
import { ReactNode } from "react"
import { themeColorLight } from "../settings"
import { timeAgo } from "../helpers"

type Attr = {
  id: number
  ts: string
  children?: ReactNode
  width?: any
}

const TxCard = ({children, ts, width}: Attr) => {
  return (
    <Card width={width}>
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