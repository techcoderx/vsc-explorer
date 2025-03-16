import { useState, useRef, useEffect } from 'react'
import { Tooltip, Button } from '@chakra-ui/react'
import { CheckIcon, CopyIcon } from '@chakra-ui/icons'

export const CopyButton = ({ text }: { text: string }) => {
  const [hasCopied, setHasCopied] = useState(false)
  const timeoutRef = useRef<number>()

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
    <Tooltip label={hasCopied ? 'Copied!' : 'Copy to clipboard'} placement="top" closeOnClick={false}>
      <Button onClick={handleCopy} aria-label={hasCopied ? 'Copied!' : 'Copy to clipboard'}>
        {hasCopied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </Tooltip>
  )
}
