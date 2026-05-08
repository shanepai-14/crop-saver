import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Crop Saver Philippines Corporation'
const SITE_URL = 'https://www.cropsaverphilippinescorporation.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  jsonLd = null,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Agricultural Solutions & Manpower Services Philippines`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={`${SITE_URL}${canonical}`} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical ? `${SITE_URL}${canonical}` : SITE_URL} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_PH" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
