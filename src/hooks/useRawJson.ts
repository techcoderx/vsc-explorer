import { useCallback, useState } from 'react'

const STORAGE_KEY = 'magi-raw-json'

function getStoredValue(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function useRawJson() {
  const [rawJson, setRawJsonState] = useState<boolean>(getStoredValue)

  const setRawJson = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value))
    setRawJsonState(value)
  }, [])

  return { rawJson, setRawJson }
}
