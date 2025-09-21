-- SEO Optimization Migration
-- This migration creates comprehensive SEO tables and data

-- Create SEO pages table for dynamic SEO management
CREATE TABLE IF NOT EXISTS public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(255) NOT NULL,
  language_code VARCHAR(5) NOT NULL DEFAULT 'tr',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots VARCHAR(100) DEFAULT 'index,follow',
  author VARCHAR(100),
  published_time TIMESTAMP WITH TIME ZONE,
  modified_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  locale VARCHAR(10) DEFAULT 'tr_TR',
  site_name VARCHAR(100) DEFAULT 'GuduBet',
  twitter_site VARCHAR(50),
  twitter_creator VARCHAR(50),
  twitter_image_alt TEXT,
  article_section VARCHAR(100),
  article_tag TEXT[],
  breadcrumb JSONB,
  faq JSONB,
  rating JSONB,
  price JSONB,
  availability VARCHAR(50),
  brand VARCHAR(100),
  category VARCHAR(100),
  hreflang JSONB,
  alternate_canonical TEXT,
  noindex BOOLEAN DEFAULT false,
  nofollow BOOLEAN DEFAULT false,
  max_snippet INTEGER,
  max_image_preview VARCHAR(20),
  max_video_preview INTEGER,
  schema_markup JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(page_slug, language_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON public.seo_pages(page_slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_language ON public.seo_pages(language_code);
CREATE INDEX IF NOT EXISTS idx_seo_pages_active ON public.seo_pages(is_active);

-- Enable RLS
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "SEO pages are publicly readable"
ON public.seo_pages
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can manage SEO pages"
ON public.seo_pages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default SEO data for main pages
INSERT INTO public.seo_pages (page_slug, language_code, title, description, keywords, og_title, og_description, og_image, robots, locale, site_name, twitter_site, twitter_creator, schema_markup) VALUES
('home', 'tr', 'GuduBet - Türkiye''nin En Güvenilir Online Casino Platformu', 'Güvenli online casino, canlı casino, slot oyunları ve spor bahisleri. Lisanslı ve güvenilir bahis deneyimi için hemen katıl! En yüksek bonuslar ve güvenli ödeme seçenekleri.', 'online casino, canlı casino, slot oyunları, spor bahisleri, güvenli bahis, Türkiye casino, casino bonus, canlı bahis, slot makinesi, poker, blackjack, rulet', 'GuduBet - Türkiye''nin En Güvenilir Online Casino Platformu', 'Güvenli online casino, canlı casino, slot oyunları ve spor bahisleri. Lisanslı ve güvenilir bahis deneyimi için hemen katıl!', 'https://gudubet.com/images/gudubet-home-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "WebSite", "name": "GuduBet", "url": "https://gudubet.com", "description": "Türkiye''nin en güvenilir online casino ve bahis platformu"}'),

('casino', 'tr', 'Online Casino Oyunları - Slot, Poker, Blackjack | GuduBet', 'En popüler casino oyunlarını GuduBet''te oynayın! Slot makineleri, poker, blackjack, rulet ve daha fazlası. Ücretsiz demo modu ile oyunları deneyin.', 'online casino, slot oyunları, poker, blackjack, rulet, casino oyunları, ücretsiz casino, demo oyunlar', 'Online Casino Oyunları - Slot, Poker, Blackjack | GuduBet', 'En popüler casino oyunlarını GuduBet''te oynayın! Slot makineleri, poker, blackjack, rulet ve daha fazlası.', 'https://gudubet.com/images/casino-page-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Casino Oyunları", "description": "En popüler casino oyunları koleksiyonu"}'),

('live-casino', 'tr', 'Canlı Casino - Gerçek Krupiyerlerle Oyna | GuduBet', 'Gerçek krupiyerlerle canlı casino oyunları! Blackjack, rulet, baccarat ve poker masalarında büyük kazançlar için hemen katıl.', 'canlı casino, gerçek krupiyer, blackjack, rulet, baccarat, poker, live casino, canlı oyun', 'Canlı Casino - Gerçek Krupiyerlerle Oyna | GuduBet', 'Gerçek krupiyerlerle canlı casino oyunları! Blackjack, rulet, baccarat ve poker masalarında büyük kazançlar için hemen katıl.', 'https://gudubet.com/images/live-casino-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Canlı Casino", "description": "Gerçek krupiyerlerle canlı casino oyunları"}'),

('sports', 'tr', 'Spor Bahisleri - Canlı Bahis ve Maç Sonuçları | GuduBet', 'Futbol, basketbol, tenis ve daha fazla spor dalında bahis yapın! Canlı bahis, maç sonuçları ve yüksek oranlar için GuduBet''i tercih edin.', 'spor bahisleri, canlı bahis, futbol bahisleri, basketbol bahisleri, tenis bahisleri, maç sonuçları, bahis oranları', 'Spor Bahisleri - Canlı Bahis ve Maç Sonuçları | GuduBet', 'Futbol, basketbol, tenis ve daha fazla spor dalında bahis yapın! Canlı bahis, maç sonuçları ve yüksek oranlar için GuduBet''i tercih edin.', 'https://gudubet.com/images/sports-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Spor Bahisleri", "description": "Futbol, basketbol, tenis ve daha fazla spor dalında bahis"}'),

('bonus', 'tr', 'Casino Bonusları ve Promosyonlar | GuduBet', 'Hoşgeldin bonusu, depozit bonusu ve günlük promosyonlar! En yüksek bonuslar ve çevrim şartları ile büyük kazançlar için hemen katıl.', 'casino bonusu, hoşgeldin bonusu, depozit bonusu, promosyon, bonus kampanyası, çevrim şartları', 'Casino Bonusları ve Promosyonlar | GuduBet', 'Hoşgeldin bonusu, depozit bonusu ve günlük promosyonlar! En yüksek bonuslar ve çevrim şartları ile büyük kazançlar için hemen katıl.', 'https://gudubet.com/images/bonus-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Casino Bonusları", "description": "Hoşgeldin bonusu, depozit bonusu ve promosyonlar"}'),

('about', 'tr', 'Hakkımızda - GuduBet Online Casino | Güvenilir Bahis', 'GuduBet hakkında bilgi alın. Lisanslı ve güvenilir online casino platformumuzun misyonu, vizyonu ve değerleri hakkında detaylı bilgi.', 'hakkımızda, gudubet, online casino, güvenilir bahis, lisanslı casino, misyon, vizyon', 'Hakkımızda - GuduBet Online Casino | Güvenilir Bahis', 'GuduBet hakkında bilgi alın. Lisanslı ve güvenilir online casino platformumuzun misyonu, vizyonu ve değerleri hakkında detaylı bilgi.', 'https://gudubet.com/images/about-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "AboutPage", "name": "Hakkımızda", "description": "GuduBet online casino platformu hakkında bilgi"}'),

('contact', 'tr', 'İletişim - GuduBet Müşteri Hizmetleri | 7/24 Destek', 'GuduBet müşteri hizmetleri ile iletişime geçin. 7/24 canlı destek, telefon ve e-posta ile sorularınızı yanıtlıyoruz.', 'iletişim, müşteri hizmetleri, canlı destek, telefon, e-posta, 7/24 destek', 'İletişim - GuduBet Müşteri Hizmetleri | 7/24 Destek', 'GuduBet müşteri hizmetleri ile iletişime geçin. 7/24 canlı destek, telefon ve e-posta ile sorularınızı yanıtlıyoruz.', 'https://gudubet.com/images/contact-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "ContactPage", "name": "İletişim", "description": "GuduBet müşteri hizmetleri ile iletişim"}'),

('terms', 'tr', 'Kullanım Şartları - GuduBet Online Casino', 'GuduBet kullanım şartları ve koşulları. Platform kullanımı, hesap açma, ödeme ve çekim işlemleri hakkında detaylı bilgi.', 'kullanım şartları, koşullar, platform kullanımı, hesap açma, ödeme, çekim', 'Kullanım Şartları - GuduBet Online Casino', 'GuduBet kullanım şartları ve koşulları. Platform kullanımı, hesap açma, ödeme ve çekim işlemleri hakkında detaylı bilgi.', 'https://gudubet.com/images/terms-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "WebPage", "name": "Kullanım Şartları", "description": "GuduBet kullanım şartları ve koşulları"}'),

('privacy', 'tr', 'Gizlilik Politikası - GuduBet Kişisel Veri Koruma', 'GuduBet gizlilik politikası ve kişisel veri koruma. Verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında detaylı bilgi.', 'gizlilik politikası, kişisel veri koruma, veri güvenliği, KVKK, GDPR', 'Gizlilik Politikası - GuduBet Kişisel Veri Koruma', 'GuduBet gizlilik politikası ve kişisel veri koruma. Verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında detaylı bilgi.', 'https://gudubet.com/images/privacy-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "WebPage", "name": "Gizlilik Politikası", "description": "GuduBet gizlilik politikası ve kişisel veri koruma"}'),

('responsible-gaming', 'tr', 'Sorumlu Oyun - GuduBet Güvenli Bahis', 'Sorumlu oyun ve güvenli bahis için GuduBet''in sunduğu araçlar. Kendi kendini kontrol, limitler ve yardım kaynakları hakkında bilgi.', 'sorumlu oyun, güvenli bahis, kendi kendini kontrol, limitler, yardım', 'Sorumlu Oyun - GuduBet Güvenli Bahis', 'Sorumlu oyun ve güvenli bahis için GuduBet''in sunduğu araçlar. Kendi kendini kontrol, limitler ve yardım kaynakları hakkında bilgi.', 'https://gudubet.com/images/responsible-gaming-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "WebPage", "name": "Sorumlu Oyun", "description": "Sorumlu oyun ve güvenli bahis araçları"}'),

('cookie-policy', 'tr', 'Çerez Politikası - GuduBet Cookie Kullanımı', 'GuduBet çerez politikası ve cookie kullanımı. Hangi çerezlerin kullanıldığı ve nasıl yönetileceği hakkında detaylı bilgi.', 'çerez politikası, cookie kullanımı, çerez yönetimi, web çerezleri', 'Çerez Politikası - GuduBet Cookie Kullanımı', 'GuduBet çerez politikası ve cookie kullanımı. Hangi çerezlerin kullanıldığı ve nasıl yönetileceği hakkında detaylı bilgi.', 'https://gudubet.com/images/cookie-policy-og.jpg', 'index,follow', 'tr_TR', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "WebPage", "name": "Çerez Politikası", "description": "GuduBet çerez politikası ve cookie kullanımı"}')

ON CONFLICT (page_slug, language_code) DO NOTHING;

-- Insert English versions
INSERT INTO public.seo_pages (page_slug, language_code, title, description, keywords, og_title, og_description, og_image, robots, locale, site_name, twitter_site, twitter_creator, schema_markup) VALUES
('home', 'en', 'GuduBet - Turkey''s Most Trusted Online Casino Platform', 'Secure online casino, live casino, slot games and sports betting. Join now for licensed and trusted betting experience! Highest bonuses and secure payment options.', 'online casino, live casino, slot games, sports betting, secure betting, Turkey casino, casino bonus, live betting, slot machine, poker, blackjack, roulette', 'GuduBet - Turkey''s Most Trusted Online Casino Platform', 'Secure online casino, live casino, slot games and sports betting. Join now for licensed and trusted betting experience!', 'https://gudubet.com/images/gudubet-home-og.jpg', 'index,follow', 'en_US', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "WebSite", "name": "GuduBet", "url": "https://gudubet.com", "description": "Turkey''s most trusted online casino and betting platform"}'),

('casino', 'en', 'Online Casino Games - Slots, Poker, Blackjack | GuduBet', 'Play the most popular casino games at GuduBet! Slot machines, poker, blackjack, roulette and more. Try games with free demo mode.', 'online casino, slot games, poker, blackjack, roulette, casino games, free casino, demo games', 'Online Casino Games - Slots, Poker, Blackjack | GuduBet', 'Play the most popular casino games at GuduBet! Slot machines, poker, blackjack, roulette and more.', 'https://gudubet.com/images/casino-page-og.jpg', 'index,follow', 'en_US', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Casino Games", "description": "Most popular casino games collection"}'),

('live-casino', 'en', 'Live Casino - Play with Real Dealers | GuduBet', 'Live casino games with real dealers! Join blackjack, roulette, baccarat and poker tables for big wins.', 'live casino, real dealer, blackjack, roulette, baccarat, poker, live games', 'Live Casino - Play with Real Dealers | GuduBet', 'Live casino games with real dealers! Join blackjack, roulette, baccarat and poker tables for big wins.', 'https://gudubet.com/images/live-casino-og.jpg', 'index,follow', 'en_US', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Live Casino", "description": "Live casino games with real dealers"}'),

('sports', 'en', 'Sports Betting - Live Betting and Match Results | GuduBet', 'Bet on football, basketball, tennis and more sports! Choose GuduBet for live betting, match results and high odds.', 'sports betting, live betting, football betting, basketball betting, tennis betting, match results, betting odds', 'Sports Betting - Live Betting and Match Results | GuduBet', 'Bet on football, basketball, tennis and more sports! Choose GuduBet for live betting, match results and high odds.', 'https://gudubet.com/images/sports-og.jpg', 'index,follow', 'en_US', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Sports Betting", "description": "Football, basketball, tennis and more sports betting"}'),

('bonus', 'en', 'Casino Bonuses and Promotions | GuduBet', 'Welcome bonus, deposit bonus and daily promotions! Join now for highest bonuses and wagering requirements for big wins.', 'casino bonus, welcome bonus, deposit bonus, promotion, bonus campaign, wagering requirements', 'Casino Bonuses and Promotions | GuduBet', 'Welcome bonus, deposit bonus and daily promotions! Join now for highest bonuses and wagering requirements for big wins.', 'https://gudubet.com/images/bonus-og.jpg', 'index,follow', 'en_US', 'GuduBet', '@gudubet', '@gudubet', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Casino Bonuses", "description": "Welcome bonus, deposit bonus and promotions"}')

ON CONFLICT (page_slug, language_code) DO NOTHING;

-- Create function to update modified_time
CREATE OR REPLACE FUNCTION update_seo_pages_modified_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_time = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic modified_time update
CREATE TRIGGER update_seo_pages_modified_time_trigger
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_pages_modified_time();

-- Create function to generate dynamic sitemap
CREATE OR REPLACE FUNCTION generate_sitemap()
RETURNS TABLE(
  url TEXT,
  lastmod TIMESTAMP WITH TIME ZONE,
  changefreq TEXT,
  priority TEXT
) AS $$
BEGIN
  -- Static pages
  RETURN QUERY
  SELECT 
    'https://gudubet.com/' as url,
    now() as lastmod,
    'daily' as changefreq,
    '1.0' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/casino' as url,
    now() as lastmod,
    'daily' as changefreq,
    '0.9' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/live-casino' as url,
    now() as lastmod,
    'daily' as changefreq,
    '0.9' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/sports' as url,
    now() as lastmod,
    'hourly' as changefreq,
    '0.8' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/bonus' as url,
    now() as lastmod,
    'weekly' as changefreq,
    '0.8' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/about' as url,
    now() as lastmod,
    'monthly' as changefreq,
    '0.6' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/contact' as url,
    now() as lastmod,
    'monthly' as changefreq,
    '0.6' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/terms' as url,
    now() as lastmod,
    'yearly' as changefreq,
    '0.5' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/privacy' as url,
    now() as lastmod,
    'yearly' as changefreq,
    '0.5' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/responsible-gaming' as url,
    now() as lastmod,
    'yearly' as changefreq,
    '0.4' as priority
  UNION ALL
  SELECT 
    'https://gudubet.com/cookie-policy' as url,
    now() as lastmod,
    'yearly' as changefreq,
    '0.4' as priority;
  
  -- Casino games
  RETURN QUERY
  SELECT 
    'https://gudubet.com/casino/' || slug as url,
    updated_at as lastmod,
    'weekly' as changefreq,
    '0.7' as priority
  FROM public.casino_games
  WHERE is_active = true;
  
  -- Categories
  RETURN QUERY
  SELECT 
    'https://gudubet.com/casino/category/' || slug as url,
    updated_at as lastmod,
    'weekly' as changefreq,
    '0.6' as priority
  FROM public.casino_categories
  WHERE is_active = true;
  
  -- Providers
  RETURN QUERY
  SELECT 
    'https://gudubet.com/casino/provider/' || slug as url,
    updated_at as lastmod,
    'weekly' as changefreq,
    '0.6' as priority
  FROM public.game_providers
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create SEO analytics table
CREATE TABLE IF NOT EXISTS public.seo_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  page_title TEXT,
  search_query TEXT,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  position DECIMAL(5,2),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for SEO analytics
CREATE INDEX IF NOT EXISTS idx_seo_analytics_url ON public.seo_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_date ON public.seo_analytics(date);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_query ON public.seo_analytics(search_query);

-- Enable RLS for SEO analytics
ALTER TABLE public.seo_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for SEO analytics
CREATE POLICY "Authenticated users can manage SEO analytics"
ON public.seo_analytics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update SEO analytics
CREATE OR REPLACE FUNCTION update_seo_analytics(
  p_page_url TEXT,
  p_search_query TEXT DEFAULT NULL,
  p_click_count INTEGER DEFAULT 0,
  p_impression_count INTEGER DEFAULT 0,
  p_position DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.seo_analytics (
    page_url, search_query, click_count, impression_count, position
  ) VALUES (
    p_page_url, p_search_query, p_click_count, p_impression_count, p_position
  )
  ON CONFLICT (page_url, search_query, date) 
  DO UPDATE SET
    click_count = seo_analytics.click_count + p_click_count,
    impression_count = seo_analytics.impression_count + p_impression_count,
    position = COALESCE(p_position, seo_analytics.position),
    ctr = CASE 
      WHEN seo_analytics.impression_count + p_impression_count > 0 
      THEN (seo_analytics.click_count + p_click_count)::DECIMAL / (seo_analytics.impression_count + p_impression_count) * 100
      ELSE 0 
    END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
