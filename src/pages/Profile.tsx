import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Wallet, 
  History, 
  Gift, 
  Bell, 
  Settings,
  Edit,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { useNavigate } from 'react-router-dom';
import { useLossBonus } from '@/hooks/useLossBonus';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  phone_verified: boolean;
}

interface User {
  email: string;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const { toast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  // Get the current session user for loss bonus
  const [sessionUser, setSessionUser] = useState<any>(null);
  const { lossBonusData, claimLossBonus, isClaimingLossBonus } = useLossBonus(sessionUser?.id);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSessionUser(session.user);
      }
    };
    getSession();
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      setUser({
        email: session.user.email!,
        created_at: session.user.created_at
      });

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          country: profile.country,
          city: profile.city,
          address: profile.address,
          postal_code: profile.postal_code
        })
        .eq('user_id', profile.user_id);

      if (error) {
        toast({
          title: "Hata",
          description: "Profil güncellenirken bir hata oluştu.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi."
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Hata",
        description: "Yeni şifre en az 8 karakter olmalıdır.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        toast({
          title: "Hata",
          description: "Şifre güncellenirken bir hata oluştu.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: "Şifreniz güncellendi."
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Profil yükleniyor...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {profile?.first_name || profile?.last_name 
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                  : t('profile.user_profile')
                }
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    {activeTab === 'general' && <><User className="w-4 h-4" /> {t('profile.general_info')}</>}
                    {activeTab === 'security' && <><Shield className="w-4 h-4" /> {t('profile.security')}</>}
                    {activeTab === 'financial' && <><Wallet className="w-4 h-4" /> {t('profile.financial')}</>}
                    {activeTab === 'history' && <><History className="w-4 h-4" /> {t('profile.history')}</>}
                    {activeTab === 'bonuses' && <><Gift className="w-4 h-4" /> {t('profile.bonuses')}</>}
                    {activeTab === 'settings' && <><Settings className="w-4 h-4" /> {t('profile.settings')}</>}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-background border shadow-lg">
                <DropdownMenuItem onClick={() => setActiveTab('general')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  {t('profile.general_info')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('security')} className="cursor-pointer">
                  <Shield className="w-4 h-4 mr-2" />
                  {t('profile.security')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('financial')} className="cursor-pointer">
                  <Wallet className="w-4 h-4 mr-2" />
                  {t('profile.financial')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('history')} className="cursor-pointer">
                  <History className="w-4 h-4 mr-2" />
                  {t('profile.history')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('bonuses')} className="cursor-pointer">
                  <Gift className="w-4 h-4 mr-2" />
                  {t('profile.bonuses')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('profile.settings')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* General Information Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pt-32">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  {t('profile.personal_info')}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? t('profile.saving') : t('profile.save')}
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      {t('profile.edit')}
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('profile.first_name')}</Label>
                    <Input
                      id="firstName"
                      value={profile?.first_name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, first_name: e.target.value} : null)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('profile.last_name')}</Label>
                    <Input
                      id="lastName"
                      value={profile?.last_name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, last_name: e.target.value} : null)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="flex-1"
                    />
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t('profile.email_cannot_change')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('profile.phone_number')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="phone"
                      value={profile?.phone || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                    {profile?.phone_verified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Button variant="outline" size="sm">{t('profile.verify')}</Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">{t('profile.birth_date')}</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={profile?.date_of_birth || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, date_of_birth: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('profile.address_info')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('profile.country')}</Label>
                    <Select 
                      value={profile?.country || ''} 
                      onValueChange={(value) => setProfile(prev => prev ? {...prev, country: value} : null)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={profile?.country ? undefined : t('profile.select_country')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="turkey">{t('profile.country_turkey')}</SelectItem>
                        <SelectItem value="usa">{t('profile.country_usa')}</SelectItem>
                        <SelectItem value="germany">{t('profile.country_germany')}</SelectItem>
                        <SelectItem value="france">{t('profile.country_france')}</SelectItem>
                        <SelectItem value="uk">{t('profile.country_uk')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('profile.city')}</Label>
                    <Input
                      id="city"
                      value={profile?.city || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, city: e.target.value} : null)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t('profile.address')}</Label>
                  <Input
                    id="address"
                    value={profile?.address || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t('profile.postal_code')}</Label>
                  <Input
                    id="postalCode"
                    value={profile?.postal_code || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, postal_code: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('profile.change_password')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('profile.current_password')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.new_password')}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile.confirm_new_password')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button onClick={handlePasswordChange} className="w-full">
                  {t('profile.update_password')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('profile.two_factor_auth')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('profile.two_factor_status')}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.additional_security')}</p>
                  </div>
                  <Badge variant="outline">{t('profile.disabled')}</Badge>
                </div>
                <Button variant="outline" className="mt-4">
                  {t('profile.enable_2fa')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6 mt-32">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    {t('profile.balance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>{t('profile.real_balance')}</span>
                      <span className="font-bold text-lg">₺0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('profile.bonus_balance')}</span>
                      <span className="font-bold text-lg text-green-600">₺0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{t('profile.total')}</span>
                      <span className="font-bold text-xl">₺0.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.quick_actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => navigate('/user/deposit')}
                  >
                    {t('profile.deposit')}
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/user/withdraw')}
                  >
                    {t('profile.withdraw')}
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => navigate('/deposit-withdrawal')}
                  >
                    {t('profile.transaction_history')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  {t('profile.betting_game_history')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('profile.no_betting_history')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonuses Tab */}
          <TabsContent value="bonuses" className="space-y-6">
            {/* Loss Bonus Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  {t('profile.loss_bonus')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lossBonusData?.isEligible ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Gift className="w-8 h-8 text-green-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800">{t('profile.loss_bonus_ready')}</h4>
                          <p className="text-green-600 text-sm">
                            {t('profile.loss_bonus_description').replace('{0}', lossBonusData.totalLoss.toString()).replace('{1}', lossBonusData.bonusAmount.toString())}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => claimLossBonus()}
                      disabled={isClaimingLossBonus}
                      className="w-full"
                    >
                      {isClaimingLossBonus ? t('profile.claiming_bonus') : `${lossBonusData.bonusAmount} ${t('profile.claim_loss_bonus')}`}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">{t('profile.no_loss_bonus')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.loss_bonus_info')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Bonuses Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  {t('profile.active_bonuses')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('profile.no_active_bonuses')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('profile.app_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('profile.language')}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.app_language')}</p>
                  </div>
                  <Select defaultValue="tr">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">{t('profile.turkish')}</SelectItem>
                      <SelectItem value="en">{t('profile.english')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('profile.currency')}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.default_currency')}</p>
                  </div>
                  <Select defaultValue="try">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="try">₺ TRY</SelectItem>
                      <SelectItem value="usd">$ USD</SelectItem>
                      <SelectItem value="eur">€ EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('profile.theme')}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.interface_theme')}</p>
                  </div>
                  <Select defaultValue="system">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('profile.light')}</SelectItem>
                      <SelectItem value="dark">{t('profile.dark')}</SelectItem>
                      <SelectItem value="system">{t('profile.system')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">{t('profile.danger_zone')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  {t('profile.suspend_account')}
                </Button>
                <Button variant="destructive" className="w-full">
                  {t('profile.close_account_permanently')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;