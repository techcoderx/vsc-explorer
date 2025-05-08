import { useParams, Navigate } from 'react-router'
import PageNotFound from './404'

const L1User = () => {
  const { username } = useParams()
  const user = username && username.startsWith('@') ? username.replace('@', '') : ''
  if (!user) return <PageNotFound />
  return <Navigate to={`/address/hive:${user}`} replace />
}

export default L1User
