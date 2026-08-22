/**
 * Preset icons and brands for QR code centers as high-res SVGs
 */

export const PRESET_LOGOS = [
  {
    id: 'none',
    label: 'None',
    iconUrl: null,
  },
  {
    id: 'upi',
    label: 'UPI',
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23000"/><path d="M48 20L20 80h18l7-16h24l7 16h18L66 20H48zm9 18l7 18H50l7-18z" fill="%2300BA77"/><path d="M60 20L32 80h18l7-16h24l7 16h18L78 20H60z" fill="%23fff" opacity="0.9"/></svg>',
  },
  {
    id: 'gpay',
    label: 'Google Pay',
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23ffffff"/><path d="M50 44v14h20c-1 5-6 15-20 15-12 0-22-10-22-23s10-23 22-23c7 0 12 3 14 6l11-11C68 15 60 11 50 11 28 11 11 28 11 50s17 39 39 39c23 0 38-16 38-39 0-3 0-5-1-6H50z" fill="%234285F4"/></svg>',
  },
  {
    id: 'phonepe',
    label: 'PhonePe',
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%235f259f"/><path d="M30 25h26c12 0 20 8 20 18s-8 18-20 18H44v14H30V25zm14 24h10c5 0 8-3 8-7s-3-7-8-7H44v14z" fill="%23fff"/></svg>',
  },
  {
    id: 'paytm',
    label: 'Paytm',
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2300b9f5"/><path d="M22 35h14c6 0 10 4 10 9v12c0 5-4 9-10 9H22V35zm11 19c2 0 3-1 3-3v-4c0-2-1-3-3-3h-3v10h3zm23-19h14c6 0 10 4 10 9v12c0 5-4 9-10 9H56V35zm11 19c2 0 3-1 3-3v-4c0-2-1-3-3-3h-3v10h3z" fill="%23fff"/></svg>',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2325D366"/><path d="M50 18c-17 0-31 14-31 31 0 6 2 11 5 16L20 82l18-5c5 3 10 4 14 4 17 0 31-14 31-31 0-17-14-32-33-32zm17 23c-.7 1.8-3.7 3.5-5.2 3.7-1.4.2-3.2.4-10.4-2.6-9.1-3.8-15-13.1-15.4-13.7-.5-.6-3.7-4.9-3.7-9.4 0-4.5 2.3-6.7 3.2-7.6.8-.9 1.8-1.1 2.4-1.1s1.3 0 1.8.1c.6 0 1.4-.2 2.2 1.6.8 1.9 2.8 6.7 3 7.2.2.5.4 1.1.1 1.8-.3.7-.5 1.1-1 1.7-.5.6-1.1 1.3-1.5 1.7-.5.5-1 1-.4 2 1.1 1.9 4.8 7.8 10.3 12.7 1.6 1.4 3 2.1 4.1 2.5 1.7.5 3.3.4 4.5.2 1.4-.2 4.3-1.8 4.9-3.5.6-1.8.6-3.3.4-3.6-.2-.4-.8-.6-1.7-1z" fill="%23fff"/></svg>',
  },
  {
    id: 'rajlabs',
    label: 'Rajlabs',
    iconUrl: '/logo_raj_light.png',
  },
  {
    id: 'link',
    label: 'Website Link',
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%234f46e5"/><path d="M43 57a6 6 0 010-8l12-12a6 6 0 018 8l-4 4a2 2 0 003 3l4-4a10 10 0 00-14-14L40 46a10 10 0 000 14l3-3zm14-14a6 6 0 010 8L45 63a6 6 0 01-8-8l4-4a2 2 0 00-3-3l-4 4a10 10 0 0014 14l12-12a10 10 0 000-14l-3 3z" fill="%23fff"/></svg>',
  },
  {
    id: 'wifi',
    label: 'WiFi',
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230ea5e9"/><path d="M50 68a6 6 0 100 12 6 6 0 000-12zm-18-12c10-10 26-10 36 0l4-4C59 39 41 39 28 52l4 4zm-12-12c17-17 43-17 60 0l4-4C64 21 36 21 16 40l4 4z" fill="%23fff"/></svg>',
  }
];

export function getPresetLogoUrl(idOrUrl) {
  if (!idOrUrl) return null;
  const preset = PRESET_LOGOS.find(p => p.id.toLowerCase() === idOrUrl.toLowerCase());
  if (preset) return preset.iconUrl;
  return idOrUrl; // If direct URL or Data URL
}

/**
 * Automatically detect an appropriate brand logo based on QR data/content.
 * Returns preset logo ID (e.g. 'whatsapp', 'wifi', 'gpay', 'phonepe', 'paytm', 'upi', 'rajlabs', 'link') or null.
 */
export function detectBrandFromData(data) {
  if (!data || typeof data !== 'string') return null;
  const trimmed = data.trim();
  const lower = trimmed.toLowerCase();

  // 1. UPI Payment Links or Handles
  if (lower.startsWith('upi://') || lower.startsWith('gpay://') || lower.startsWith('phonepe://') || lower.startsWith('paytmmp://')) {
    if (lower.includes('phonepe') || lower.includes('@ybl') || lower.includes('@ibl') || lower.includes('@axl')) return 'phonepe';
    if (lower.includes('paytm') || lower.includes('@paytm')) return 'paytm';
    if (lower.includes('gpay') || lower.includes('google') || lower.includes('@okhdfcbank') || lower.includes('@okaxis') || lower.includes('@oksbi') || lower.includes('@okicici')) return 'gpay';
    return 'upi';
  }

  // 2. WhatsApp
  if (
    lower.startsWith('https://wa.me/') ||
    lower.startsWith('http://wa.me/') ||
    lower.includes('api.whatsapp.com') ||
    lower.includes('chat.whatsapp.com') ||
    lower.startsWith('whatsapp://')
  ) {
    return 'whatsapp';
  }

  // 3. WiFi Networks (e.g., WIFI:S:MyNetwork;T:WPA;P:password;;)
  if (trimmed.toUpperCase().startsWith('WIFI:') || lower.startsWith('wifi://')) {
    return 'wifi';
  }

  // 4. Rajlabs domains
  if (lower.includes('rajlabs.in') || lower.includes('rajlabs.org') || lower.includes('rajlab')) {
    return 'rajlabs';
  }

  // 5. General Web URLs
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('www.')) {
    return 'link';
  }

  return null;
}
