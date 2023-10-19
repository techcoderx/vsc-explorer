import { Badge, Card, CardBody, Text, Tooltip } from "@chakra-ui/react"
import { Link } from 'react-router-dom'
import { ReactNode } from "react"
import { themeColor, themeColorLight } from "../settings"
import { timeAgo } from "../helpers"
import { TransactionTypes } from '../types/L2ApiResult'

type Attr = {
  id: number
  ts: string
  txid: string
  children?: ReactNode
}

export const TxCard = ({children, ts, txid}: Attr) => {
  return (
    <Card as={Link} to={'/tx/'+txid} width='100%' _hover={{borderColor: themeColor, borderWidth: '0.5px'}} _light={{_hover: { borderWidth: '1px' }}}>
      <CardBody margin={'-5px'}>
        <Text style={{display: 'inline', marginRight: '5px'}}>{children}</Text>
        <Tooltip label={ts} placement='top'>
          <Badge color={themeColorLight} style={{}}>{timeAgo(ts)}</Badge>
        </Tooltip>
      </CardBody>
    </Card>
  )
}

type L2TxAttr = {
  id: number
  ts: string
  txid: string
  op: TransactionTypes
}

export const L2TxCard = ({ts, txid, op}: L2TxAttr) => {
  return (
    <Card as={Link} to={'/vsc-tx/'+txid} width={'100%'} _hover={{borderColor: themeColor, borderWidth: '0.5px'}} _light={{_hover: { borderWidth: '1px' }}}>
      <CardBody margin={'-5px'}>
        <Text style={{display: 'inline', marginRight: '5px'}}>{txid}</Text>
        <Tooltip label={ts+' ('+timeAgo(ts)+')'} placement='top'>
          <Badge color={themeColorLight} style={{}}>{op}</Badge>
        </Tooltip>
      </CardBody>
    </Card>
  )
}