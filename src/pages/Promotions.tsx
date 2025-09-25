import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClaimBonus, usePromotionsData } from '@/hooks/useBonuses';
import { useMyBonusRequests } from '@/hooks/useBonusRequests';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import gudubetBonusImage from '@/assets/gudubet-bonus.png';
import vipBonusImage from '@/assets/vip-bonus-new.png';
import dogumGunuBonusImage from '@/assets/dogum_gunu_bonusu.jpeg';
import ilkYatirimImage from '@/assets/ilk_yatirim.png';
import { useI18n } from '@/hooks/useI18n';
import { 
  Gift, 
  Calendar, 
  TrendingUp, 
  Percent, 
  Star, 
  Clock,
  Users,
  Trophy,
  Zap,
  Copy,
  Share2,
  Timer,
  Crown,
  Flame,
  CheckCircle
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  image_url: string;
  category: string;
  bonus_amount: number | null;
  bonus_percentage: number | null;
  min_deposit: number | null;
  max_bonus: number | null;
  wagering_requirement: number;
  promo_code: string | null;
  terms_conditions: string;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  current_participants: number;
  source?: string; // 'bonus' for bonuses_new table items
}

interface UserPromotion {
  id: string;
  promotion_id: string;
  status: string;
  participated_at: string;
}

