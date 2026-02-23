export const seoConfig = {
  domain: process.env.NEXT_PUBLIC_APP_URL || 'https://nalanbatters.ca',
  businessName: 'Nalan Batters',
  businessDescription: 'Fresh, authentic South Indian dosa batter and traditional food products',
  // E.164 format — required by schema.org and Google Business Profile
  businessPhone: '+14372154049',
  businessEmail: 'info@nalanbatters.ca',
  businessAddress: {
    streetAddress: '2623 Eglinton Ave E, Unit 1',
    addressLocality: 'Scarborough',
    addressRegion: 'ON',
    postalCode: 'M1K 2S2',
    addressCountry: 'CA'
  },
  socialMedia: {
    facebook: 'https://www.facebook.com/p/Nalan-Batters-61566853659372/',
    instagram: 'https://www.instagram.com/nalan_batters/'
    // WhatsApp action links (wa.me) are not valid sameAs social profile URLs
    // and have been removed from structured data.
  },
  businessHours: {
    monday: '09:00-21:00',
    tuesday: '09:00-21:00',
    wednesday: '09:00-21:00',
    thursday: '09:00-21:00',
    friday: '09:00-21:00',
    saturday: '09:00-21:00',
    sunday: '09:30-21:00'
  },
  location: {
    latitude: '43.6532',
    longitude: '-79.3832'
  },
  priceRange: '$10-$50',
  currencies: ['CAD'],
  languages: ['English', 'Tamil', 'Hindi'],
  serviceArea: 'Scarborough, Toronto, and surrounding GTA areas',
  keywords: {
    primary: ['dosa batter', 'south indian food', 'authentic indian products'],
    secondary: ['idli batter', 'traditional recipes', 'fresh ingredients'],
    location: ['Scarborough', 'Toronto', 'GTA', 'Ontario', 'Canada'],
    product: ['dosa mix', 'fermented batter', 'gluten-free options']
  }
};

export const getBusinessStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": seoConfig.businessName,
  "description": seoConfig.businessDescription,
  "url": seoConfig.domain,
  "telephone": seoConfig.businessPhone,
  "email": seoConfig.businessEmail,
  "priceRange": seoConfig.priceRange,
  "currenciesAccepted": seoConfig.currencies,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": seoConfig.businessAddress.streetAddress,
    "addressLocality": seoConfig.businessAddress.addressLocality,
    "addressRegion": seoConfig.businessAddress.addressRegion,
    "postalCode": seoConfig.businessAddress.postalCode,
    "addressCountry": seoConfig.businessAddress.addressCountry
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": seoConfig.location.latitude,
    "longitude": seoConfig.location.longitude
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "21:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday"],
      "opens": "09:30",
      "closes": "21:00"
    }
  ],
  "servesCuisine": "South Indian",
  "paymentAccepted": ["Cash", "Credit Card", "Online Payment"],
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": seoConfig.location.latitude,
      "longitude": seoConfig.location.longitude
    },
    "geoRadius": "50000"
  },
  "sameAs": Object.values(seoConfig.socialMedia)
});
