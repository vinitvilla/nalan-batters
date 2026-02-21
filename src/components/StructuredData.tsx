import Script from 'next/script';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Homepage structured data
export const homepageStructuredData = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Nalan Batters",
  "description": "Fresh, authentic South Indian dosa batter and traditional food products delivered to your door",
  "url": "https://nalanbatters.ca",
  "logo": "https://nalanbatters.ca/logo-nalan2.jpg",
  "image": "https://nalanbatters.ca/og-image.jpg",
  "telephone": "+1 437-215 (4049)",
  "servesCuisine": "South Indian",
  "priceRange": "$10-$50",
  "paymentAccepted": ["Cash", "Credit Card", "Online Payment"],
  "currenciesAccepted": "CAD",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CA",
    "addressRegion": "ON"
  },
  "openingHours": "Mo-Su 09:00-21:00",
  "hasMenu": {
    "@type": "Menu",
    "hasMenuSection": {
      "@type": "MenuSection",
      "name": "Authentic Batters",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "Fresh Dosa Batter",
          "description": "Authentic South Indian dosa batter made with traditional recipes",
          "offers": {
            "@type": "Offer",
            "price": "10.00",
            "priceCurrency": "CAD"
          }
        }
      ]
    }
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "43.6532",
      "longitude": "-79.3832"
    },
    "geoRadius": "50000"
  }
};

// Organization structured data
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nalan Batters",
  "url": "https://nalanbatters.ca",
  "logo": "https://nalanbatters.ca/logo-nalan2.jpg",
  "description": "Fresh, authentic South Indian dosa batter and traditional food products",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1 437-215 (4049)",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Tamil"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CA",
    "addressRegion": "ON"
  },
  "sameAs": [
    "https://www.facebook.com/p/Nalan-Batters-61566853659372/",
    "https://wa.me/14372154049",
    "https://www.instagram.com/nalan_batters/"
  ]
};
