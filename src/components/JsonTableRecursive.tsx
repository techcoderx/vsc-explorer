import { Table, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import TableRow from './TableRow'

interface JTR {
  json: object
  isInCard?: boolean
  minimalSpace?: boolean
}

const JsonToTableRecursive = ({ json, isInCard = false, minimalSpace = false }: JTR): ReactNode => {
  return (
    <Table.Root>
      <Table.Body>
        {Object.entries(json).map(([key, value]) => {
          if (value === null)
            return (
              <TableRow key={key} isInCard={isInCard} allCardBorders label={key} isLoading={false} minimalSpace={minimalSpace}>
                <i>null</i>
              </TableRow>
            )
          if (Array.isArray(value) && value.length === 0)
            return (
              <TableRow key={key} isInCard={isInCard} allCardBorders label={key} isLoading={false} minimalSpace={minimalSpace}>
                <Text fontStyle="italic" opacity={0.6}>{'[]'}</Text>
              </TableRow>
            )
          if (typeof value === 'object')
            return (
              <TableRow key={key} isInCard={isInCard} allCardBorders label={key} isLoading={false} minimalSpace={minimalSpace}>
                {JsonToTableRecursive({ json: value, isInCard, minimalSpace })}
              </TableRow>
            )
          else if (typeof value === 'string' && value === '')
            return (
              <TableRow key={key} isInCard={isInCard} allCardBorders label={key} isLoading={false} minimalSpace={minimalSpace}>
                <Text fontStyle="italic" opacity={0.6}>empty</Text>
              </TableRow>
            )
          else
            return (
              <TableRow key={key} isInCard={isInCard} allCardBorders label={key} isLoading={false} minimalSpace={minimalSpace}>
                <Text wordBreak="break-all" style={{ whiteSpace: 'pre-wrap' }}>
                  {typeof value === 'string' ? value : value.toString()}
                </Text>
              </TableRow>
            )
        })}
      </Table.Body>
    </Table.Root>
  )
}

export default JsonToTableRecursive
