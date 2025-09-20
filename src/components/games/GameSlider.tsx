import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { addSmartCacheBuster, getPlaceholderImage } from '@/utils/imageUtils';
import { useI18n } from '@/hooks/useI18n';

interface Game {
  id: string;
  name: string;
  slug: string;
  provider: string;
  category: string;
  thumbnail_url?: string;
  rtp_percentage?: number;
  volatility?: 'low' | 'medium' | 'high';
  min_bet: number;
  max_bet: number;
  is_featured: boolean;
  is_new: boolean;
  is_popular: boolean;
  play_count: number;
  jackpot_amount?: number;
  updated_at?: string;
}

interface GameSliderProps {
  games: Game[];
  title?: string;
  subtitle?: string;
  showDemoButton?: boolean;
  favorites?: string[];
  onFavoriteToggle?: (gameId: string, isFavorite: boolean) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const GameSlider: React.FC<GameSliderProps> = ({
  games,
  title = "Öne Çıkan Oyunlar",
  subtitle = "En popüler casino oyunlarını keşfedin",
  showDemoButton = true,
  favorites = [],
  onFavoriteToggle,
  autoPlay = false,
  autoPlayInterval = 5000
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(autoPlay);

  // Calculate how many games to show based on screen size
  const getGamesPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1; // mobile
    if (width < 768) return 2; // tablet
    if (width < 1024) return 3; // desktop
    if (width < 1280) return 4; // large desktop
    return 5; // xl desktop
  };

  const [gamesPerView, setGamesPerView] = React.useState(getGamesPerView);

  React.useEffect(() => {
    const handleResize = () => {
      setGamesPerView(getGamesPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying && games.length > gamesPerView) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => 
          prev >= games.length - gamesPerView ? 0 : prev + 1
        );
      }, autoPlayInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, games.length, gamesPerView, autoPlayInterval]);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev >= games.length - gamesPerView ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev <= 0 ? games.length - gamesPerView : prev - 1
    );
  };

  const handlePlayGame = async (game: Game, isDemo: boolean = false) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isDemo) {
        navigate(`/demo/${game.slug}`);
      } else {
        if (game.category === 'slots') {
          navigate(`/slot/${game.slug}`);
        } else {
          navigate(`/game/${game.slug}`);
        }
      }
    } catch (error) {
      toast.error('Oyun yüklenirken hata oluştu');
    }
  };



  if (games.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <p className="text-gray-400">Henüz oyun bulunmuyor.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">{subtitle}</p>
          </div>
          
          {games.length > gamesPerView && (
            <div className="flex items-center gap-2">
              <Button
                onClick={prevSlide}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={nextSlide}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / gamesPerView)}%)` }}
          >
            {games.map((game) => (
              <div 
                key={game.id} 
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / gamesPerView}%` }}
              >
                <Card className="group relative overflow-hidden bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* Game Thumbnail */}
                    {game.thumbnail_url ? (
                      <img 
                        src={addSmartCacheBuster(game.thumbnail_url, game.updated_at)} 
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = getPlaceholderImage(300, 225);
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
                        style={{
                          backgroundImage: `url(${getPlaceholderImage(300, 225)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <Play className="w-12 h-12 text-orange-500/60" />
                      </div>
                    )}

                    {/* Overlay with buttons and game name */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                      {/* Game Name */}
                      <div className="text-center mb-6 px-4">
                        <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                          {game.name}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {game.provider}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => handlePlayGame(game, false)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {t('casino.play', 'Play')}
                        </Button>
                        
                        {showDemoButton && (
                          <Button
                            onClick={() => handlePlayGame(game, true)}
                            variant="outline"
                            className="bg-transparent border-white/30 text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t('casino.demo', 'Demo')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Badges removed for cleaner look */}


                    {/* Provider Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-gray-800/90 text-white text-xs px-2 py-1 backdrop-blur-sm">
                        {game.provider}
                      </Badge>
                    </div>

                    {/* Jackpot Amount */}
                    {game.jackpot_amount && game.jackpot_amount > 0 && (
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-2 py-1 font-bold">
                          ₺{game.jackpot_amount.toLocaleString()}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {game.name}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Min: ₺{game.min_bet}</span>
                        <span>Max: ₺{game.max_bet}</span>
                        {game.rtp_percentage && (
                          <span>RTP: %{game.rtp_percentage}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        {games.length > gamesPerView && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: Math.ceil(games.length / gamesPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-orange-500 w-6' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
