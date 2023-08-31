import { Badge, Card, CardBody, Text } from "@chakra-ui/react"
import { ReactNode } from "react"
import { themeColorLight } from "../settings"
import { timeAgo } from "../helpers"

type Attr = {
  id: number
  ts: string | Date
  children?: ReactNode
}

const TxCard = ({children, ts}: Attr) => {
  return (
    <Card>
      <CardBody margin={'-5px'}>
        <Text style={{display: 'inline', marginRight: '5px'}}>{children}</Text>
        <Badge color={themeColorLight} style={{}}>{timeAgo(ts)}</Badge>
      </CardBody>
    </Card>
  )
}

export default TxCard