import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Heart, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { addSmartCacheBuster, getPlaceholderImage } from '@/utils/imageUtils';
import { GameCard } from './GameCard';

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
  updated_at?: string; // Add updated_at field
}

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  onFavoriteToggle?: (gameId: string, isFavorite: boolean) => void;
  favorites?: string[];
  viewMode?: 'grid' | 'list';
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  loading = false,
  onFavoriteToggle,
  favorites = [],
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);

  const handlePlayGame = async (game: Game) => {
    setLoadingGame(game.id);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (game.category === 'slots') {
        navigate(`/slot/${game.slug}`);
      } else {
        // For other game types, we'll navigate to a generic game page
        navigate(`/game/${game.slug}`);
      }
    } catch (error) {
      toast.error('Oyun yüklenirken hata oluştu');
    } finally {
      setLoadingGame(null);
    }
  };

  const handleFavoriteToggle = (gameId: string) => {
    const isFavorite = favorites.includes(gameId);
    onFavoriteToggle?.(gameId, !isFavorite);
    
    if (!isFavorite) {
      toast.success('Oyun favorilere eklendi');
    } else {
      toast.success('Oyun favorilerden çıkarıldı');
    }
  };

  const getVolatilityColor = (volatility?: string) => {
    switch (volatility) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getVolatilityText = (volatility?: string) => {
    switch (volatility) {
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Play className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Oyun bulunamadı</h3>
          <p>Arama kriterlerinize uygun oyun bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
          showDemoButton={true}
        />
      ))}
    </div>
  );
};