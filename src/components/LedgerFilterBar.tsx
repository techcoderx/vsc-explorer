import { Flex, NativeSelect, Field, Button, Collapsible, Input, IconButton, DatePicker } from '@chakra-ui/react'
import { parseDate } from '@chakra-ui/react/date-picker'
import type { DateValue } from '@chakra-ui/react/date-picker'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LEDGER_TX_TYPE_OPTIONS, LEDGER_ACTION_TYPE_OPTIONS, LEDGER_ASSET_OPTIONS } from '../types/LedgerFilters'
import { themeColorScheme } from '../settings'
import { LuFilter, LuCalendar, LuX } from 'react-icons/lu'
import { LedgerFilterState, LedgerFilterVariant, emptyLedgerFilters } from '../ledgerFilterHelpers'

export const LedgerFilterToggle = ({
  activeCount,
  open,
  onToggle
}: {
  activeCount: number
  open: boolean
  onToggle: () => void
}) => {
  const { t } = useTranslation('filters')
  return (
    <Button size={'sm'} variant={open ? 'solid' : 'outline'} colorPalette={'gray'} onClick={onToggle}>
      <LuFilter />
      {t('filters')}
      {activeCount > 0 ? ` (${activeCount})` : ''}
    </Button>
  )
}

const isValidISODate = (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val)

const safeParse = (val: string): DateValue[] => {
  if (!val || !isValidISODate(val)) return []
  try {
    return [parseDate(val)]
  } catch {
    return []
  }
}

const DateFilterField = ({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (val: string) => void
}) => {
  return (
    <Field.Root maxW={'200px'}>
      <Field.Label fontSize={'xs'}>{label}</Field.Label>
      <DatePicker.Root
        size={'sm'}
        value={safeParse(value)}
        onValueChange={(details) => {
          const val = details.value[0]
          onChange(val ? val.toString() : '')
        }}
        closeOnSelect
      >
        <DatePicker.Control>
          <DatePicker.Input asChild>
            <Input size={'sm'} />
          </DatePicker.Input>
          {value ? (
            <IconButton
              variant={'ghost'}
              size={'2xs'}
              aria-label={`Clear ${label.toLowerCase()} date`}
              onClick={() => onChange('')}
            >
              <LuX />
            </IconButton>
          ) : (
            <DatePicker.Trigger asChild>
              <IconButton variant={'ghost'} size={'2xs'} aria-label={`Open ${label.toLowerCase()} date picker`}>
                <LuCalendar />
              </IconButton>
            </DatePicker.Trigger>
          )}
        </DatePicker.Control>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Header />
              <DatePicker.DayTable />
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Header />
              <DatePicker.MonthTable />
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Header />
              <DatePicker.YearTable />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </DatePicker.Root>
    </Field.Root>
  )
}

interface LedgerFilterBarProps {
  open: boolean
  variant: LedgerFilterVariant
  onApply: (filters: LedgerFilterState) => void
  onReset: () => void
}

export const LedgerFilterBar = ({ open, variant, onApply, onReset }: LedgerFilterBarProps) => {
  const { t } = useTranslation('filters')
  const typeOptions = variant === 'ledger_txs' ? LEDGER_TX_TYPE_OPTIONS : LEDGER_ACTION_TYPE_OPTIONS

  const [draft, setDraft] = useState<LedgerFilterState>(emptyLedgerFilters)

  const set = (key: keyof LedgerFilterState, value: string) => setDraft((prev) => ({ ...prev, [key]: value }))

  const applyFilters = () => {
    onApply(draft)
  }

  const resetFilters = () => {
    setDraft(emptyLedgerFilters)
    onReset()
  }

  return (
    <Collapsible.Root open={open}>
      <Collapsible.Content>
        <Flex gap={'3'} my={'3'} wrap={'wrap'} align={'end'}>
          <Field.Root maxW={'180px'}>
            <Field.Label fontSize={'xs'}>{t('typeLabel')}</Field.Label>
            <NativeSelect.Root size={'sm'}>
              <NativeSelect.Field value={draft.opType} onChange={(e) => set('opType', e.target.value)}>
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(`txType.${o.value}`)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root maxW={'180px'}>
            <Field.Label fontSize={'xs'}>{t('assetLabel')}</Field.Label>
            <NativeSelect.Root size={'sm'}>
              <NativeSelect.Field value={draft.asset} onChange={(e) => set('asset', e.target.value)}>
                {LEDGER_ASSET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(`asset.${o.value}`)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <DateFilterField label={t('fromDate')} value={draft.fromDate} onChange={(v) => set('fromDate', v)} />
          <DateFilterField label={t('toDate')} value={draft.toDate} onChange={(v) => set('toDate', v)} />
          <Button size={'sm'} colorPalette={themeColorScheme} onClick={applyFilters}>
            {t('apply')}
          </Button>
          <Button size={'sm'} variant={'outline'} colorPalette={'gray'} onClick={resetFilters}>
            {t('reset')}
          </Button>
        </Flex>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
