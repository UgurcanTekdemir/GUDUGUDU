import { supabase } from '@/integrations/supabase/client';

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  hreflang?: Array<{lang: string, url: string}>;
}

export class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://gudubet.com') {
    this.baseUrl = baseUrl;
  }

  // Generate static pages sitemap
  private getStaticPages(): SitemapEntry[] {
    const currentDate = new Date().toISOString();
    
    return [
      {
        url: `${this.baseUrl}/`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: '1.0',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/` },
          { lang: 'en', url: `${this.baseUrl}/en/` }
        ]
      },
      {
        url: `${this.baseUrl}/casino`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: '0.9',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/casino` },
          { lang: 'en', url: `${this.baseUrl}/en/casino` }
        ]
      },
      {
        url: `${this.baseUrl}/live-casino`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: '0.9',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/live-casino` },
          { lang: 'en', url: `${this.baseUrl}/en/live-casino` }
        ]
      },
      {
        url: `${this.baseUrl}/sports`,
        lastModified: currentDate,
        changeFrequency: 'hourly',
        priority: '0.8',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/sports` },
          { lang: 'en', url: `${this.baseUrl}/en/sports` }
        ]
      },
      {
        url: `${this.baseUrl}/bonus`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: '0.8',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/bonus` },
          { lang: 'en', url: `${this.baseUrl}/en/bonus` }
        ]
      },
      {
        url: `${this.baseUrl}/promotions`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: '0.7',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/promotions` },
          { lang: 'en', url: `${this.baseUrl}/en/promotions` }
        ]
      },
      {
        url: `${this.baseUrl}/about`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: '0.6',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/about` },
          { lang: 'en', url: `${this.baseUrl}/en/about` }
        ]
      },
      {
        url: `${this.baseUrl}/contact`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: '0.6',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/contact` },
          { lang: 'en', url: `${this.baseUrl}/en/contact` }
        ]
      },
      {
        url: `${this.baseUrl}/terms`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: '0.5',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/terms` },
          { lang: 'en', url: `${this.baseUrl}/en/terms` }
        ]
      },
      {
        url: `${this.baseUrl}/privacy`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: '0.5',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/privacy` },
          { lang: 'en', url: `${this.baseUrl}/en/privacy` }
        ]
      },
      {
        url: `${this.baseUrl}/responsible-gaming`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: '0.4',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/responsible-gaming` },
          { lang: 'en', url: `${this.baseUrl}/en/responsible-gaming` }
        ]
      },
      {
        url: `${this.baseUrl}/cookie-policy`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: '0.4',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/cookie-policy` },
          { lang: 'en', url: `${this.baseUrl}/en/cookie-policy` }
        ]
      }
    ];
  }

  // Generate casino games sitemap
  private async getCasinoGames(): Promise<SitemapEntry[]> {
    try {
      const { data: games, error } = await supabase
        .from('casino_games')
        .select('slug, updated_at, category')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return games?.map(game => ({
        url: `${this.baseUrl}/casino/${game.slug}`,
        lastModified: game.updated_at,
        changeFrequency: 'weekly' as const,
        priority: '0.7',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/casino/${game.slug}` },
          { lang: 'en', url: `${this.baseUrl}/en/casino/${game.slug}` }
        ]
      })) || [];
    } catch (error) {
      console.error('Error fetching casino games:', error);
      return [];
    }
  }

  // Generate category pages sitemap
  private async getCategoryPages(): Promise<SitemapEntry[]> {
    try {
      const { data: categories, error } = await supabase
        .from('casino_categories')
        .select('slug, updated_at')
        .eq('is_active', true);

      if (error) throw error;

      return categories?.map(category => ({
        url: `${this.baseUrl}/casino/category/${category.slug}`,
        lastModified: category.updated_at,
        changeFrequency: 'weekly' as const,
        priority: '0.6',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/casino/category/${category.slug}` },
          { lang: 'en', url: `${this.baseUrl}/en/casino/category/${category.slug}` }
        ]
      })) || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Generate provider pages sitemap
  private async getProviderPages(): Promise<SitemapEntry[]> {
    try {
      const { data: providers, error } = await supabase
        .from('game_providers')
        .select('slug, updated_at')
        .eq('is_active', true);

      if (error) throw error;

      return providers?.map(provider => ({
        url: `${this.baseUrl}/casino/provider/${provider.slug}`,
        lastModified: provider.updated_at,
        changeFrequency: 'weekly' as const,
        priority: '0.6',
        hreflang: [
          { lang: 'tr', url: `${this.baseUrl}/casino/provider/${provider.slug}` },
          { lang: 'en', url: `${this.baseUrl}/en/casino/provider/${provider.slug}` }
        ]
      })) || [];
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  // Generate complete sitemap
  async generateSitemap(): Promise<string> {
    const staticPages = this.getStaticPages();
    const casinoGames = await this.getCasinoGames();
    const categoryPages = await this.getCategoryPages();
    const providerPages = await this.getProviderPages();

    const allPages = [
      ...staticPages,
      ...casinoGames,
      ...categoryPages,
      ...providerPages
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    allPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>`;

      // Add hreflang tags
      if (page.hreflang) {
        page.hreflang.forEach(({ lang, url }) => {
          sitemap += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`;
        });
      }

      sitemap += `
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }

  // Generate sitemap index for large sites
  async generateSitemapIndex(): Promise<string> {
    const currentDate = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${this.baseUrl}/sitemap-static.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-casino.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-providers.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /private/

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-index.xml

# Crawl-delay for different bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 2

User-agent: DuckDuckBot
Crawl-delay: 1

User-agent: Baiduspider
Crawl-delay: 2

User-agent: YandexBot
Crawl-delay: 2

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /`;
  }
}

// Export singleton instance
export const sitemapGenerator = new SitemapGenerator();
