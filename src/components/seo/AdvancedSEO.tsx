import React, { useEffect } from 'react';
import { useAdvancedSEO } from '@/hooks/useAdvancedSEO';
import { useI18n } from '@/hooks/useI18n';

interface AdvancedSEOProps {
  pageSlug: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string;
  customOgImage?: string;
  customSchema?: any;
  breadcrumb?: Array<{name: string, url: string}>;
  faq?: Array<{question: string, answer: string}>;
  rating?: {value: number, count: number};
  noindex?: boolean;
  nofollow?: boolean;
  hreflang?: Array<{lang: string, url: string}>;
}

const AdvancedSEO: React.FC<AdvancedSEOProps> = ({ 
  pageSlug, 
  customTitle, 
  customDescription,
  customKeywords,
  customOgImage,
  customSchema,
  breadcrumb,
  faq,
  rating,
  noindex = false,
  nofollow = false,
  hreflang
}) => {
  const { setAdvancedSEO, loadPageSEO, generateCasinoSchema } = useAdvancedSEO();
  const { currentLanguage } = useI18n();

  useEffect(() => {
    if (customTitle && customDescription) {
      // Use custom SEO data if provided
      const customSEOData = {
        title: customTitle,
        description: customDescription,
        keywords: customKeywords,
        og_image: customOgImage,
        robots: noindex && nofollow ? 'noindex,nofollow' : 
                noindex ? 'noindex,follow' : 
                nofollow ? 'index,nofollow' : 'index,follow',
        site_name: 'GuduBet',
        locale: currentLanguage === 'tr' ? 'tr_TR' : 'en_US',
        twitter_site: '@gudubet',
        twitter_creator: '@gudubet',
        schema_markup: customSchema || generateCasinoSchema(),
        breadcrumb,
        faq,
        rating,
        hreflang
      };
      
      setAdvancedSEO(customSEOData);
    } else {
      // Load SEO data from database
      loadPageSEO(pageSlug, currentLanguage);
    }
  }, [
    pageSlug, 
    currentLanguage, 
    customTitle, 
    customDescription,
    customKeywords,
    customOgImage,
    customSchema,
    breadcrumb,
    faq,
    rating,
    noindex,
    nofollow,
    hreflang,
    setAdvancedSEO,
    loadPageSEO,
    generateCasinoSchema
  ]);

  // This component doesn't render anything visible
  return null;
};

export default AdvancedSEO;
