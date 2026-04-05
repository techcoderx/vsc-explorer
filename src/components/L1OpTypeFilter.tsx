import { Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { MenuRoot, MenuTrigger, MenuContent, MenuCheckboxItem, MenuSeparator, MenuItem } from './ui/menu'
import { L1_OP_TYPES, toggleOp, setL1OpsFilter, useL1OpsFilter } from '../l1OpTypes'
import { LuFilter } from 'react-icons/lu'

export const L1OpTypeFilter = ({ filterKey }: { filterKey: string }) => {
  const bitmask = useL1OpsFilter(filterKey)
  const { t } = useTranslation('filters')
  const activeCount = L1_OP_TYPES.filter((op) => (bitmask & op.filterer) > 0).length

  return (
    <MenuRoot closeOnSelect={false}>
      <MenuTrigger asChild>
        <Button size={'sm'} variant={bitmask > 0 ? 'solid' : 'outline'} colorPalette={'gray'} _focusVisible={{ outline: 'none' }}>
          <LuFilter />
          {t('opTypes')}{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      </MenuTrigger>
      <MenuContent maxHeight={'300px'} overflowY={'auto'}>
        {L1_OP_TYPES.map((op) => (
          <MenuCheckboxItem
            key={op.name}
            value={op.name}
            checked={(bitmask & op.filterer) > 0}
            onCheckedChange={() => setL1OpsFilter(filterKey, toggleOp(bitmask, op.filterer))}
          >
            {t(`l1OpType.${op.name}`)}
          </MenuCheckboxItem>
        ))}
        {bitmask > 0 && (
          <>
            <MenuSeparator />
            <MenuItem value={'reset'} onClick={() => setL1OpsFilter(filterKey, 0)}>
              {t('reset')}
            </MenuItem>
          </>
        )}
      </MenuContent>
    </MenuRoot>
  )
}
