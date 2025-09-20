import React from "react";
import { Crown, Gift, TrendingUp, Users, Diamond, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { useI18n } from "@/hooks/useI18n";

const VIP = () => {
  const { t } = useI18n();
  const tiers = [
    {
      name: 'BRONZE',
      color: 'from-orange-600 to-orange-500',
      icon: '🥉',
      percentage: 10,
      points: 10000,
      textColor: 'text-orange-400'
    },
    {
      name: 'SILVER',
      color: 'from-gray-400 to-gray-300',
      icon: '🥈',
      percentage: 12,
      points: 30000,
      textColor: 'text-gray-400'
    },
    {
      name: 'GOLD',
      color: 'from-yellow-500 to-yellow-400',
      icon: '🥇',
      percentage: 15,
      points: 100000,
      textColor: 'text-yellow-400'
    },
    {
      name: 'PLATINUM',
      color: 'from-blue-500 to-blue-400',
      icon: '💎',
      percentage: 20,
      points: 300000,
      textColor: 'text-blue-400'
    },
    {
      name: 'DIAMOND',
      color: 'from-purple-600 to-purple-500',
      icon: '💜',
      percentage: 25,
      points: '∞',
      textColor: 'text-purple-400'
    }
  ];

  const benefits = [
    {
      icon: Gift,
      title: t('vip.wageringFreeDepositBonus', 'Wagering-Free Deposit Bonus'),
      description: t('vip.wageringFreeDepositBonusDescription', 'This is the bonus amount you can receive on your deposits according to your VIP level. To benefit from this bonus, you need to select the relevant bonus from the bonuses page. Afterwards, the bonus will be automatically added to your account.')
    },
    {
      icon: TrendingUp,
      title: t('vip.levelUpPoints', 'Level Up Points'),
      description: t('vip.levelUpPointsDescription', 'These are the points required to reach the next level. 1 point = 1 euro.')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-10 py-8 px-6">
                <Crown className="w-16 h-16 text-yellow-500 mr-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  {t('vip.programTitle', 'GuduBet VIP Program')}
                </h1>
              </div>
              
              <p className="text-xl text-muted-foreground mb-4">
                {t('vip.programDescription', 'With the GuduBet VIP Program, you can increase your level as you play.')}
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                {t('vip.programBenefits', 'You can have different bonuses and privileges according to each level. Joining is completely free.')}
              </p>
              
              <div className="bg-muted/30 border border-muted rounded-lg p-6 max-w-4xl mx-auto">
                <p className="text-muted-foreground">
                  {t('vip.programDetails', 'As soon as you become a member of GuduBet, you can automatically benefit from the advantages of the <span className="text-orange-400 font-semibold">BRONZE</span> level. To move to the next level, you need to collect 10,000 Points. 1 Point = 1 Euro, and if you play approximately 350,000 TL worth of games in total, you can rise to the <span className="text-gray-400 font-semibold">SILVER</span> level. For Silver level users, 2 Euro game turnover will earn 1 point. For Gold, Platinum, and Diamond level users, 3 Euro game turnover will earn 1 point.')}
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                {t('vip.benefitsTitle', 'GuduBet VIP Program bonuses and privileges are specified below:')}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="bg-card border border-border">
                    <CardHeader>
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-full mr-4">
                          <span className="text-2xl">{index + 1}</span>
                        </div>
                        <benefit.icon className="w-8 h-8 text-yellow-500" />
                      </div>
                      <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* VIP Tiers */}
            <div className="space-y-12">
              {/* Deposit Bonus Tiers */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Gift className="w-8 h-8 mr-3 text-yellow-500" />
                    {t('vip.wageringFreeDepositBonus', 'Wagering-Free Deposit Bonus')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {tiers.map((tier, index) => (
                      <div key={tier.name} className="text-center">
                        <div className={`bg-gradient-to-br ${tier.color} p-6 rounded-lg mb-4`}>
                          <div className="text-4xl mb-2">{tier.icon}</div>
                          <div className="text-white font-bold text-lg mb-2">{tier.name}</div>
                          <div className="text-white text-3xl font-bold">%{tier.percentage}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Level Up Points */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <TrendingUp className="w-8 h-8 mr-3 text-yellow-500" />
                    {t('vip.levelUpPoints', 'Level Up Points')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {tiers.map((tier, index) => (
                      <div key={tier.name} className="text-center">
                        <div className={`bg-gradient-to-br ${tier.color} p-6 rounded-lg mb-4`}>
                          <div className="text-4xl mb-2">{tier.icon}</div>
                          <div className="text-white font-bold text-lg mb-2">{tier.name}</div>
                          <div className="text-white text-2xl font-bold">
                            {typeof tier.points === 'number' ? tier.points.toLocaleString() : tier.points}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Benefits */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t('vip.specialPrivileges', 'Special Privileges')}</h3>
                  <p className="text-muted-foreground">{t('vip.specialPrivilegesDescription', 'Benefit from bonuses and promotions special to your VIP level')}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t('vip.personalSupport', 'Personal Support')}</h3>
                  <p className="text-muted-foreground">{t('vip.personalSupportDescription', 'Special support service for our high-level members')}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t('vip.specialEvents', 'Special Events')}</h3>
                  <p className="text-muted-foreground">{t('vip.specialEventsDescription', 'Special tournaments and events for our VIP members')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VIP;