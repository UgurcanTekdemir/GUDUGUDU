import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent } from '@/components/ui/carousel';
// import Autoplay from 'embla-carousel-autoplay';
import { GameSlider } from '@/components/games/GameSlider';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { AgeVerificationModal } from '@/components/auth/AgeVerificationModal';
import HomePageSEO from '@/components/seo/HomePageSEO';
import { CasinoOrganizationSchema, FAQSchema } from '@/components/seo/StructuredData';

import { useI18n } from '@/hooks/useI18n';
import { useCasinoGames } from '@/hooks/useCasinoGames';
import { useSiteImages, useSiteImageByCategory } from '@/hooks/useSiteImages';
import { addSmartCacheBuster, getPlaceholderImage } from '@/utils/imageUtils';
import { generateCasinoFAQs } from '@/utils/seoUtils';
import { Send, Play, Star, Eye } from 'lucide-react';
import treasureImage from '@/assets/treasure.png';
import vipProgramImage from '@/assets/vip_program.png';

// Popular Sidebar Component
const PopularSidebar = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data: popularImage, isLoading } = useSiteImageByCategory('popular');

  return (
    <div className="relative h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 ml-4">
      {/* Background Image from admin panel */}
      {popularImage?.image_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url(${addSmartCacheBuster(popularImage.image_url)})`
          }}
        ></div>
      )}
      
      {/* Fallback background if no image */}
      {!popularImage?.image_url && !isLoading && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('/gudubet_logo.png')`
          }}
        ></div>
      )}
      
      <div className="relative p-6 h-full flex flex-col justify-between">
        <div className="text-center">
          <h3 className="text-white text-2xl font-bold mb-4">{t('sidebar.popular.title')}</h3>
          <div className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center">
          </div>
        </div>
        <Button 
          onClick={() => navigate('/casino?category=popular')}
          className="bg-white text-black hover:bg-gray-100 font-bold w-full"
        >
          {t('sidebar.popular.view-all')}
        </Button>
      </div>
    </div>
  );
};
import telegramImage from '@/assets/telegrama_katıl.png';
import mobileAppImage from '@/assets/mobil_uuygulama_yakında.png';
import vipBannerGif from '@/assets/vıp_banner.gif';
import hosgeldinizBanner from '@/assets/hosgeldiniz_banner.png';
import mobilUygulama from '@/assets/mobil_uygulama.png';
import turnuvaImage from '@/assets/TURNUVA.png';
// gudubet_logo.png public klasöründe, doğrudan URL ile erişilecek
import jackpotImage from '@/assets/jackpot.png';
import kayipBonusu from '@/assets/kayıp_bonusu.png';
import canliCasinoBanner from '@/assets/canlı_casino_banner.png';
import sporCanliBanner from '@/assets/spor_canlı_banner.png';
import vipBlackjackImage from '@/assets/gudubet_vip,_blackjack.png';
import lightningRuletImage from '@/assets/gudubet_lightning_rulet.png';
const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { games, loading } = useCasinoGames();
  const { images, getImageByName } = useSiteImages();



  // Auto-slider timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 8);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Get site images with fallbacks
  const getHeroImage = (imageName: string, fallback: string) => {
    const siteImage = getImageByName(imageName, 'hero');
    if (siteImage?.image_url) {
      return addSmartCacheBuster(siteImage.image_url, siteImage.updated_at);
    }
    return fallback;
  };

  // Get random games for featured section
  const getFeaturedRandomGames = (count: number = 8) => {
    if (!games.length) return [];
    const shuffled = [...games].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(game => ({
      ...game,
      provider: game.provider || 'Unknown',
      category: game.category || 'Unknown',
      volatility: (game.volatility as 'low' | 'medium' | 'high') || 'medium'
    }));
  };

  // Check age verification status on mount
  useEffect(() => {
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
      setShowAgeVerification(true);
    }
  }, []);

  const handleAgeVerification = (isVerified: boolean) => {
    if (isVerified) {
      localStorage.setItem('ageVerified', 'true');
      setShowAgeVerification(false);
    }
  };
  return (
    <div className="min-h-screen bg-black">
      {/* SEO Components */}
      <HomePageSEO />
      <CasinoOrganizationSchema />
      <FAQSchema faqs={generateCasinoFAQs()} />
      
      <Header />
      
      
      {/* Main Content */}
      <div className="bg-black min-h-screen">
        {/* Hero Section - Animated Advertisement Slider */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
              {/* Slide 1 - Main Bonus Banner */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-full bg-gradient-to-br from-red-800 via-red-600 to-orange-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-400/20"></div>
                  <div className="absolute bottom-20 right-20 w-12 h-12 rounded-full bg-orange-400/30"></div>
                  <div className="absolute top-1/3 right-1/4 text-6xl opacity-20">🎰</div>
                  <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-20">🎲</div>
                  
                  <div className="relative z-10 h-full w-full cursor-pointer" onClick={() => setIsRegistrationModalOpen(true)}>
                    <img 
                      src={hosgeldinizBanner} 
                      alt="Hoşgeldiniz Banner" 
                      className="w-full h-full object-cover"
                      style={{ 
                        imageRendering: 'crisp-edges',
                        objectPosition: 'center top'
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage(800, 400);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Slide 2 - VIP Program */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-purple-800 via-purple-600 to-pink-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-purple-400/20"></div>
                  <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-pink-400/30"></div>
                  <div className="absolute top-1/4 left-1/3 text-5xl opacity-30">💎</div>
                  <div className="absolute bottom-1/4 right-1/3 text-4xl opacity-30">👑</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/vip')}>
                    <img 
                      src={vipBannerGif} 
                      alt="VIP Banner" 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 3 - Live Casino */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-green-800 via-green-600 to-emerald-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-15 left-15 w-14 h-14 rounded-full bg-green-400/20"></div>
                  <div className="absolute bottom-15 right-15 w-18 h-18 rounded-full bg-emerald-400/30"></div>
                  <div className="absolute top-1/3 left-1/4 text-5xl opacity-30">🃏</div>
                  <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-30">🎯</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/live-casino')}>
                    <img 
                      src={canliCasinoBanner} 
                      alt="Canlı Casino Banner" 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 4 - Sports Betting */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-blue-400/20"></div>
                  <div className="absolute bottom-12 left-12 w-14 h-14 rounded-full bg-cyan-400/30"></div>
                  <div className="absolute top-1/4 right-1/3 text-5xl opacity-30">⚽</div>
                  <div className="absolute bottom-1/4 left-1/3 text-4xl opacity-30">🏀</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/live-betting')}>
                    <img 
                      src={sporCanliBanner} 
                      alt="Spor Canlı Banner" 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 5 - Jackpot */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-yellow-800 via-yellow-600 to-amber-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-yellow-400/20"></div>
                  <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-amber-400/30"></div>
                  <div className="absolute top-1/5 right-1/4 text-6xl opacity-40">💰</div>
                  <div className="absolute bottom-1/5 left-1/4 text-5xl opacity-40">🎰</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/casino')}>
                    <img 
                      src={jackpotImage} 
                      alt="Jackpot" 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 6 - Mobile App */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-indigo-800 via-indigo-600 to-blue-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-10 left-10 w-18 h-18 rounded-lg bg-indigo-400/20"></div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 rounded-lg bg-blue-400/30"></div>
                  <div className="absolute top-1/3 left-1/4 text-5xl opacity-30">📱</div>
                  <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-30">📲</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <img 
                      src={mobilUygulama} 
                      alt="Mobil Uygulama" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 7 - Weekly Tournament */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-rose-800 via-rose-600 to-pink-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-rose-400/20"></div>
                  <div className="absolute bottom-12 left-12 w-18 h-18 rounded-full bg-pink-400/30"></div>
                  <div className="absolute top-1/4 left-1/3 text-5xl opacity-30">🏆</div>
                  <div className="absolute bottom-1/4 right-1/3 text-4xl opacity-30">⭐</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <img 
                      src={turnuvaImage} 
                      alt="Turnuva" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 8 - Cashback Bonus */}
              <div className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-teal-800 via-teal-600 to-cyan-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-14 left-14 w-16 h-16 rounded-full bg-teal-400/20"></div>
                  <div className="absolute bottom-14 right-14 w-14 h-14 rounded-full bg-cyan-400/30"></div>
                  <div className="absolute top-1/3 right-1/4 text-5xl opacity-30">💸</div>
                  <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-30">🔄</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/bonuses')}>
                    <img 
                      src={kayipBonusu} 
                      alt="Kayıp Bonusu" 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                </div>
              </div>
            
            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === i 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Promotional Banners Section */}
        <div className="container mx-auto px-4 py-8">
          {/* Address Bar */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-500 rounded-lg p-4 mb-6 text-center">
            <p className="text-black font-semibold">
              {t('address-bar.current-address')} <span className="bg-yellow-300 px-2 py-1 rounded">t.ly/gudubetadres</span> {t('address-bar.use-link')}
            </p>
          </div>

          {/* Three Banner Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Telegram Channel */}
            <Card className="border-none overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open('https://t.me/gudubet', '_blank')}>
              <CardContent className="p-0">
                <img 
                  src={telegramImage} 
                  alt="Telegram Kanalı" 
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>

            {/* VIP Program */}
            <Card className="border-none overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate('/vip')}>
              <CardContent className="p-0">
                <img 
                  src={vipProgramImage} 
                  alt="VIP Program" 
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>

            {/* Mobile App */}
            <Card className="border-none overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
              <CardContent className="p-0">
                <img 
                  src={mobileAppImage} 
                  alt="Mobil Uygulama Yakında" 
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>
          </div>

          {/* Featured Games Section */}
          <GameSlider
            games={getFeaturedRandomGames(8)}
            title={t('sections.featured-games.title')}
            subtitle={t('sections.featured-games.subtitle')}
            showDemoButton={true}
            autoPlay={true}
            autoPlayInterval={4000}
          />

          {/* Winners Section */}
          <div className="mb-8">
            <h2 className="text-yellow-400 text-xl font-bold mb-4">{t('sections.winners.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[{
              name: 'Y.S.',
              game: 'Golden Penny x1000',
              amount: '31.594,50',
              avatar: '🎮'
            }, {
              name: 'S.S.',
              game: 'Flaming Hot Extreme VIP Bell...',
              amount: '42.960,00',
              avatar: '🔥'
            }, {
              name: 'O.A.',
              game: 'Book of Fallen',
              amount: '25.000,00',
              avatar: '📚'
            }, {
              name: 'M.S.',
              game: 'Gates of Olympus Super Scatter',
              amount: '32.294,50',
              avatar: '⚡'
            }].map((winner, index) => <Card key={index} className="bg-gray-900 border-gray-700 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl">{winner.avatar}</div>
                      <div className="flex-1">
                        <div className="font-bold text-yellow-400">{winner.name}</div>
                        <div className="text-xs text-gray-400 truncate">{winner.game}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400">₺{winner.amount}</div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          {/* Casino Games Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-yellow-400 text-2xl font-bold flex items-center">
{t('sections.casino-games.title')}
              </h2>
              <Button 
                variant="outline" 
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                onClick={() => navigate('/casino')}
              >
                {t('buttons.view-all')}
              </Button>
            </div>
            
            {/* Casino Games Grid with Sidebar */}
            <div className="relative">
              {/* POPÜLER Sidebar - Desktop Only - Fixed to left edge */}
              <div className="hidden lg:block absolute left-0 top-0 w-64 h-full z-10">
                <PopularSidebar />
              </div>

              {/* Games Grid with left margin for sidebar */}
              <div className="lg:ml-72">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {getFeaturedRandomGames(12).slice(0, 6).map((game) => (
                <div key={game.id} className="group relative">
                  <Card className="bg-gray-900 border-gray-700 overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {game.thumbnail_url ? (
                        <img 
                          src={game.thumbnail_url} 
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <div className="text-4xl opacity-50">🎰</div>
                        </div>
                      )}

                      {/* Overlay with buttons and game name */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                        {/* Game Name */}
                        <div className="text-center mb-4 px-2">
                          <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                            {game.name}
                          </h3>
                          <p className="text-gray-300 text-xs">
                            {game.provider}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => navigate(`/game/${game.slug}`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
                          >
                            <Play className="w-3 h-3 mr-1" />
{t('buttons.play')}
                          </Button>
                          
                          <Button
                            onClick={() => navigate(`/demo-games?game=${game.slug}`)}
                            variant="outline"
                            className="bg-transparent border-white/30 text-white hover:bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm"
                          >
                            <Eye className="w-3 h-3 mr-1" />
{t('buttons.demo')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

                {/* Second row of casino games */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {getFeaturedRandomGames(12).slice(6, 12).map((game) => (
                    <div key={game.id} className="group relative">
                      <Card className="bg-gray-900 border-gray-700 overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {game.thumbnail_url ? (
                            <img 
                              src={game.thumbnail_url} 
                              alt={game.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                              <div className="text-4xl opacity-50">🎰</div>
                            </div>
                          )}

                          {/* Overlay with buttons and game name */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                            {/* Game Name */}
                            <div className="text-center mb-4 px-2">
                              <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                                {game.name}
                              </h3>
                              <p className="text-gray-300 text-xs">
                                {game.provider}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                              <Button
                                onClick={() => navigate(`/game/${game.slug}`)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
                              >
                                <Play className="w-3 h-3 mr-1" />
{t('buttons.play')}
                              </Button>
                              
                              <Button
                                onClick={() => navigate(`/demo-games?game=${game.slug}`)}
                                variant="outline"
                                className="bg-transparent border-white/30 text-white hover:bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm"
                              >
                                <Eye className="w-3 h-3 mr-1" />
{t('buttons.demo')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Casino Games Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-yellow-400 text-2xl font-bold flex items-center">
                {t('sections.live-casino.title')}
              </h2>
              <Button 
                variant="outline" 
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black no-underline"
                onClick={() => navigate('/live-casino')}
              >
                {t('buttons.view-all')}
              </Button>
            </div>
            
            {/* Live Casino Games Grid with Sidebar */}
            <div className="relative">
              {/* CANLI CASİNO Sidebar - Desktop Only - Fixed to left edge */}
              <div className="hidden lg:block absolute left-0 top-0 w-64 h-full z-10">
                <div className="relative h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 ml-4">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                      backgroundImage: `url(${turnuvaImage})`
                    }}
                  ></div>
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    <div className="text-center">
                      <h3 className="text-white text-2xl font-bold mb-4">{t('banners.live-casino.title')}</h3>
                    </div>
                    <Button 
                      onClick={() => navigate('/live-casino')}
                      className="bg-white text-black hover:bg-gray-100 font-bold w-full"
                    >
                      {t('sidebar.live-casino.view-all')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Games Grid with left margin for sidebar */}
              <div className="lg:ml-72">
                {/* First row of live casino games */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                {
                  id: 'live-1',
                  name: t('games.live.lightning-roulette'),
                  provider: 'Evolution',
                  thumbnail: vipBlackjackImage,
                  slug: 'lightning-rulet'
                },
                {
                  id: 'live-2',
                  name: t('games.live.special-studio'),
                  provider: 'Evolution',
                  thumbnail: vipBlackjackImage,
                  slug: 'ozel-studio'
                },
                {
                  id: 'live-3',
                  name: t('games.live.blackjack-lobby'),
                  provider: 'Evolution',
                  thumbnail: vipBlackjackImage,
                  slug: 'blackjack-lobby'
                },
                {
                  id: 'live-4',
                  name: t('games.live.crazy-time'),
                  provider: 'Evolution',
                  thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop',
                  slug: 'crazy-time'
                },
                {
                  id: 'live-5',
                  name: t('games.live.dream-catcher'),
                  provider: 'Evolution',
                  thumbnail: lightningRuletImage,
                  slug: 'dream-catcher'
                },
                {
                  id: 'live-6',
                  name: t('games.live.monopoly-live'),
                  provider: 'Evolution',
                  thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop',
                  slug: 'monopoly-live'
                }
              ].map((game) => (
                <div key={game.id} className="group relative">
                  <Card className="bg-gray-900 border-gray-700 overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={game.thumbnail} 
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />


                      {/* Overlay with buttons and game name */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                        {/* Game Name */}
                        <div className="text-center mb-4 px-2">
                          <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                            {game.name}
                          </h3>
                          <p className="text-gray-300 text-xs">
                            {game.provider}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => navigate(`/live-casino/${game.slug}`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Canlı Oyna
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

                {/* Second row of live casino games */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    {
                      id: 'live-7',
                      name: t('games.live.speed-roulette'),
                      provider: 'Evolution',
                      thumbnail: lightningRuletImage,
                      slug: 'speed-roulette'
                    },
                    {
                      id: 'live-8',
                      name: t('games.live.vip-blackjack'),
                      provider: 'Evolution',
                      thumbnail: vipBlackjackImage,
                      slug: 'vip-blackjack'
                    },
                    {
                      id: 'live-9',
                      name: t('games.live.immersive-roulette'),
                      provider: 'Evolution',
                      thumbnail: lightningRuletImage,
                      slug: 'immersive-roulette'
                    },
                    {
                      id: 'live-10',
                      name: t('games.live.lightning-dice'),
                      provider: 'Evolution',
                      thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop',
                      slug: 'lightning-dice'
                    },
                    {
                      id: 'live-11',
                      name: t('games.live.gonzos-treasure-hunt'),
                      provider: 'Evolution',
                      thumbnail: lightningRuletImage,
                      slug: 'gonzos-treasure-hunt'
                    },
                    {
                      id: 'live-12',
                      name: t('games.live.side-bet-city'),
                      provider: 'Evolution',
                      thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop',
                      slug: 'side-bet-city'
                    }
                  ].map((game) => (
                    <div key={game.id} className="group relative">
                      <Card className="bg-gray-900 border-gray-700 overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img 
                            src={game.thumbnail} 
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />


                          {/* Overlay with buttons and game name */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                            {/* Game Name */}
                            <div className="text-center mb-4 px-2">
                              <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                                {game.name}
                              </h3>
                              <p className="text-gray-300 text-xs">
                                {game.provider}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                              <Button
                                onClick={() => navigate(`/live-casino/${game.slug}`)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
                              >
                                <Play className="w-3 h-3 mr-1" />
{t('buttons.live-play')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />

      {/* Registration Modal */}
      <RegistrationModal isOpen={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} />

      {/* Age Verification Modal */}
      <AgeVerificationModal 
        isOpen={showAgeVerification} 
        onVerify={handleAgeVerification} 
      />

    </div>
  );
};

export default Index;