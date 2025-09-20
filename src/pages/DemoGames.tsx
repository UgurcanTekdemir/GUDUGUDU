import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { DemoGameProvider } from '@/components/games/DemoGameProvider';
import { Play, Gamepad2, Trophy, Star } from 'lucide-react';
import SEO from '@/components/SEO';
import { useI18n } from '@/hooks/useI18n';

const DemoGames = () => {
  const { t } = useI18n();
  const [selectedProvider, setSelectedProvider] = useState<'NetEnt' | 'EGT' | 'Pragmatic Play' | 'all'>('all');

  const providerStats = [
    { name: 'NetEnt', count: 3, color: 'bg-blue-600' },
    { name: 'EGT', count: 3, color: 'bg-purple-600' },
    { name: 'Pragmatic Play', count: 4, color: 'bg-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <SEO
        pageSlug="demo-games"
        customTitle={`${t('casino.demoGames', 'Demo Games')} - ${t('casino.freeCasinoGames', 'Free Casino Games')}`}
        customDescription={`${t('casino.tryPopularCasinoGames', 'Try the most popular casino games for free')}. Play NetEnt, EGT and Pragmatic Play games in free demo mode. Play directly without registration.`}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-orange-900 via-red-900 to-purple-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-gaming font-bold mb-4">
                🎮 {t('casino.demoGames', 'Demo Games')}
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-white/90">
                {t('casino.tryPopularCasinoGames', 'Try the most popular casino games for free')}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-orange-500 text-white">
                  <Play className="w-3 h-3 mr-1" />
                  {t('casino.noRegistrationRequired', 'No Registration Required')}
                </Badge>
                <Badge className="bg-green-500">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  {t('casino.playInstantly', 'Play Instantly')}
                </Badge>
                <Badge className="bg-blue-500">
                  <Trophy className="w-3 h-3 mr-1" />
                  {t('casino.premiumProviders', 'Premium Providers')}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Provider Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providerStats.map((provider) => (
              <Card key={provider.name} className="bg-gray-900 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${provider.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{provider.name}</h3>
                  <p className="text-gray-400">{provider.count} {t('casino.demoGame', 'Demo Game')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">{t('casino.featuredDemoGames', 'Featured Demo Games')}</h2>
          </div>
          
          <DemoGameProvider showFeatured={true} limit={4} />
        </section>

        {/* Provider Tabs */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">{t('casino.providerGames', 'Provider Games')}</h2>
          
          <Tabs value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900">
              <TabsTrigger value="all" className="data-[state=active]:bg-orange-600">
                {t('casino.all', 'All')}
              </TabsTrigger>
              <TabsTrigger value="NetEnt" className="data-[state=active]:bg-blue-600">
                NetEnt
              </TabsTrigger>
              <TabsTrigger value="EGT" className="data-[state=active]:bg-purple-600">
                EGT
              </TabsTrigger>
              <TabsTrigger value="Pragmatic Play" className="data-[state=active]:bg-orange-600">
                Pragmatic Play
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <DemoGameProvider selectedProvider="all" />
            </TabsContent>
            
            <TabsContent value="NetEnt" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{t('casino.aboutNetEnt', 'About NetEnt')}</h3>
                <p className="text-gray-400 text-sm">
                  {t('casino.netEntDescription', 'NetEnt is a world-renowned Swedish game provider known for high-quality slot games and innovative features.')}
                </p>
              </div>
              <DemoGameProvider selectedProvider="NetEnt" />
            </TabsContent>
            
            <TabsContent value="EGT" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{t('casino.aboutEGT', 'About EGT')}</h3>
                <p className="text-gray-400 text-sm">
                  {t('casino.egtDescription', 'Euro Games Technology is a Bulgaria-based company that develops classic and modern slot games.')}
                </p>
              </div>
              <DemoGameProvider selectedProvider="EGT" />
            </TabsContent>
            
            <TabsContent value="Pragmatic Play" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{t('casino.aboutPragmaticPlay', 'About Pragmatic Play')}</h3>
                <p className="text-gray-400 text-sm">
                  {t('casino.pragmaticPlayDescription', 'Pragmatic Play is a leading game developer known for innovative and entertaining slot games. Offers high volatility and big wins.')}
                </p>
              </div>
              <DemoGameProvider selectedProvider="Pragmatic Play" />
            </TabsContent>
          </Tabs>
        </section>

        {/* Info Section */}
        <section className="mt-12">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('casino.aboutDemoGames', 'About Demo Games')}</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('casino.whyPlayDemo', 'Why Play Demo?')}</h3>
                  <ul className="space-y-2 text-sm">
                    {t('casino.demoBenefits', [
                      'Free and requires no registration',
                      'Learn game mechanics',
                      'Gain experience without risk',
                      'Discover bonus features'
                    ]).map((benefit: string, index: number) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('casino.demoVsReal', 'Demo vs Real Difference')}</h3>
                  <ul className="space-y-2 text-sm">
                    {t('casino.demoVsRealPoints', [
                      'Virtual money is used in demo mode',
                      'You cannot win or lose real money',
                      'All features are the same as real version',
                      'RTP rates do not change'
                    ]).map((point: string, index: number) => (
                      <li key={index}>• {point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DemoGames;