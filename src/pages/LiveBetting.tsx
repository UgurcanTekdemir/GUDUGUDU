import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Users, 
  TrendingUp,
  Clock,
  Play,
  Tv,
  Calendar,
  Star
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import LiveMatchCard from '@/components/betting/LiveMatchCard';
import BettingSlip from '@/components/betting/BettingSlip';
import MatchDetailsModal from '@/components/betting/MatchDetailsModal';
import { useI18n } from '@/hooks/useI18n';

interface LiveMatch {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  home_score: number;
  away_score: number;
  period?: string;
  match_minute?: number;
  match_time?: string;
  sport_type: string;
  league?: string;
  status: string;
  viewers_count: number;
  is_featured: boolean;
  odds: LiveOdds[];
}

interface LiveOdds {
  id: string;
  market_type: string;
  market_name: string;
  selection: string;
  selection_name: string;
  odds_value: number;
  is_active: boolean;
}

interface BetSelection {
  matchId: string;
  matchName: string;
  selection: string;
  odds: number;
}

interface ConfirmedBet {
  id: string;
  bets: BetSelection[];
  stakeAmount: number;
  totalOdds: number;
  potentialWin: number;
  date: string;
  status: string;
}

const LiveBetting = () => {
  const { t } = useI18n();
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('hepsi');
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [confirmedBets, setConfirmedBets] = useState<ConfirmedBet[]>([]);
  const [activeTab, setActiveTab] = useState<string>('betslip');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sportFilters = [
    { id: 'hepsi', name: t('sports.all', 'All'), icon: '🎯' },
    { id: 'futbol', name: t('sports.football', 'Football'), icon: '⚽' },
    { id: 'basketbol', name: t('sports.basketball', 'Basketball'), icon: '🏀' },
    { id: 'tenis', name: t('sports.tennis', 'Tennis'), icon: '🎾' },
    { id: 'e-spor', name: t('sports.esports', 'E-Sports'), icon: '🎮' },
  ];

   useEffect(() => {
     const fetchLiveMatches = async () => {
       setLoading(true);
       
       // Simulate API call without Promise wrapper to avoid Safari timing issues
       setTimeout(() => {
         const mockMatches: LiveMatch[] = [
           {
             id: '1',
             home_team: 'Barcelona',
             away_team: 'Real Madrid',
             home_score: 2,
             away_score: 1,
             period: '2nd Half',
             match_minute: 67,
             match_time: '17:00',
             sport_type: 'futbol',
             league: 'El Clasico',
             status: 'live',
             viewers_count: 125000,
             is_featured: true,
             odds: [
               {
                 id: '1',
                 market_type: '1X2',
                 market_name: 'Match Winner',
                 selection: '1',
                 selection_name: 'Barcelona',
                 odds_value: 2.1,
                 is_active: true
               },
               {
                 id: '2',
                 market_type: '1X2',
                 market_name: 'Match Winner',
                 selection: 'X',
                 selection_name: t('sports.draw', 'Draw'),
                 odds_value: 3.2,
                 is_active: true
               },
               {
                 id: '3',
                 market_type: '1X2',
                 market_name: 'Match Winner',
                 selection: '2',
                 selection_name: 'Real Madrid',
                 odds_value: 3.5,
                 is_active: true
               }
             ]
           },
         ];
         
         setLiveMatches(mockMatches);
         setLoading(false);
       }, 500);
     };

     fetchLiveMatches();
   }, []);

  const filteredMatches = selectedSport === 'hepsi' 
    ? liveMatches 
    : liveMatches.filter(match => match.sport_type === selectedSport);

  const addToBetSlip = (match: LiveMatch, odds: LiveOdds) => {
    const betSelection: BetSelection = {
      matchId: match.id,
      matchName: `${match.home_team} vs ${match.away_team}`,
      selection: odds.selection_name,
      odds: odds.odds_value
    };

    setBetSlip(prev => {
      const existing = prev.find(bet => bet.matchId === match.id);
      if (existing) {
        return prev.map(bet => 
          bet.matchId === match.id ? betSelection : bet
        );
      }
      return [...prev, betSelection];
    });

    toast({
      title: "Bahis Eklendi",
      description: `${odds.selection_name} - ${odds.odds_value} kupona eklendi.`,
    });
  };

  const removeFromBetSlip = (index: number) => {
    setBetSlip(prev => prev.filter((_, i) => i !== index));
  };

  const totalOdds = betSlip.reduce((acc, bet) => acc * bet.odds, 1);
  const potentialWin = parseFloat(stakeAmount) * totalOdds || 0;

  const confirmBet = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: t('errors.error', 'Error'),
        description: t('sports.validStakeAmount', 'Please enter a valid stake amount.'),
        variant: "destructive"
      });
      return;
    }

    if (betSlip.length === 0) {
      toast({
        title: t('errors.error', 'Error'), 
        description: t('sports.selectAtLeastOne', 'Please select at least one bet.'),
        variant: "destructive"
      });
      return;
    }

    const confirmedBet: ConfirmedBet = {
      id: Date.now().toString(),
      bets: [...betSlip],
      stakeAmount: parseFloat(stakeAmount),
      totalOdds: totalOdds,
      potentialWin: potentialWin,
      date: new Date().toLocaleString('tr-TR'),
      status: t('sports.pending', 'Pending')
    };

    setConfirmedBets(prev => [...prev, confirmedBet]);

    toast({
      title: "Bahis Onaylandı!",
      description: `${betSlip.length} bahis ile ₺${parseFloat(stakeAmount)} miktarında bahsiniz onaylandı.`,
    });

    setBetSlip([]);
    setStakeAmount('');
    setActiveTab('mybets');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{t('pages.liveBetting.title', 'Live Betting')}</h1>
                 <Badge className="bg-red-500 text-white">
                   🔴 {t('liveBetting.live', 'LIVE')}
                 </Badge>
                <Badge variant="secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  {liveMatches.length} {t('sports.matches', 'Matches')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{filteredMatches.reduce((sum, match) => sum + (match.viewers_count || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} {t('liveBetting.viewers', 'viewers')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sport Filters */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {sportFilters.map((sport) => (
              <Button
                key={sport.id}
                variant={selectedSport === sport.id ? "default" : "outline"}
                onClick={() => setSelectedSport(sport.id)}
                className="whitespace-nowrap"
              >
                <span className="mr-2">{sport.icon}</span>
                {sport.name}
                {sport.id !== 'hepsi' && (
                  <Badge variant="secondary" className="ml-2">
                    {liveMatches.filter(m => m.sport_type === sport.id).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Canlı maçlar yükleniyor...</p>
            </div>
          )}

          {/* Live Matches List */}
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <LiveMatchCard
                key={match.id}
                match={match}
                onAddToBetSlip={addToBetSlip}
                onShowDetails={(match) => {
                  setSelectedMatch(match);
                  setIsDetailsOpen(true);
                }}
              />
            ))}
          </div>

          {!loading && filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedSport === 'hepsi' 
                  ? t('liveBetting.noLiveMatches', 'No live matches currently available.') 
                  : `${sportFilters.find(s => s.id === selectedSport)?.name} ${t('liveBetting.noLiveMatchesInCategory', 'No live matches in this category.')}`
                }
              </p>
            </div>
          )}
        </div>
      </main>

      <MatchDetailsModal
        match={selectedMatch}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default LiveBetting;