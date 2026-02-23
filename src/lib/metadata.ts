import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: {
    default: 'Nalan Batters - Fresh South Indian Dosa Batter & Authentic Food Products',
    template: '%s | Nalan Batters'
  },
  description: 'Order fresh, authentic South Indian dosa batter, idli batter and traditional food products online. Premium quality ingredients, traditional recipes, home delivery in Toronto. Taste authentic South India at home.',
  keywords: [
    'dosa batter Toronto',
    'idli batter delivery',
    'south indian food Toronto',
    'authentic dosa batter',
    'fresh dosa mix',
    'indian grocery delivery',
    'traditional south indian recipes',
    'home made dosa batter',
    'gluten-free indian food',
    'tamil food Toronto',
    'kerala food products',
    'authentic indian ingredients',
    'south indian breakfast',
    'dosa batter online order',
    'idli batter online',
    'fresh idli mix',
    'south indian snacks',
    'indian food delivery',
    'south indian cuisine',
    'nalan batters',
    'nalan batters Toronto',
    'scarborough south indian food',
  ],
  authors: [{ name: 'Nalan Batters' }],
  creator: 'Nalan Batters',
  publisher: 'Nalan Batters',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nalanbatters.ca'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: '/',
    siteName: 'Nalan Batters',
    title: 'Nalan Batters - Fresh South Indian Dosa Batter & Food Products',
    description: 'Fresh, authentic South Indian dosa batter and traditional food products delivered to your door. Premium quality ingredients for authentic taste.',
    images: [
      {
        url: '/logo-nalan2.jpg',
        width: 1200,
        height: 630,
        alt: 'Nalan Batters - Fresh Dosa Batter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nalan Batters - Fresh South Indian Dosa Batter',
    description: 'Fresh, authentic South Indian dosa batter and traditional food products delivered to your door.',
    images: ['/logo-nalan2.jpg'],
    creator: '@nalanbatters',
    site: '@nalanbatters',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

/**
 * Generates page-level metadata that inherits all global defaults.
 * Always provide a unique title and description per page.
 * Optionally provide a canonical path and OG image URL.
 */
export const generatePageMetadata = (
  title: string,
  description: string,
  path: string = '',
  image?: string
): Metadata => ({
  // Inherit all global defaults so child pages keep robots, verification,
  // metadataBase, keywords, formatDetection, etc.
  ...defaultMetadata,
  title,
  description,
  alternates: {
    canonical: path,
  },
  openGraph: {
    ...defaultMetadata.openGraph,
    title,
    description,
    url: path,
    ...(image && {
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    }),
  },
  twitter: {
    ...defaultMetadata.twitter,
    title,
    description,
    ...(image && { images: [image] }),
  },
});
