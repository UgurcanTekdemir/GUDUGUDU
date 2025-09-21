import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedSEOData {
  title: string;
  description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  schema_markup?: any;
  author?: string;
  published_time?: string;
  modified_time?: string;
  locale?: string;
  site_name?: string;
  twitter_site?: string;
  twitter_creator?: string;
  twitter_image_alt?: string;
  article_section?: string;
  article_tag?: string[];
  breadcrumb?: Array<{name: string, url: string}>;
  faq?: Array<{question: string, answer: string}>;
  rating?: {value: number, count: number};
  price?: {currency: string, value: number};
  availability?: string;
  brand?: string;
  category?: string;
  hreflang?: Array<{lang: string, url: string}>;
  alternate_canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  max_snippet?: number;
  max_image_preview?: 'none' | 'standard' | 'large';
  max_video_preview?: number;
}

interface PagePerformanceData {
  loadTime?: number;
  coreWebVitals?: {
    lcp?: number;
    fid?: number;
    cls?: number;
  };
}

export const useAdvancedSEO = () => {
  // Enhanced SEO data setter
  const setAdvancedSEO = useCallback((seoData: AdvancedSEOData) => {
    // Set title with character limit check
    const title = seoData.title.length > 60 
      ? seoData.title.substring(0, 57) + '...' 
      : seoData.title;
    document.title = title;

    // Set or update meta tags with validation
    const setOrUpdateMeta = (name: string, content: string, type: 'name' | 'property' = 'name') => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(type, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    if (seoData.description) {
      const description = seoData.description.length > 160 
        ? seoData.description.substring(0, 157) + '...' 
        : seoData.description;
      setOrUpdateMeta('description', description);
    }
    
    if (seoData.keywords) {
      setOrUpdateMeta('keywords', seoData.keywords);
    }

    if (seoData.author) {
      setOrUpdateMeta('author', seoData.author);
    }

    // Enhanced robots meta
    let robotsContent = 'index,follow';
    if (seoData.noindex) robotsContent = 'noindex,follow';
    if (seoData.nofollow) robotsContent = 'index,nofollow';
    if (seoData.noindex && seoData.nofollow) robotsContent = 'noindex,nofollow';
    
    if (seoData.max_snippet) robotsContent += `,max-snippet:${seoData.max_snippet}`;
    if (seoData.max_image_preview) robotsContent += `,max-image-preview:${seoData.max_image_preview}`;
    if (seoData.max_video_preview) robotsContent += `,max-video-preview:${seoData.max_video_preview}`;
    
    setOrUpdateMeta('robots', robotsContent);

    // Open Graph tags
    setOrUpdateMeta('og:title', seoData.og_title || seoData.title, 'property');
    
    if (seoData.og_description || seoData.description) {
      setOrUpdateMeta('og:description', seoData.og_description || seoData.description!, 'property');
    }

    if (seoData.og_image) {
      setOrUpdateMeta('og:image', seoData.og_image, 'property');
      setOrUpdateMeta('og:image:width', '1200', 'property');
      setOrUpdateMeta('og:image:height', '630', 'property');
      setOrUpdateMeta('og:image:alt', seoData.twitter_image_alt || seoData.title, 'property');
    }

    setOrUpdateMeta('og:url', seoData.canonical_url || window.location.href, 'property');
    setOrUpdateMeta('og:type', 'website', 'property');
    setOrUpdateMeta('og:site_name', seoData.site_name || 'GuduBet', 'property');
    
    if (seoData.locale) {
      setOrUpdateMeta('og:locale', seoData.locale, 'property');
    }

    // Twitter Card tags
    setOrUpdateMeta('twitter:card', 'summary_large_image');
    setOrUpdateMeta('twitter:title', seoData.og_title || seoData.title);
    
    if (seoData.og_description || seoData.description) {
      setOrUpdateMeta('twitter:description', seoData.og_description || seoData.description!);
    }

    if (seoData.og_image) {
      setOrUpdateMeta('twitter:image', seoData.og_image);
      if (seoData.twitter_image_alt) {
        setOrUpdateMeta('twitter:image:alt', seoData.twitter_image_alt);
      }
    }

    if (seoData.twitter_site) {
      setOrUpdateMeta('twitter:site', seoData.twitter_site);
    }

    if (seoData.twitter_creator) {
      setOrUpdateMeta('twitter:creator', seoData.twitter_creator);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoData.canonical_url || window.location.href;

    // Alternate canonical for AMP or mobile
    if (seoData.alternate_canonical) {
      let altCanonical = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement;
      if (!altCanonical) {
        altCanonical = document.createElement('link');
        altCanonical.rel = 'alternate';
        altCanonical.setAttribute('hreflang', 'x-default');
        document.head.appendChild(altCanonical);
      }
      altCanonical.href = seoData.alternate_canonical;
    }

    // Hreflang tags
    if (seoData.hreflang) {
      // Remove existing hreflang tags
      const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
      existingHreflang.forEach(link => link.remove());

      // Add new hreflang tags
      seoData.hreflang.forEach(({ lang, url }) => {
        const hreflangLink = document.createElement('link');
        hreflangLink.rel = 'alternate';
        hreflangLink.setAttribute('hreflang', lang);
        hreflangLink.href = url;
        document.head.appendChild(hreflangLink);
      });
    }

    // Schema markup
    if (seoData.schema_markup) {
      let schemaScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(seoData.schema_markup);
    }

    // Breadcrumb schema
    if (seoData.breadcrumb) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": seoData.breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };

      let breadcrumbScript = document.querySelector('script[data-schema="breadcrumb"]') as HTMLScriptElement;
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.type = 'application/ld+json';
        breadcrumbScript.setAttribute('data-schema', 'breadcrumb');
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    }

    // FAQ schema
    if (seoData.faq) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": seoData.faq.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };

      let faqScript = document.querySelector('script[data-schema="faq"]') as HTMLScriptElement;
      if (!faqScript) {
        faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.setAttribute('data-schema', 'faq');
        document.head.appendChild(faqScript);
      }
      faqScript.textContent = JSON.stringify(faqSchema);
    }
  }, []);

  // Generate structured data for casino games
  const generateGameSchema = useCallback((game: any) => {
    return {
      "@context": "https://schema.org",
      "@type": "Game",
      "name": game.name,
      "description": game.description,
      "image": game.thumbnail_url,
      "url": `${window.location.origin}/casino/${game.slug}`,
      "genre": game.category,
      "gamePlatform": "Web Browser",
      "operatingSystem": "Any",
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
  }, []);

  // Generate structured data for casino site
  const generateCasinoSchema = useCallback(() => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "GuduBet",
      "url": window.location.origin,
      "logo": `${window.location.origin}/logo.png`,
      "description": "Türkiye'nin en güvenilir online casino ve bahis platformu",
      "sameAs": [
        "https://twitter.com/gudubet",
        "https://facebook.com/gudubet",
        "https://instagram.com/gudubet"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-XXX-XXX-XXXX",
        "contactType": "customer service",
        "availableLanguage": ["Turkish", "English"]
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Casino Games",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Game",
              "name": "Slot Games"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Game",
              "name": "Live Casino"
            }
          }
        ]
      }
    };
  }, []);

  // Track page performance
  const trackPagePerformance = useCallback((performanceData: PagePerformanceData) => {
    // Send performance data to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_performance', {
        load_time: performanceData.loadTime,
        lcp: performanceData.coreWebVitals?.lcp,
        fid: performanceData.coreWebVitals?.fid,
        cls: performanceData.coreWebVitals?.cls
      });
    }
  }, []);

  // Generate sitemap XML
  const generateSitemapXML = useCallback(async () => {
    try {
      const { data: pages, error } = await supabase
        .from('seo_pages')
        .select('page_slug, language_code, updated_at, priority')
        .eq('is_active', true);

      if (error) throw error;

      const { data: games, error: gamesError } = await supabase
        .from('casino_games')
        .select('slug, updated_at')
        .eq('is_active', true);

      if (gamesError) throw gamesError;

      const baseUrl = window.location.origin;
      const currentDate = new Date().toISOString();

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

      // Add static pages
      const staticPages = [
        { slug: '', priority: '1.0', changefreq: 'daily' },
        { slug: 'casino', priority: '0.9', changefreq: 'daily' },
        { slug: 'live-casino', priority: '0.9', changefreq: 'daily' },
        { slug: 'sports', priority: '0.8', changefreq: 'daily' },
        { slug: 'bonus', priority: '0.8', changefreq: 'weekly' },
        { slug: 'promotions', priority: '0.7', changefreq: 'weekly' },
        { slug: 'about', priority: '0.6', changefreq: 'monthly' },
        { slug: 'contact', priority: '0.6', changefreq: 'monthly' },
        { slug: 'terms', priority: '0.5', changefreq: 'yearly' },
        { slug: 'privacy', priority: '0.5', changefreq: 'yearly' }
      ];

      staticPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;

        // Add hreflang for multi-language
        if (pages) {
          const pageData = pages.find(p => p.page_slug === page.slug);
          if (pageData) {
            sitemap += `
    <xhtml:link rel="alternate" hreflang="tr" href="${baseUrl}/${page.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/${page.slug}" />`;
          }
        }

        sitemap += `
  </url>`;
      });

      // Add game pages
      games?.forEach(game => {
        sitemap += `
  <url>
    <loc>${baseUrl}/casino/${game.slug}</loc>
    <lastmod>${game.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      sitemap += `
</urlset>`;

      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return null;
    }
  }, []);

  // Load SEO data from database
  const loadPageSEO = useCallback(async (pageSlug: string, language: string = 'tr') => {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language_code', language)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Fallback to default SEO
        setAdvancedSEO({
          title: 'GuduBet - Türkiye\'nin En Güvenilir Online Casino Platformu',
          description: 'Güvenli online casino, canlı casino, slot oyunları ve spor bahisleri. Lisanslı ve güvenilir bahis deneyimi için hemen katıl!',
          keywords: 'online casino, canlı casino, slot oyunları, spor bahisleri, güvenli bahis, Türkiye casino',
          robots: 'index,follow',
          site_name: 'GuduBet',
          locale: language === 'tr' ? 'tr_TR' : 'en_US',
          schema_markup: generateCasinoSchema()
        });
        return;
      }

      setAdvancedSEO({
        title: data.title,
        description: data.description,
        keywords: data.keywords,
        og_title: data.og_title,
        og_description: data.og_description,
        og_image: data.og_image,
        canonical_url: data.canonical_url,
        robots: data.robots,
        schema_markup: data.schema_markup,
        author: data.author,
        published_time: data.published_time,
        modified_time: data.modified_time,
        locale: data.locale,
        site_name: data.site_name,
        twitter_site: data.twitter_site,
        twitter_creator: data.twitter_creator,
        twitter_image_alt: data.twitter_image_alt,
        article_section: data.article_section,
        article_tag: data.article_tag,
        breadcrumb: data.breadcrumb,
        faq: data.faq,
        rating: data.rating,
        price: data.price,
        availability: data.availability,
        brand: data.brand,
        category: data.category,
        hreflang: data.hreflang,
        alternate_canonical: data.alternate_canonical,
        noindex: data.noindex,
        nofollow: data.nofollow,
        max_snippet: data.max_snippet,
        max_image_preview: data.max_image_preview,
        max_video_preview: data.max_video_preview
      });
    } catch (error) {
      console.error('Error loading SEO data:', error);
    }
  }, [setAdvancedSEO, generateCasinoSchema]);

  return {
    setAdvancedSEO,
    loadPageSEO,
    generateGameSchema,
    generateCasinoSchema,
    trackPagePerformance,
    generateSitemapXML
  };
};
