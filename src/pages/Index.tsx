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
import { useSiteImages } from '@/hooks/useSiteImages';
import { addSmartCacheBuster, getPlaceholderImage } from '@/utils/imageUtils';
import { generateCasinoFAQs } from '@/utils/seoUtils';
import { Send, Play, Star, Eye } from 'lucide-react';
import treasureImage from '@/assets/treasure.png';
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
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-full bg-gradient-to-br from-red-800 via-red-600 to-orange-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-400/20"></div>
                  <div className="absolute bottom-20 right-20 w-12 h-12 rounded-full bg-orange-400/30"></div>
                  <div className="absolute top-1/3 right-1/4 text-6xl opacity-20">🎰</div>
                  <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-20">🎲</div>
                  
                  <div className="relative z-10 h-full w-full cursor-pointer" onClick={() => setIsRegistrationModalOpen(true)}>
                    <img 
                      src={getHeroImage('welcome-bonus', '/lovable-uploads/ea4401d0-dccf-4923-b1f3-c6fe9f5412a8.png')} 
                      alt={t('hero.welcome-bonus.alt')} 
                      className="w-full h-full object-cover"
                      style={{ 
                        imageRendering: 'crisp-edges',
                        objectPosition: 'center top'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage(800, 400);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Slide 2 - VIP Program */}
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-purple-800 via-purple-600 to-pink-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-purple-400/20"></div>
                  <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-pink-400/30"></div>
                  <div className="absolute top-1/4 left-1/3 text-5xl opacity-30">💎</div>
                  <div className="absolute bottom-1/4 right-1/3 text-4xl opacity-30">👑</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                        <span className="text-yellow-300">VIP</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-purple-300">
                          {t('hero.vip.special-advantages')}
                        </h2>
                      </div>
                      <div className="flex justify-center items-center space-x-4 mb-6">
                        <div className="text-center">
                          <div className="text-3xl mb-1">💎</div>
                          <div className="text-lg font-bold text-yellow-300">%25</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl mb-1">🎁</div>
                          <div className="text-lg font-bold text-yellow-300">BONUS</div>
                        </div>
                      </div>
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform" onClick={() => navigate('/vip')}>
                        {t('hero.vip.become-vip')}
                      </Button>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                      <div className="text-8xl md:text-9xl opacity-80">👑</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 - Live Casino */}
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-green-800 via-green-600 to-emerald-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-15 left-15 w-14 h-14 rounded-full bg-green-400/20"></div>
                  <div className="absolute bottom-15 right-15 w-18 h-18 rounded-full bg-emerald-400/30"></div>
                  <div className="absolute top-1/3 left-1/4 text-5xl opacity-30">🃏</div>
                  <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-30">🎯</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-emerald-300">CANLI</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-emerald-300">
                          {t('hero.live-casino.experience')}
                        </h2>
                      </div>
                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform" onClick={() => navigate('/live-casino')}>
                        {t('hero.live-casino.play')}
                      </Button>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                      <div className="text-8xl md:text-9xl opacity-80">🎲</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 4 - Sports Betting */}
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-blue-400/20"></div>
                  <div className="absolute bottom-12 left-12 w-14 h-14 rounded-full bg-cyan-400/30"></div>
                  <div className="absolute top-1/4 right-1/3 text-5xl opacity-30">⚽</div>
                  <div className="absolute bottom-1/4 left-1/3 text-4xl opacity-30">🏀</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-cyan-300">SPOR</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-cyan-300">
                          {t('hero.sports-betting.excitement')}
                        </h2>
                      </div>
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform" onClick={() => navigate('/sports-betting')}>
                        {t('hero.sports-betting.place-bet')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 5 - Jackpot */}
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-yellow-800 via-yellow-600 to-amber-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-yellow-400/20"></div>
                  <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-amber-400/30"></div>
                  <div className="absolute top-1/5 right-1/4 text-6xl opacity-40">💰</div>
                  <div className="absolute bottom-1/5 left-1/4 text-5xl opacity-40">🎰</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center">
                      <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                        <span className="text-yellow-300">JACKPOT</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">
                          ₺5.847.293
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6">{t('hero.jackpot.waiting')}</p>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform" onClick={() => navigate('/casino')}>
                        {t('hero.jackpot.try-luck')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 6 - Mobile App */}
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-indigo-800 via-indigo-600 to-blue-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-10 left-10 w-18 h-18 rounded-lg bg-indigo-400/20"></div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 rounded-lg bg-blue-400/30"></div>
                  <div className="absolute top-1/3 left-1/4 text-5xl opacity-30">📱</div>
                  <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-30">📲</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-blue-300">MOBİL</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-blue-300">
                          UYGULAMA
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6">{t('hero.mobile-app.everywhere')}</p>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform">
                        {t('hero.mobile-app.download')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 7 - Weekly Tournament */}
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-rose-800 via-rose-600 to-pink-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-rose-400/20"></div>
                  <div className="absolute bottom-12 left-12 w-18 h-18 rounded-full bg-pink-400/30"></div>
                  <div className="absolute top-1/4 left-1/3 text-5xl opacity-30">🏆</div>
                  <div className="absolute bottom-1/4 right-1/3 text-4xl opacity-30">⭐</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-pink-300">TURNUVA</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-pink-300">
                          {t('hero.tournament.weekly-competition')}
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6">{t('hero.tournament.prize-pool')}</p>
                      <Button className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform">
                        {t('hero.tournament.join')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 8 - Cashback Bonus */}
              <div className="w-full flex-shrink-0 h-80 md:h-96">
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-teal-800 via-teal-600 to-cyan-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-14 left-14 w-16 h-16 rounded-full bg-teal-400/20"></div>
                  <div className="absolute bottom-14 right-14 w-14 h-14 rounded-full bg-cyan-400/30"></div>
                  <div className="absolute top-1/3 right-1/4 text-5xl opacity-30">💸</div>
                  <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-30">🔄</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-teal-300">%20</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-teal-300">
                          {t('hero.cashback.loss-bonus')}
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6">{t('hero.cashback.get-back')}</p>
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform">
                        {t('hero.cashback.get')}
                      </Button>
                    </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Telegram Channel */}
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 border-none text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{t('banners.telegram.join-channel')}</h3>
                    <h3 className="text-2xl font-bold mb-2">{t('banners.telegram.channel')}</h3>
                    <p className="text-sm opacity-90">{t('banners.telegram.subscribers')}</p>
                    <p className="text-xs opacity-75 mt-2">{t('gudubet_telegram')}</p>
                  </div>
                  <Send className="w-16 h-16 opacity-80" />
                </div>
              </CardContent>
            </Card>

            {/* VIP Program */}
            <Card className="bg-gradient-to-r from-green-600 to-emerald-500 border-none text-white overflow-hidden">
              <CardContent className="p-6 relative bg-cover bg-center bg-no-repeat" style={{
              backgroundImage: `url(${treasureImage})`
            }}>
                <div className="text-center">
                  <div className="flex justify-center space-x-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-sm font-bold">%15</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-sm font-bold">%20</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-sm font-bold">%25</div>
                    </div>
                  </div>
                  <Button className="bg-white text-green-600 font-bold hover:bg-gray-100 no-underline" onClick={() => navigate('/vip')}>
                    {t('banners.vip.program')} →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mobile App */}
            <Card className="bg-gradient-to-r from-orange-600 to-red-500 border-none text-white overflow-hidden relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl animate-bounce">📱</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{t('banners.mobile.title-1')}</h3>
                      <h3 className="text-xl font-bold mb-2">{t('banners.mobile.title-2')}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                        <span className="text-yellow-300 font-bold text-sm">{t('banners.mobile.coming-soon')}</span>
                      </div>
                      <div className="text-xs text-white/80" dangerouslySetInnerHTML={{ __html: t('banners.mobile.description') }} />
                    </div>
                  </div>
                </div>
                
                {/* Animated background elements */}
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full animate-ping"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 bg-yellow-400/30 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="relative h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 ml-4">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop')`
                    }}
                  ></div>
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    <div className="text-center">
                      <h3 className="text-white text-2xl font-bold mb-4">{t('sidebar.popular.title')}</h3>
                      <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <div className="text-6xl">👑</div>
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
                      backgroundImage: `url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=600&fit=crop')`
                    }}
                  ></div>
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    <div className="text-center">
                      <h3 className="text-white text-2xl font-bold mb-4">{t('banners.live-casino.title')}</h3>
                      <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <div className="text-6xl">👩‍💼</div>
                      </div>
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
                  thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop',
                  slug: 'lightning-rulet'
                },
                {
                  id: 'live-2',
                  name: t('games.live.special-studio'),
                  provider: 'Evolution',
                  thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                  slug: 'ozel-studio'
                },
                {
                  id: 'live-3',
                  name: t('games.live.blackjack-lobby'),
                  provider: 'Evolution',
                  thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
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
                  thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
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
                      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                      slug: 'speed-roulette'
                    },
                    {
                      id: 'live-8',
                      name: t('games.live.vip-blackjack'),
                      provider: 'Evolution',
                      thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop',
                      slug: 'vip-blackjack'
                    },
                    {
                      id: 'live-9',
                      name: t('games.live.immersive-roulette'),
                      provider: 'Evolution',
                      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
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
                      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
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