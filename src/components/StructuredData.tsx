import Script from 'next/script';

interface StructuredDataProps {
  data: object;
  id: string;
}

export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Homepage structured data — FoodEstablishment
export const homepageStructuredData = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Nalan Batters",
  "description": "Fresh, authentic South Indian dosa batter and traditional food products delivered to your door",
  "url": "https://nalanbatters.ca",
  "logo": "https://nalanbatters.ca/logo-nalan2.jpg",
  "image": "https://nalanbatters.ca/logo-nalan2.jpg",
  "telephone": "+14372154049",
  "servesCuisine": "South Indian",
  "priceRange": "$10-$50",
  "paymentAccepted": ["Cash", "Credit Card", "Online Payment"],
  "currenciesAccepted": "CAD",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2623 Eglinton Ave E, Unit 1",
    "addressLocality": "Scarborough",
    "addressRegion": "ON",
    "postalCode": "M1K 2S2",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "43.6532",
    "longitude": "-79.3832"
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
  "telephone": "+14372154049",
  "email": "info@nalanbatters.ca",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2623 Eglinton Ave E, Unit 1",
    "addressLocality": "Scarborough",
    "addressRegion": "ON",
    "postalCode": "M1K 2S2",
    "addressCountry": "CA"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+14372154049",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Tamil"]
  },
  "sameAs": [
    "https://www.facebook.com/p/Nalan-Batters-61566853659372/",
    "https://www.instagram.com/nalan_batters/"
  ]
};
