import { useState } from 'react'
import { useSearchParams } from 'react-router'

const FILTER_KEYS = ['status', 'type', 'from', 'to', 'account', 'contract']

export const useFilterOpen = () => {
  const [searchParams] = useSearchParams()
  const hasActiveFilters = FILTER_KEYS.some((k) => searchParams.get(k))
  return useState(hasActiveFilters)
}
