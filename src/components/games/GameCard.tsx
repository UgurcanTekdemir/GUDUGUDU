import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { addSmartCacheBuster, getPlaceholderImage } from '@/utils/imageUtils';

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

interface GameCardProps {
  game: Game;
  favorites?: string[];
  onFavoriteToggle?: (gameId: string, isFavorite: boolean) => void;
  showDemoButton?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  favorites = [],
  onFavoriteToggle,
  showDemoButton = true
}) => {
  const navigate = useNavigate();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);

  const handlePlayGame = async (isDemo: boolean = false) => {
    setLoadingGame(game.id);
    
    try {
      // Simulate loading time
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
    } finally {
      setLoadingGame(null);
    }
  };



  return (
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
              onClick={(e) => {
                e.stopPropagation();
                handlePlayGame(false);
              }}
              disabled={loadingGame === game.id}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
            >
              {loadingGame === game.id ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Oyna
            </Button>
            
            {showDemoButton && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayGame(true);
                }}
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Demo
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
  );
};
