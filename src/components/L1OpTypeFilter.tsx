import { Button } from '@chakra-ui/react'
import { useSearchParams, useNavigate } from 'react-router'
import { MenuRoot, MenuTrigger, MenuContent, MenuCheckboxItem, MenuSeparator, MenuItem } from './ui/menu'
import { L1_OP_TYPES, parseBitmaskParam, toggleOp } from '../l1OpTypes'
import { LuFilter } from 'react-icons/lu'

export const L1OpTypeFilter = ({ basePath }: { basePath: string }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bitmask = parseBitmaskParam(searchParams.get('ops'))
  const activeCount = L1_OP_TYPES.filter((op) => (bitmask & op.filterer) > 0).length

  const update = (newBitmask: number) => {
    const params = new URLSearchParams(searchParams)
    if (newBitmask > 0) {
      params.set('ops', String(newBitmask))
    } else {
      params.delete('ops')
    }
    const qs = params.toString()
    navigate(basePath + (qs ? '?' + qs : ''))
  }

  return (
    <MenuRoot closeOnSelect={false}>
      <MenuTrigger asChild>
        <Button size={'sm'} variant={bitmask > 0 ? 'solid' : 'outline'} colorPalette={'gray'} _focusVisible={{ outline: 'none' }}>
          <LuFilter />
          Op Types{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      </MenuTrigger>
      <MenuContent maxHeight={'300px'} overflowY={'auto'}>
        {L1_OP_TYPES.map((op) => (
          <MenuCheckboxItem
            key={op.name}
            value={op.name}
            checked={(bitmask & op.filterer) > 0}
            onCheckedChange={() => update(toggleOp(bitmask, op.filterer))}
          >
            {op.label}
          </MenuCheckboxItem>
        ))}
        {bitmask > 0 && (
          <>
            <MenuSeparator />
            <MenuItem value={'reset'} onClick={() => update(0)}>
              Reset
            </MenuItem>
          </>
        )}
      </MenuContent>
    </MenuRoot>
  )
}
