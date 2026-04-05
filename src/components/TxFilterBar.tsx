import { Flex, NativeSelect, Input, Field, DatePicker, IconButton, Button, Collapsible } from '@chakra-ui/react'
import { parseDate } from '@chakra-ui/react/date-picker'
import type { DateValue } from '@chakra-ui/react/date-picker'
import { useSearchParams, useNavigate } from 'react-router'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TX_STATUS_OPTIONS, TX_TYPE_OPTIONS } from '../types/TxFilters'
import { themeColorScheme } from '../settings'
import { LuCalendar, LuX, LuFilter } from 'react-icons/lu'

const FILTER_KEYS = ['status', 'type', 'from', 'to', 'account', 'contract']

export const TxFilterToggle = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => {
  const [searchParams] = useSearchParams()
  const { t } = useTranslation('filters')
  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length
  return (
    <Button size={'sm'} variant={open ? 'solid' : 'outline'} colorPalette={'gray'} onClick={onToggle}>
      <LuFilter />
      {t('filters')}{activeCount > 0 ? ` (${activeCount})` : ''}
    </Button>
  )
}

interface TxFilterBarProps {
  open: boolean
  showAccount?: boolean
  showContract?: boolean
  basePath: string
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

const readParam = (sp: URLSearchParams, key: string) => sp.get(key) || ''

export const TxFilterBar = ({ open, showAccount, showContract, basePath }: TxFilterBarProps) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation('filters')

  const initState = useCallback(
    () => ({
      status: readParam(searchParams, 'status'),
      type: readParam(searchParams, 'type'),
      from: isValidISODate(readParam(searchParams, 'from')) ? readParam(searchParams, 'from') : '',
      to: isValidISODate(readParam(searchParams, 'to')) ? readParam(searchParams, 'to') : '',
      account: readParam(searchParams, 'account'),
      contract: readParam(searchParams, 'contract')
    }),
    [searchParams]
  )

  const [draft, setDraft] = useState(initState)

  const set = (key: string, value: string) => setDraft((prev) => ({ ...prev, [key]: value }))

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (draft.status) params.set('status', draft.status)
    if (draft.type) params.set('type', draft.type)
    if (draft.from) params.set('from', draft.from)
    if (draft.to) params.set('to', draft.to)
    if (draft.account) params.set('account', draft.account.trim())
    if (draft.contract) params.set('contract', draft.contract.trim())
    const qs = params.toString()
    navigate(basePath + (qs ? '?' + qs : ''))
  }

  const resetFilters = () => {
    setDraft({ status: '', type: '', from: '', to: '', account: '', contract: '' })
    navigate(basePath)
  }

  return (
    <Collapsible.Root open={open}>
      <Collapsible.Content>
        <Flex gap={'3'} my={'3'} wrap={'wrap'} align={'end'}>
          <Field.Root maxW={'180px'}>
            <Field.Label fontSize={'xs'}>{t('statusLabel')}</Field.Label>
            <NativeSelect.Root size={'sm'}>
              <NativeSelect.Field value={draft.status} onChange={(e) => set('status', e.target.value)}>
                {TX_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(`status.${o.value}`)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root maxW={'180px'}>
            <Field.Label fontSize={'xs'}>{t('typeLabel')}</Field.Label>
            <NativeSelect.Root size={'sm'}>
              <NativeSelect.Field value={draft.type} onChange={(e) => set('type', e.target.value)}>
                {TX_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(`txType.${o.value}`)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <DateFilterField label={t('fromDate')} value={draft.from} onChange={(v) => set('from', v)} />
          <DateFilterField label={t('toDate')} value={draft.to} onChange={(v) => set('to', v)} />
          {showAccount && (
            <Field.Root maxW={'240px'}>
              <Field.Label fontSize={'xs'}>{t('account')}</Field.Label>
              <Input
                size={'sm'}
                placeholder="hive:username"
                value={draft.account}
                onChange={(e) => set('account', e.target.value)}
              />
            </Field.Root>
          )}
          {showContract && (
            <Field.Root maxW={'240px'}>
              <Field.Label fontSize={'xs'}>{t('contract')}</Field.Label>
              <Input
                size={'sm'}
                placeholder="vsc1..."
                value={draft.contract}
                onChange={(e) => set('contract', e.target.value)}
              />
            </Field.Root>
          )}
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
