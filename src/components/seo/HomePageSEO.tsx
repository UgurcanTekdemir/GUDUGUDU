import React from 'react';
import AdvancedSEO from './AdvancedSEO';

const HomePageSEO: React.FC = () => {
  const homePageSEO = {
    title: 'GuduBet - Türkiye\'nin En Güvenilir Online Casino Platformu',
    description: 'Güvenli online casino, canlı casino, slot oyunları ve spor bahisleri. Lisanslı ve güvenilir bahis deneyimi için hemen katıl! En yüksek bonuslar ve güvenli ödeme seçenekleri.',
    keywords: 'online casino, canlı casino, slot oyunları, spor bahisleri, güvenli bahis, Türkiye casino, casino bonus, canlı bahis, slot makinesi, poker, blackjack, rulet',
    ogImage: '/images/gudubet-home-og.jpg',
    breadcrumb: [
      { name: 'Ana Sayfa', url: '/' }
    ],
    faq: [
      {
        question: 'GuduBet güvenli mi?',
        answer: 'Evet, GuduBet lisanslı ve güvenli bir online casino platformudur. Tüm ödemeler SSL şifreleme ile korunur.'
      },
      {
        question: 'Hangi oyunlar mevcut?',
        answer: 'Slot oyunları, canlı casino, poker, blackjack, rulet ve spor bahisleri gibi geniş bir oyun yelpazesi sunuyoruz.'
      },
      {
        question: 'Minimum depozit tutarı nedir?',
        answer: 'Minimum depozit tutarı 50 TL\'dir. Hızlı ve güvenli ödeme seçenekleri ile anında hesabınıza yatırım yapabilirsiniz.'
      },
      {
        question: 'Bonuslar nasıl çalışır?',
        answer: 'Hoşgeldin bonusu, depozit bonusu ve günlük promosyonlar ile sürekli kazanç fırsatları sunuyoruz.'
      }
    ],
    rating: {
      value: 4.8,
      count: 1250
    },
    hreflang: [
      { lang: 'tr', url: '/' },
      { lang: 'en', url: '/en/' }
    ]
  };

  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GuduBet",
    "url": "https://gudubet.com",
    "description": "Türkiye'nin en güvenilir online casino ve bahis platformu",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gudubet.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GuduBet",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gudubet.com/logo.png"
      }
    },
    "mainEntity": {
      "@type": "Organization",
      "name": "GuduBet",
      "url": "https://gudubet.com",
      "logo": "https://gudubet.com/logo.png",
      "description": "Türkiye'nin en güvenilir online casino ve bahis platformu",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-XXX-XXX-XXXX",
        "contactType": "customer service",
        "availableLanguage": ["Turkish", "English"]
      },
      "sameAs": [
        "https://twitter.com/gudubet",
        "https://facebook.com/gudubet",
        "https://instagram.com/gudubet"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1250"
      }
    }
  };

  return (
    <AdvancedSEO
      pageSlug="home"
      customTitle={homePageSEO.title}
      customDescription={homePageSEO.description}
      customKeywords={homePageSEO.keywords}
      customOgImage={homePageSEO.ogImage}
      customSchema={homePageSchema}
      breadcrumb={homePageSEO.breadcrumb}
      faq={homePageSEO.faq}
      rating={homePageSEO.rating}
      hreflang={homePageSEO.hreflang}
    />
  );
};

export default HomePageSEO;
