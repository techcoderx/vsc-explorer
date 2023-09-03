import { Table, Tbody, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import TableRow from './TableRow'

interface JTR {
  json: object
  isInCard?: boolean
  minimalSpace?: boolean
}

const JsonToTableRecursive = ({json, isInCard = false, minimalSpace = false}: JTR): ReactNode => {
  return (
    <Table variant={'unstyled'}>
      <Tbody>
        {Object.entries(json).map(([key, value]) => {
          if (typeof value === 'object')
            return <TableRow key={key} isInCard={isInCard} allCardBorders label={key} isLoading={false} minimalSpace={minimalSpace}>{JsonToTableRecursive({ json: value, isInCard, minimalSpace })}</TableRow>
          else
            return <TableRow key={key} isInCard={isInCard} allCardBorders label={key} isLoading={false} minimalSpace={minimalSpace}><Text wordBreak='break-all'>{typeof value === 'string' ? value : value.toString()}</Text></TableRow>
        })}
      </Tbody>
    </Table>
  )
}

export default JsonToTableRecursive