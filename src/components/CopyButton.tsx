import { useState, useRef, useEffect } from 'react'
import { Button } from '@chakra-ui/react'
import { Tooltip } from './ui/tooltip'
import { LuCheck, LuCopy } from 'react-icons/lu'

export const CopyButton = ({ text }: { text: string }) => {
  const [hasCopied, setHasCopied] = useState(false)
  const timeoutRef = useRef<number>(undefined)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setHasCopied(true)
        timeoutRef.current = window.setTimeout(() => {
          setHasCopied(false)
        }, 1500)
      })
      .catch((err) => {
        console.error('Failed to copy text:', err)
      })
  }

  return (
    <Tooltip content={hasCopied ? 'Copied!' : 'Copy to clipboard'} positioning={{ placement: 'top' }}>
      <Button variant={'outline'} colorPalette={'gray'} onClick={handleCopy} aria-label={hasCopied ? 'Copied!' : 'Copy to clipboard'}>
        {hasCopied ? <LuCheck /> : <LuCopy />}
      </Button>
    </Tooltip>
  )
}
