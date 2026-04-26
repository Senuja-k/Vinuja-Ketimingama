import { Helmet } from 'react-helmet-async';

/**
 * SEO Component to manage head metadata dynamically.
 * 
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} image - OG Image URL
 * @param {string} url - Canonical URL
 * @param {boolean} noindex - Whether to add noindex tag
 */
const SEO = ({ 
  title = "TokoXpress | Premium Online Marketplace", 
  description = "Discover premium products at TokoXpress. The best deals on electronics, fashion, and home goods.", 
  image = "/og-image.jpg", 
  url = "http://localhost:5173/", 
  noindex = false 
}) => {
  const siteTitle = "TokoXpress";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
