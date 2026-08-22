/**
 * SEO & Head Tag Manager for Dynamic Client-Side Routing
 */

export function updatePageSEO({ title, description, path, keywords, image }) {
  const origin = window.location.origin;
  const canonicalUrl = `${origin}${path || window.location.pathname}`;
  const defaultTitle = 'Rajlabs Tools & Utilities - Fast, Free Developer & Web Tools';
  const defaultDesc = 'Free developer tools, online QR code generator, UUID generator, Hash calculator, Base64 encoder/decoder, JSON viewer, formatters, and PDF tools.';
  const defaultKeywords = 'developer tools, QR code generator, UPI QR, UUID generator, hash generator, base64 encoder, JSON viewer, free online utilities, web tools';
  const defaultImage = `${origin}/logo_raj_light.png`;

  const pageTitle = title ? `${title} | Rajlabs Tools` : defaultTitle;
  const pageDesc = description || defaultDesc;
  const pageKeywords = keywords || defaultKeywords;
  const pageImage = image || defaultImage;

  // 1. Update Title
  document.title = pageTitle;

  // 2. Helper to set or update meta tag
  const setMeta = (attr, key, content) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMeta('name', 'description', pageDesc);
  setMeta('name', 'keywords', pageKeywords);
  setMeta('name', 'author', 'Rajlabs');
  setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // Open Graph
  setMeta('property', 'og:title', pageTitle);
  setMeta('property', 'og:description', pageDesc);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:image', pageImage);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', 'Rajlabs Utilities');

  // Twitter Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', pageTitle);
  setMeta('name', 'twitter:description', pageDesc);
  setMeta('name', 'twitter:image', pageImage);

  // 3. Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 4. Update JSON-LD Structured Data
  let scriptEl = document.querySelector('script[type="application/ld+json"]#seo-schema');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.setAttribute('type', 'application/ld+json');
    scriptEl.setAttribute('id', 'seo-schema');
    document.head.appendChild(scriptEl);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title || "Rajlabs Tools",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "url": canonicalUrl,
    "description": pageDesc,
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "2.2.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Rajlabs",
      "url": origin
    }
  };

  scriptEl.textContent = JSON.stringify(structuredData);
}
