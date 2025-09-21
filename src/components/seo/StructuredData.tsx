import React from 'react';

interface StructuredDataProps {
  data: any;
  type?: 'application/ld+json' | 'application/json';
}

const StructuredData: React.FC<StructuredDataProps> = ({ 
  data, 
  type = 'application/ld+json' 
}) => {
  return (
    <script
      type={type}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  );
};

// Casino Game Schema
export const CasinoGameSchema: React.FC<{
  game: {
    name: string;
    description: string;
    thumbnail_url: string;
    slug: string;
    category: string;
    provider: string;
    rating?: { value: number; count: number };
    min_bet?: number;
    max_bet?: number;
    rtp?: number;
  };
}> = ({ game }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": game.name,
    "description": game.description,
    "image": game.thumbnail_url,
    "url": `https://gudubet.com/casino/${game.slug}`,
    "genre": game.category,
    "gamePlatform": "Web Browser",
    "operatingSystem": "Any",
    "publisher": {
      "@type": "Organization",
      "name": game.provider
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    },
    "aggregateRating": game.rating ? {
      "@type": "AggregateRating",
      "ratingValue": game.rating.value,
      "reviewCount": game.rating.count,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "gameItem": {
      "@type": "Thing",
      "name": game.name,
      "description": game.description
    }
  };

  return <StructuredData data={schema} />;
};

// Casino Organization Schema
export const CasinoOrganizationSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GuduBet",
    "url": "https://gudubet.com",
    "logo": "https://gudubet.com/logo.png",
    "description": "Türkiye'nin en güvenilir online casino ve bahis platformu",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90-XXX-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["Turkish", "English"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    "sameAs": [
      "https://twitter.com/gudubet",
      "https://facebook.com/gudubet",
      "https://instagram.com/gudubet"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Casino Games",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Game",
            "name": "Slot Games",
            "description": "En popüler slot oyunları"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Game",
            "name": "Live Casino",
            "description": "Canlı casino oyunları"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Game",
            "name": "Sports Betting",
            "description": "Spor bahisleri"
          }
        }
      ]
    }
  };

  return <StructuredData data={schema} />;
};

// FAQ Schema
export const FAQSchema: React.FC<{
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}> = ({ faqs }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return <StructuredData data={schema} />;
};

// Breadcrumb Schema
export const BreadcrumbSchema: React.FC<{
  items: Array<{
    name: string;
    url: string;
  }>;
}> = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return <StructuredData data={schema} />;
};

// Review Schema
export const ReviewSchema: React.FC<{
  reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}> = ({ reviews, aggregateRating }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "GuduBet Casino",
    "description": "Türkiye'nin en güvenilir online casino platformu",
    "aggregateRating": aggregateRating ? {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.reviewBody,
      "datePublished": review.datePublished
    }))
  };

  return <StructuredData data={schema} />;
};

// Event Schema (for promotions)
export const EventSchema: React.FC<{
  event: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location?: string;
    organizer: string;
    offers?: {
      price: string;
      priceCurrency: string;
      availability: string;
    };
  };
}> = ({ event }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": event.location ? {
      "@type": "Place",
      "name": event.location
    } : {
      "@type": "VirtualLocation",
      "url": "https://gudubet.com"
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer,
      "url": "https://gudubet.com"
    },
    "offers": event.offers ? {
      "@type": "Offer",
      "price": event.offers.price,
      "priceCurrency": event.offers.priceCurrency,
      "availability": event.offers.availability
    } : undefined
  };

  return <StructuredData data={schema} />;
};

// Article Schema (for blog posts)
export const ArticleSchema: React.FC<{
  article: {
    headline: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    dateModified: string;
    url: string;
  };
}> = ({ article }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "GuduBet",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gudubet.com/logo.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "url": article.url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };

  return <StructuredData data={schema} />;
};

export default StructuredData;
