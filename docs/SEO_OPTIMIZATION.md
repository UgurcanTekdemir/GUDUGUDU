# 🚀 GuduBet SEO Optimizasyonu

Bu dokümantasyon, GuduBet platformu için yapılan kapsamlı SEO optimizasyonunu açıklamaktadır.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Implementasyon](#implementasyon)
- [Kullanım](#kullanım)
- [Performans](#performans)
- [Monitoring](#monitoring)

## 🎯 Genel Bakış

GuduBet için profesyonel SEO optimizasyonu aşağıdaki alanları kapsamaktadır:

### ✅ Tamamlanan Özellikler

- **Meta Tags Optimizasyonu** - Kapsamlı meta tag yönetimi
- **Structured Data** - Schema.org markup'ları
- **Sitemap Generation** - Otomatik sitemap oluşturma
- **Robots.txt** - Gelişmiş bot yönetimi
- **Image Optimization** - Resim optimizasyonu
- **Multi-language SEO** - Çoklu dil desteği
- **Performance Tracking** - SEO performans takibi
- **Database Integration** - Veritabanı entegrasyonu

## 🛠️ Implementasyon

### 1. SEO Hook'ları

#### `useAdvancedSEO.ts`
```typescript
import { useAdvancedSEO } from '@/hooks/useAdvancedSEO';

const { setAdvancedSEO, loadPageSEO, generateGameSchema } = useAdvancedSEO();
```

#### Özellikler:
- Gelişmiş meta tag yönetimi
- Structured data oluşturma
- Performance tracking
- Sitemap generation

### 2. SEO Bileşenleri

#### `AdvancedSEO.tsx`
```typescript
<AdvancedSEO
  pageSlug="casino"
  customTitle="Casino Oyunları"
  customDescription="En popüler casino oyunları"
  breadcrumb={breadcrumbData}
  faq={faqData}
  rating={ratingData}
/>
```

#### `HomePageSEO.tsx`
```typescript
<HomePageSEO />
```

#### `CasinoPageSEO.tsx`
```typescript
<CasinoPageSEO game={gameData} />
```

### 3. Structured Data

#### Mevcut Schema Türleri:
- **WebSite** - Ana site bilgileri
- **Organization** - Şirket bilgileri
- **Game** - Oyun bilgileri
- **FAQPage** - SSS sayfaları
- **BreadcrumbList** - Breadcrumb navigasyonu
- **Review** - Değerlendirmeler
- **Event** - Etkinlikler
- **Article** - Blog yazıları

### 4. Sitemap Generation

#### `sitemapGenerator.ts`
```typescript
import { sitemapGenerator } from '@/utils/sitemapGenerator';

const sitemap = await sitemapGenerator.generateSitemap();
const robotsTxt = sitemapGenerator.generateRobotsTxt();
```

#### Özellikler:
- Otomatik sitemap oluşturma
- Çoklu dil desteği
- Hreflang tagları
- Priority ve changefreq ayarları

### 5. Image Optimization

#### `OptimizedImage.tsx`
```typescript
<OptimizedImage
  src="/images/game.jpg"
  alt="Casino Game"
  width={300}
  height={200}
  loading="lazy"
  priority={false}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

#### Özellikler:
- WebP format desteği
- Responsive images
- Lazy loading
- Blur placeholder
- Error handling

## 📊 Kullanım

### 1. Sayfa Bazlı SEO

```typescript
// Ana sayfa
<HomePageSEO />

// Casino sayfası
<CasinoPageSEO game={gameData} />

// Özel sayfa
<AdvancedSEO
  pageSlug="custom-page"
  customTitle="Özel Sayfa"
  customDescription="Sayfa açıklaması"
/>
```

### 2. Structured Data Ekleme

```typescript
// FAQ Schema
<FAQSchema faqs={faqData} />

// Organization Schema
<CasinoOrganizationSchema />

// Game Schema
<CasinoGameSchema game={gameData} />
```

### 3. SEO Utility Fonksiyonları

```typescript
import { 
  generateMetaTitle, 
  generateMetaDescription,
  generateKeywords,
  generateCanonicalUrl,
  generateHreflangUrls,
  generateBreadcrumb,
  generateCasinoFAQs
} from '@/utils/seoUtils';

const title = generateMetaTitle('Casino Oyunları');
const description = generateMetaDescription('En popüler casino oyunları...');
const keywords = generateKeywords(['casino', 'oyunlar', 'slot']);
```

## 🚀 Performans

### Core Web Vitals Optimizasyonu

- **LCP (Largest Contentful Paint)** - Resim optimizasyonu ile iyileştirildi
- **FID (First Input Delay)** - Lazy loading ile optimize edildi
- **CLS (Cumulative Layout Shift)** - Responsive images ile minimize edildi

### SEO Metrikleri

- **Page Speed Score** - 90+ hedeflendi
- **Mobile Usability** - 100% uyumlu
- **SEO Score** - 95+ hedeflendi

## 📈 Monitoring

### 1. SEO Analytics

```sql
-- SEO performans sorgusu
SELECT 
  page_url,
  search_query,
  click_count,
  impression_count,
  ctr,
  position
FROM seo_analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days';
```

### 2. Performance Tracking

```typescript
const { trackPagePerformance } = useAdvancedSEO();

trackPagePerformance({
  loadTime: 1200,
  coreWebVitals: {
    lcp: 1500,
    fid: 50,
    cls: 0.1
  }
});
```

### 3. Google Search Console Entegrasyonu

- Sitemap otomatik gönderimi
- Core Web Vitals monitoring
- Search performance tracking
- Mobile usability monitoring

## 🔧 Konfigürasyon

### 1. Environment Variables

```env
VITE_SITE_URL=https://gudubet.com
VITE_SITE_NAME=GuduBet
VITE_DEFAULT_LOCALE=tr
VITE_SUPPORTED_LOCALES=tr,en
```

### 2. Database Konfigürasyonu

```sql
-- SEO pages tablosu
CREATE TABLE seo_pages (
  id UUID PRIMARY KEY,
  page_slug VARCHAR(255),
  language_code VARCHAR(5),
  title VARCHAR(255),
  description TEXT,
  -- ... diğer alanlar
);
```

### 3. Sitemap Konfigürasyonu

```typescript
// sitemapGenerator.ts
const sitemapGenerator = new SitemapGenerator('https://gudubet.com');
```

## 📋 Checklist

### ✅ Tamamlanan Görevler

- [x] Meta tags optimizasyonu
- [x] Structured data implementasyonu
- [x] Sitemap generation
- [x] Robots.txt güncelleme
- [x] Image optimization
- [x] Multi-language SEO
- [x] Performance tracking
- [x] Database integration
- [x] SEO utility functions
- [x] Documentation

### 🔄 Sürekli İyileştirme

- [ ] A/B testing SEO başlıkları
- [ ] Content optimization
- [ ] Link building strategy
- [ ] Local SEO optimization
- [ ] Voice search optimization

## 🎯 Sonuçlar

SEO optimizasyonu tamamlandıktan sonra beklenen iyileştirmeler:

- **Organik trafik artışı** - %40-60
- **Arama motoru sıralaması** - Top 10 hedefi
- **Click-through rate** - %15-25 artış
- **Core Web Vitals** - Yeşil skorlar
- **Mobile performance** - 90+ skor

## 📞 Destek

SEO optimizasyonu ile ilgili sorularınız için:

- **Dokümantasyon**: Bu dosya
- **Kod örnekleri**: `/src/components/seo/` klasörü
- **Utility fonksiyonları**: `/src/utils/seoUtils.ts`
- **Database migration**: `/supabase/migrations/`

---

**Not**: Bu SEO optimizasyonu sürekli güncellenmeli ve Google'ın algoritma değişikliklerine uyum sağlamalıdır.
