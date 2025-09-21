// SEO Utility Functions

/**
 * Generate meta title with proper length and formatting
 */
export const generateMetaTitle = (
  title: string,
  siteName: string = 'GuduBet',
  separator: string = ' - '
): string => {
  const maxLength = 60;
  const fullTitle = `${title}${separator}${siteName}`;
  
  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }
  
  const availableLength = maxLength - siteName.length - separator.length;
  const truncatedTitle = title.substring(0, availableLength - 3) + '...';
  
  return `${truncatedTitle}${separator}${siteName}`;
};

/**
 * Generate meta description with proper length
 */
export const generateMetaDescription = (
  description: string,
  maxLength: number = 160
): string => {
  if (description.length <= maxLength) {
    return description;
  }
  
  return description.substring(0, maxLength - 3) + '...';
};

/**
 * Generate keywords string from array
 */
export const generateKeywords = (keywords: string[]): string => {
  return keywords.join(', ');
};

/**
 * Generate canonical URL
 */
export const generateCanonicalUrl = (
  path: string,
  baseUrl: string = 'https://gudubet.com'
): string => {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Generate Open Graph image URL
 */
export const generateOgImageUrl = (
  imagePath: string,
  width: number = 1200,
  height: number = 630,
  baseUrl: string = 'https://gudubet.com'
): string => {
  const fullPath = imagePath.startsWith('http') 
    ? imagePath 
    : `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  
  return `${fullPath}?w=${width}&h=${height}&fit=crop&q=80`;
};

/**
 * Generate hreflang URLs for multi-language support
 */
export const generateHreflangUrls = (
  path: string,
  languages: string[] = ['tr', 'en'],
  baseUrl: string = 'https://gudubet.com'
): Array<{ lang: string; url: string }> => {
  return languages.map(lang => ({
    lang,
    url: lang === 'tr' 
      ? `${baseUrl}${path}` 
      : `${baseUrl}/${lang}${path}`
  }));
};

/**
 * Generate breadcrumb data
 */
export const generateBreadcrumb = (
  path: string,
  labels: Record<string, string> = {},
  baseUrl: string = 'https://gudubet.com'
): Array<{ name: string; url: string }> => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumb: Array<{ name: string; url: string }> = [
    { name: 'Ana Sayfa', url: baseUrl }
  ];
  
  let currentPath = '';
  
  segments.forEach(segment => {
    currentPath += `/${segment}`;
    const label = labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumb.push({
      name: label,
      url: `${baseUrl}${currentPath}`
    });
  });
  
  return breadcrumb;
};

/**
 * Generate FAQ data for common casino questions
 */
export const generateCasinoFAQs = (): Array<{ question: string; answer: string }> => {
  return [
    {
      question: 'GuduBet güvenli mi?',
      answer: 'Evet, GuduBet lisanslı ve güvenli bir online casino platformudur. Tüm ödemeler SSL şifreleme ile korunur ve lisanslı oyun sağlayıcıları ile çalışır.'
    },
    {
      question: 'Hangi oyunlar mevcut?',
      answer: 'Slot oyunları, canlı casino, poker, blackjack, rulet, baccarat ve spor bahisleri gibi geniş bir oyun yelpazesi sunuyoruz.'
    },
    {
      question: 'Minimum depozit tutarı nedir?',
      answer: 'Minimum depozit tutarı 50 TL\'dir. Hızlı ve güvenli ödeme seçenekleri ile anında hesabınıza yatırım yapabilirsiniz.'
    },
    {
      question: 'Bonuslar nasıl çalışır?',
      answer: 'Hoşgeldin bonusu, depozit bonusu ve günlük promosyonlar ile sürekli kazanç fırsatları sunuyoruz. Bonusların çevrim şartları vardır.'
    },
    {
      question: 'Para çekme işlemi ne kadar sürer?',
      answer: 'Para çekme işlemleri genellikle 24 saat içinde işlenir. Banka transferi 1-3 iş günü sürebilir.'
    },
    {
      question: 'Mobil cihazlarda oynayabilir miyim?',
      answer: 'Evet, GuduBet tamamen mobil uyumludur. iOS ve Android cihazlarda tarayıcı üzerinden sorunsuz oynayabilirsiniz.'
    }
  ];
};

/**
 * Generate game-specific SEO data
 */
export const generateGameSEO = (game: {
  name: string;
  slug: string;
  category: string;
  provider: string;
  description?: string;
}): {
  title: string;
  description: string;
  keywords: string;
} => {
  const title = generateMetaTitle(`${game.name} - Ücretsiz Oyna`);
  const description = generateMetaDescription(
    `${game.name} oyununu GuduBet'te ücretsiz oynayın! ${game.provider} tarafından geliştirilen ${game.category} kategorisindeki bu oyunu hemen deneyin. Demo modu ile risk almadan oynayın.`
  );
  const keywords = generateKeywords([
    game.name,
    game.category,
    game.provider,
    'casino oyunu',
    'slot oyunu',
    'ücretsiz oyna',
    'demo oyun',
    'online casino'
  ]);

  return { title, description, keywords };
};

