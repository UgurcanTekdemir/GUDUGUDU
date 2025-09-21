import React from 'react';
import AdvancedSEO from './AdvancedSEO';

interface CasinoPageSEOProps {
  game?: {
    name: string;
    slug: string;
    description: string;
    thumbnail_url: string;
    category: string;
    provider: string;
    rating?: {value: number, count: number};
  };
}

const CasinoPageSEO: React.FC<CasinoPageSEOProps> = ({ game }) => {
  if (game) {
    // Individual game page SEO
    const gameSEO = {
      title: `${game.name} - Ücretsiz Oyna | GuduBet Casino`,
      description: `${game.name} oyununu GuduBet'te ücretsiz oynayın! ${game.provider} tarafından geliştirilen ${game.category} kategorisindeki bu oyunu hemen deneyin.`,
      keywords: `${game.name}, ${game.category}, ${game.provider}, casino oyunu, slot oyunu, ücretsiz oyna, demo oyun`,
      ogImage: game.thumbnail_url,
      breadcrumb: [
        { name: 'Ana Sayfa', url: '/' },
        { name: 'Casino', url: '/casino' },
        { name: game.category, url: `/casino?category=${game.category}` },
        { name: game.name, url: `/casino/${game.slug}` }
      ],
      rating: game.rating
    };

    const gameSchema = {
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
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": game.rating ? {
        "@type": "AggregateRating",
        "ratingValue": game.rating.value,
        "reviewCount": game.rating.count
      } : undefined
    };

    return (
      <AdvancedSEO
        pageSlug={`casino-${game.slug}`}
        customTitle={gameSEO.title}
        customDescription={gameSEO.description}
        customKeywords={gameSEO.keywords}
        customOgImage={gameSEO.ogImage}
        customSchema={gameSchema}
        breadcrumb={gameSEO.breadcrumb}
        rating={gameSEO.rating}
      />
    );
  }

  // Casino main page SEO
  const casinoPageSEO = {
    title: 'Online Casino Oyunları - Slot, Poker, Blackjack | GuduBet',
    description: 'En popüler casino oyunlarını GuduBet\'te oynayın! Slot makineleri, poker, blackjack, rulet ve daha fazlası. Ücretsiz demo modu ile oyunları deneyin.',
    keywords: 'online casino, slot oyunları, poker, blackjack, rulet, casino oyunları, ücretsiz casino, demo oyunlar',
    ogImage: '/images/casino-page-og.jpg',
    breadcrumb: [
      { name: 'Ana Sayfa', url: '/' },
      { name: 'Casino', url: '/casino' }
    ],
    faq: [
      {
        question: 'Casino oyunları nasıl oynanır?',
        answer: 'Casino oyunlarımızı ücretsiz demo modunda deneyebilir veya gerçek para ile oynayabilirsiniz. Her oyunun kuralları ve özellikleri farklıdır.'
      },
      {
        question: 'Hangi casino oyunları mevcut?',
        answer: 'Slot makineleri, poker, blackjack, rulet, baccarat ve canlı casino oyunları gibi geniş bir yelpaze sunuyoruz.'
      },
      {
        question: 'Demo oyunlar ücretsiz mi?',
        answer: 'Evet, tüm casino oyunlarımızı demo modunda ücretsiz olarak deneyebilirsiniz.'
      }
    ],
    hreflang: [
      { lang: 'tr', url: '/casino' },
      { lang: 'en', url: '/en/casino' }
    ]
  };

  const casinoPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Casino Oyunları",
    "description": "En popüler casino oyunları koleksiyonu",
    "url": "https://gudubet.com/casino",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Casino Oyunları",
      "description": "Slot, poker, blackjack, rulet ve diğer casino oyunları",
      "numberOfItems": "500+"
    }
  };

  return (
    <AdvancedSEO
      pageSlug="casino"
      customTitle={casinoPageSEO.title}
      customDescription={casinoPageSEO.description}
      customKeywords={casinoPageSEO.keywords}
      customOgImage={casinoPageSEO.ogImage}
      customSchema={casinoPageSchema}
      breadcrumb={casinoPageSEO.breadcrumb}
      faq={casinoPageSEO.faq}
      hreflang={casinoPageSEO.hreflang}
    />
  );
};

export default CasinoPageSEO;