const Promotions = () => {
  const { t } = useI18n();
  const [userPromotions, setUserPromotions] = useState<UserPromotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string>('');
  const { toast } = useToast();
  const claimBonusMutation = useClaimBonus();
  const { data: bonusRequests } = useMyBonusRequests();
  
  // React Query ile veri çekme
  const { data: promotions = [], isLoading: loading, error } = usePromotionsData();

  const categories = [
    { id: 'all', name: t('casino.all', 'All'), icon: Zap },
    { id: 'welcome', name: t('casino.welcome', 'Welcome'), icon: Star },
    { id: 'deposit', name: t('casino.deposit', 'Deposit'), icon: TrendingUp },
    { id: 'freebet', name: t('casino.freebet', 'Freebet'), icon: Zap },
    { id: 'cashback', name: t('casino.cashback', 'Cashback'), icon: Percent },
    { id: 'first_deposit', name: t('casino.firstDeposit', 'First Deposit'), icon: Star },
    { id: 'reload', name: t('casino.reload', 'Reload'), icon: TrendingUp },
    { id: 'special', name: t('casino.special', 'Special Day'), icon: Trophy },
    { id: 'vip', name: t('casino.vip', 'VIP'), icon: Crown },
  ];

  // Countdown Timer Component
  const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(endDate).getTime();
        const distance = end - now;

        if (distance < 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <Timer className="w-4 h-4 mr-1" />
          <span>{t('casino.expired', 'Expired')}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1 text-sm">
        <Timer className="w-4 h-4 text-orange-500" />
        <div className="flex space-x-1">
          {timeLeft.days > 0 && (
            <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
              {timeLeft.days}{t('casino.daysShort', 'd')}
            </span>
          )}
          <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
            {timeLeft.hours.toString().padStart(2, '0')}{t('casino.hoursShort', 'h')}
          </span>
          <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
            {timeLeft.minutes.toString().padStart(2, '0')}{t('casino.minutesShort', 'm')}
          </span>
          <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
            {timeLeft.seconds.toString().padStart(2, '0')}{t('casino.secondsShort', 's')}
          </span>
        </div>
      </div>
    );
  };

  // Error handling for React Query
  if (error) {
    toast({
      title: t('casino.error', 'Error'),
      description: t('casino.errorLoadingPromotions', 'An error occurred while loading promotions.'),
      variant: "destructive"
    });
  }

  // Fetch user promotions
  const fetchUserPromotions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_promotions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserPromotions(data || []);
    } catch (error) {
      console.error('Error fetching user promotions:', error);
    }
  };

  useEffect(() => {
    fetchUserPromotions();
  }, []);

  // Filter promotions by category
  const filteredPromotions = selectedCategory === 'all' 
    ? promotions 
    : promotions.filter(promo => promo.category === selectedCategory);

  // Check if user already participated in promotion (allowing multiple participations)
  const hasParticipated = (promotionId: string) => {
    // Always return false to allow multiple participation in bonuses
    return false;
  };

  // Join promotion
  const joinPromotion = async (promotion: Promotion) => {
    console.log('🚀 joinPromotion called with:', promotion);
    console.log('🔍 promotion.source:', promotion.source);
    console.log('📊 bonusRequests:', bonusRequests);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('casino.loginRequired', 'Login Required'),
          description: t('casino.loginRequiredToJoin', 'You must login to join the promotion.'),
          variant: "destructive"
        });
        return;
      }

      // Remove participation check to allow multiple bonus requests
      // Users can now apply for the same bonus multiple times

      console.log('✅ Checking promotion source...');
      // If this is from bonuses_new table (has source), use new bonus request system
      if (promotion.source === 'bonus') {
        console.log('🎯 Using new bonus system');
        await claimBonusMutation.mutateAsync({
          bonus_id: promotion.id,
          deposit_amount: promotion.min_deposit || 0
        });
        
        toast({
          title: t('casino.requestSent', 'Request Sent!'),
          description: `${promotion.title} ${t('casino.bonusRequestSent', 'bonus request sent. Waiting for approval.')}`,
        });
      } else {
        console.log('⚠️ Using legacy promotion system');
        // Legacy promotions system
        const { error } = await supabase
          .from('user_promotions')
          .insert({
            user_id: user.id,
            promotion_id: promotion.id,
            status: 'pending',
            expires_at: promotion.end_date
          });

        if (error) throw error;

        toast({
          title: t('casino.success', 'Success!'),
          description: `${promotion.title} ${t('casino.successfullyJoinedPromotion', 'promotion successfully joined!')}`,
        });

        // Refresh user promotions
        fetchUserPromotions();
      }
    } catch (error) {
      console.error('Error joining promotion:', error);
      toast({
        title: t('casino.error', 'Error'),
        description: t('casino.errorJoiningPromotion', 'An error occurred while joining the promotion.'),
        variant: "destructive"
      });
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(cat => cat.id === category);
    const IconComponent = categoryObj?.icon || Gift;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b">
          <div className="container mx-auto px-6 py-12">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">{t('casino.promotionsAndBonuses', 'Promotions & Bonuses')}</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('casino.promotionsDescription', 'Increase your winnings with amazing bonuses and promotions prepared especially for you! Don\'t miss many opportunities from welcome bonuses to special day campaigns.')}
                </p>
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Gift className="w-4 h-4 mr-2" />
                    <span>{promotions.length} {t('casino.activePromotions', 'Active Promotions')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{t('casino.dailyUpdate', 'Daily Update')}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{t('casino.vipBonuses', 'VIP Bonuses')}</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-64 h-32 bg-gradient-to-br from-primary/20 to-destructive/20 rounded-lg flex items-center justify-center">
                  <Gift className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.id === 'all' 
                    ? promotions.length 
                    : promotions.filter(p => p.category === category.id).length
                  }
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* VIP Section */}
        {selectedCategory === 'vip' && (
          <div className="container mx-auto px-6 mb-8">
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-500/20 rounded-full">
                    <Crown className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-500">{t('casino.vipPromotions', 'VIP Promotions')}</h3>
                    <p className="text-sm text-muted-foreground">{t('casino.eliteMembers', 'Elite Members')}</p>
                  </div>
                </div>
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  {t('casino.eliteMember', 'Elite Member')}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Promotions Grid */}
        <div className="container mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('casino.promotionsLoading', 'Loading promotions...')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPromotions.map((promotion) => {
                const participationRate = promotion.max_participants 
                  ? (promotion.current_participants / promotion.max_participants) * 100
                  : 0;
                const hasPromoCode = Boolean(promotion.promo_code);
                const isUrgent = participationRate > 80;
                
                return (
                  <Card key={promotion.id} className="bg-card border border-border hover:border-primary/50 transition-colors h-full flex flex-col">
                    <CardHeader className="pb-3 relative">
                      {/* Hot/New/VIP Badges */}
                      <div className="absolute top-3 right-3 flex space-x-1">
                        {isUrgent && (
                          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                            <Flame className="w-3 h-3 mr-1" />
                            {t('casino.limited', 'Limited')}
                          </Badge>
                        )}
                        {promotion.category === 'vip' && (
                          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>

                      <div className="h-40 bg-slate-700 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        {/* Admin panelden eklenen resim varsa onu göster */}
                        {promotion.image_url ? (
                          <div 
                            className="absolute inset-0 rounded-lg overflow-hidden" 
                            style={{
                              backgroundImage: `url(${promotion.image_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          ></div>
                        ) : (
                          <>
                            {/* Varsayılan resimler */}
                            {promotion.category === 'welcome' && (
                              <div 
                                className="absolute inset-0 rounded-lg overflow-hidden" 
                                style={{
                                  backgroundImage: `url(${gudubetBonusImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                }}
                              ></div>
                            )}
                            {promotion.category === 'vip' && (
                              <div 
                                className="absolute inset-0 rounded-lg overflow-hidden" 
                                style={{
                                  backgroundImage: `url(${vipBonusImage})`,
                                  backgroundSize: 'cover', 
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                }}
                              ></div>
                            )}
                            {promotion.category === 'special' && (
                              <div 
                                className="absolute inset-0 rounded-lg overflow-hidden" 
                                style={{
                                  backgroundImage: `url(${dogumGunuBonusImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                }}
                              ></div>
                            )}
                            {promotion.category === 'first_deposit' && (
                              <div 
                                className="absolute inset-0 rounded-lg overflow-hidden" 
                                style={{
                                  backgroundImage: `url(${ilkYatirimImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                }}
                              ></div>
                            )}
                            {promotion.category === 'deposit' && (
                              <div 
                                className="absolute inset-0 rounded-lg overflow-hidden" 
                                style={{
                                  backgroundImage: `url(${ilkYatirimImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                }}
                              ></div>
                            )}
                          </>
                        )}
                        {getCategoryIcon(promotion.category)}
                      </div>

                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <h3 className="font-bold text-lg mb-1 line-clamp-1">{promotion.title}</h3>
                          
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="outline">
                              {categories.find(c => c.id === promotion.category)?.name}
                            </Badge>
                            {hasPromoCode && (
                              <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                                <Copy className="w-3 h-3 mr-1" />
                                {t('casino.code', 'Code')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {promotion.bonus_percentage && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              %{promotion.bonus_percentage}
                            </div>
                            <div className="text-xs text-muted-foreground">{t('casino.bonus', 'Bonus')}</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-2 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {promotion.description}
                      </p>

                      {/* Countdown Timer */}
                      <div className="mb-4">
                        <CountdownTimer endDate={promotion.end_date} />
                      </div>

                      {/* Participation Progress */}
                      {promotion.max_participants && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{t('casino.participation', 'Participation')}</span>
                            <span className="font-medium">
                              {promotion.current_participants}/{promotion.max_participants}
                            </span>
                          </div>
                          <Progress value={participationRate} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-2 mb-4 flex-1">
                        {promotion.min_deposit && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{t('casino.minDeposit', 'Min. Deposit')}:</span>
                            <span className="font-medium">₺{promotion.min_deposit}</span>
                          </div>
                        )}
                        {promotion.max_bonus && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{t('casino.maxBonus', 'Max. Bonus')}:</span>
                            <span className="font-medium">₺{promotion.max_bonus}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{t('casino.wagering', 'Wagering')}:</span>
                          <span className="font-medium">{promotion.wagering_requirement}x</span>
                        </div>
                      </div>

                       {/* Buttons - Always at bottom */}
                       <div className="flex gap-2 mt-auto">
                         <Dialog open={isDialogOpen && selectedPromotion?.id === promotion.id} onOpenChange={(open) => {
                           setIsDialogOpen(open);
                           if (!open) setSelectedPromotion(null);
                         }}>
                           <DialogTrigger asChild>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="flex-1"
                               onClick={() => {
                                 setSelectedPromotion(promotion);
                                 setIsDialogOpen(true);
                               }}
                             >
                               {t('casino.details', 'Details')}
                             </Button>
                           </DialogTrigger>
                         </Dialog>
                        
                         <Button 
                           size="sm"
                           className="flex-1 bg-primary hover:bg-primary/90"
                           onClick={() => joinPromotion(promotion)}
                          >
                            <div className="flex items-center">
                              <Gift className="w-4 h-4 mr-1" />
                              {t('casino.join', 'Join')}
                            </div>
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && filteredPromotions.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedCategory === 'all' 
                  ? t('casino.noActivePromotions', 'No active promotions at the moment.') 
                  : `${categories.find(c => c.id === selectedCategory)?.name} ${t('casino.noPromotionsInCategory', 'No promotions found in this category.')}`
                }
              </p>
            </div>
          )}
        </div>

        {/* Promotion Details Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Promotion Details</DialogTitle>
            </DialogHeader>
            {selectedPromotion && (
              <div className="flex flex-col lg:flex-row h-full">
                {/* Left Side - Image */}
                <div className="lg:w-1/2 w-full">
                  <div className="relative h-64 lg:h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
                    {/* Background Image */}
                    {selectedPromotion.category === 'welcome' && (
                      <div 
                        className="absolute inset-0" 
                        style={{
                          backgroundImage: `url(${gudubetBonusImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 0.3
                        }}
                      ></div>
                    )}
                    {selectedPromotion.category === 'vip' && (
                      <div 
                        className="absolute inset-0" 
                        style={{
                          backgroundImage: `url(${vipBonusImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 0.3
                        }}
                      ></div>
                    )}
                    {selectedPromotion.category === 'special' && (
                      <div 
                        className="absolute inset-0" 
                        style={{
                          backgroundImage: `url(${dogumGunuBonusImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 0.3
                        }}
                      ></div>
                    )}
                    {selectedPromotion.category === 'first_deposit' && (
                      <div 
                        className="absolute inset-0" 
                        style={{
                          backgroundImage: `url(${ilkYatirimImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 0.3
                        }}
                      ></div>
                    )}
                    {selectedPromotion.category === 'deposit' && (
                      <div 
                        className="absolute inset-0" 
                        style={{
                          backgroundImage: `url(${ilkYatirimImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 0.3
                        }}
                      ></div>
                    )}
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-grid-pattern"></div>
                    </div>
                    
                    {/* Main Visual Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-8">
                      <div className="mb-6">
                        {getCategoryIcon(selectedPromotion.category)}
                      </div>
                      
                      {/* Bonus Display */}
                      {selectedPromotion.bonus_percentage && (
                        <div className="text-center mb-6">
                          <div className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            %{selectedPromotion.bonus_percentage}
                          </div>
                          <div className="text-lg text-muted-foreground font-medium">
                            {t('casino.bonus', 'Bonus')}
                          </div>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          {categories.find(c => c.id === selectedPromotion.category)?.name}
                        </Badge>
                        {selectedPromotion.promo_code && (
                          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                            <Copy className="w-3 h-3 mr-1" />
                            {t('casino.code', 'Code')} {t('casino.available', 'Available')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-secondary/10 rounded-full blur-lg"></div>
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="lg:w-1/2 w-full flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b bg-muted/30">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold leading-tight">
                        {selectedPromotion.title}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Quick Stats */}
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {selectedPromotion.min_deposit && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>{t('casino.minDeposit', 'Min.')} ₺{selectedPromotion.min_deposit}</span>
                        </div>
                      )}
                      {selectedPromotion.max_bonus && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Gift className="w-4 h-4" />
                          <span>{t('casino.maxBonus', 'Max.')} ₺{selectedPromotion.max_bonus}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{selectedPromotion.wagering_requirement}x {t('casino.wagering', 'wagering')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        {t('casino.promotionDetails', 'Promotion Details')}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedPromotion.detailed_description || selectedPromotion.description}
                      </p>
                    </div>

                    {/* Promo Code Section */}
                    {selectedPromotion.promo_code && (
                      <div>
                        <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                          <Copy className="w-5 h-5 text-blue-500" />
                          {t('casino.promotionCode', 'Promotion Code')}
                        </h4>
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <code className="text-primary font-mono font-bold text-lg">
                              {selectedPromotion.promo_code}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedPromotion.promo_code || '');
                                toast({
                                  title: t('casino.copied', 'Copied!'),
                                  description: t('casino.promotionCodeCopied', 'Promotion code copied to clipboard.'),
                                });
                              }}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              {t('casino.copy', 'Copy')}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {t('casino.useThisCodeWhenDepositing', 'Use this code when making a deposit')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Countdown Timer */}
                    <div>
                      <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        <Timer className="w-5 h-5 text-orange-500" />
                        {t('casino.time', 'Time')}
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <CountdownTimer endDate={selectedPromotion.end_date} />
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div>
                      <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        {t('casino.termsAndConditions', 'Terms & Conditions')}
                      </h4>
                      <div className="bg-muted/30 border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedPromotion.terms_conditions}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t bg-muted/20">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        {t('casino.close', 'Close')}
                      </Button>
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => {
                          joinPromotion(selectedPromotion);
                          setIsDialogOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          {t('casino.joinPromotion', 'Join Promotion')}
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Promotions;