/**
 * Generate category-specific SEO data
 */
export const generateCategorySEO = (category: {
  name: string;
  slug: string;
  description?: string;
}): {
  title: string;
  description: string;
  keywords: string;
} => {
  const title = generateMetaTitle(`${category.name} Oyunları`);
  const description = generateMetaDescription(
    `En popüler ${category.name.toLowerCase()} oyunlarını GuduBet'te oynayın! Geniş oyun seçenekleri, yüksek RTP oranları ve güvenli oyun deneyimi için hemen katılın.`
  );
  const keywords = generateKeywords([
    category.name.toLowerCase(),
    'casino oyunları',
    'online casino',
    'güvenli oyun',
    'yüksek RTP',
    'demo oyun'
  ]);

  return { title, description, keywords };
};

/**
 * Generate provider-specific SEO data
 */
export const generateProviderSEO = (provider: {
  name: string;
  slug: string;
  description?: string;
}): {
  title: string;
  description: string;
  keywords: string;
} => {
  const title = generateMetaTitle(`${provider.name} Oyunları`);
  const description = generateMetaDescription(
    `${provider.name} tarafından geliştirilen en kaliteli casino oyunlarını GuduBet'te oynayın! Yüksek grafik kalitesi ve adil oyun deneyimi için hemen başlayın.`
  );
  const keywords = generateKeywords([
    provider.name,
    'casino oyunları',
    'slot oyunları',
    'online casino',
    'güvenli oyun',
    'kaliteli oyun'
  ]);

  return { title, description, keywords };
};

/**
 * Generate promotion-specific SEO data
 */
export const generatePromotionSEO = (promotion: {
  name: string;
  slug: string;
  description?: string;
}): {
  title: string;
  description: string;
  keywords: string;
} => {
  const title = generateMetaTitle(`${promotion.name} - Casino Bonusu`);
  const description = generateMetaDescription(
    `${promotion.name} kampanyası ile GuduBet'te büyük kazançlar! Özel bonuslar ve promosyonlar için hemen katılın. Şartlar ve koşullar geçerlidir.`
  );
  const keywords = generateKeywords([
    promotion.name,
    'casino bonusu',
    'promosyon',
    'kampanya',
    'online casino',
    'bonus kazanç'
  ]);

  return { title, description, keywords };
};

/**
 * Validate SEO data
 */
export const validateSEOData = (data: {
  title?: string;
  description?: string;
  keywords?: string;
}): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (data.title) {
    if (data.title.length > 60) {
      errors.push('Title should be 60 characters or less');
    }
    if (data.title.length < 30) {
      errors.push('Title should be at least 30 characters');
    }
  }

  if (data.description) {
    if (data.description.length > 160) {
      errors.push('Description should be 160 characters or less');
    }
    if (data.description.length < 120) {
      errors.push('Description should be at least 120 characters');
    }
  }

  if (data.keywords) {
    const keywordCount = data.keywords.split(',').length;
    if (keywordCount > 10) {
      errors.push('Keywords should be 10 or less');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate sitemap priority based on page type
 */
export const getSitemapPriority = (pageType: string): string => {
  const priorities: Record<string, string> = {
    'home': '1.0',
    'casino': '0.9',
    'live-casino': '0.9',
    'sports': '0.8',
    'bonus': '0.8',
    'promotions': '0.7',
    'game': '0.7',
    'category': '0.6',
    'provider': '0.6',
    'about': '0.6',
    'contact': '0.6',
    'terms': '0.5',
    'privacy': '0.5',
    'default': '0.5'
  };

  return priorities[pageType] || priorities.default;
};

/**
 * Generate change frequency based on page type
 */
export const getChangeFrequency = (pageType: string): string => {
  const frequencies: Record<string, string> = {
    'home': 'daily',
    'casino': 'daily',
    'live-casino': 'daily',
    'sports': 'hourly',
    'bonus': 'weekly',
    'promotions': 'weekly',
    'game': 'weekly',
    'category': 'weekly',
    'provider': 'weekly',
    'about': 'monthly',
    'contact': 'monthly',
    'terms': 'yearly',
    'privacy': 'yearly',
    'default': 'monthly'
  };

  return frequencies[pageType] || frequencies.default;
};
