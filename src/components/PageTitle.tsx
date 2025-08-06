import { useEffect } from 'react'
import { useLocation } from 'react-router'

export const PageTitle = ({ title }: { title: string }) => {
  const location = useLocation()

  useEffect(() => {
    document.title = `${title} | VSC Blocks`

    return () => {
      document.title = 'VSC Blocks'
    }
  }, [location, title])

  return null
}
