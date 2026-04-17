import { useLocation } from 'react-router'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description?: string
  noindex?: boolean
  canonical?: string
  ogType?: string
}

export const PageTitle = ({ title, description, noindex, canonical, ogType }: SEOProps) => {
  const location = useLocation()
  const fullTitle = `${title} | Magi Blocks`
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const canonicalUrl = canonical ?? origin + location.pathname

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType ?? 'website'} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  )
}
