import { useCreateWithdrawal, useMyWithdrawals } from '../../hooks/useWithdrawals';
import { useState } from 'react';
import { toast } from 'sonner';
import type { WithdrawalMethod } from '../../lib/types.withdrawals';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from '@/hooks/useI18n';

export default function RequestWithdrawal() {
  const { t } = useI18n();
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<WithdrawalMethod>('bank');
  // fields
  const [iban, setIban] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [paparaId, setPaparaId] = useState('');
  const [phone, setPhone] = useState('');
  const [asset, setAsset] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [address, setAddress] = useState('');
  const [tag, setTag] = useState('');
  const [detailedError, setDetailedError] = useState<any>(null);

  const createM = useCreateWithdrawal();
  const list = useMyWithdrawals();
  const navigate = useNavigate();

    // Get user balance and profile info from profiles table
    const { data: userProfile } = useQuery({
      queryKey: ["user-profile"],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error(t('errors.authRequired', 'Authentication required'));

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("balance, bonus_balance, first_name, last_name")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return profileData;
      }
    });

  const submit = () => {
    // Validasyonlar
    if (amount <= 0) {
      toast.error(t('withdrawal.amount_must_be_positive'));
      return;
    }

    // Bakiye kontrolü
    if (!userProfile?.balance || amount > userProfile.balance) {
      toast.error(t('withdrawal.insufficient_balance'));
      return;
    }

    // IBAN kontrolleri (bank method için)
    if (method === 'bank') {
      if (!iban || iban.length < 26) {
        toast.error(t('withdrawal.invalid_iban_format'));
        return;
      }

      if (!iban.startsWith('TR')) {
        toast.error(t('withdrawal.iban_must_start_with_tr'));
        return;
      }

      if (!accountHolderName.trim()) {
        toast.error(t('withdrawal.account_holder_name_required'));
        return;
      }

      // İsim soyisim kontrolü
      const userFullName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim().toLowerCase();
      const enteredName = accountHolderName.trim().toLowerCase();
      
      if (userFullName !== enteredName) {
        toast.error(t('withdrawal.account_holder_name_mismatch', `Hesap sahibinin adı soyadı, kayıtlı bilgilerinizle eşleşmiyor! Kayıtlı adınız: ${userFullName}`));
        return;
      }
    }

    // Papara kontrolleri
    if (method === 'papara') {
      if (!paparaId && !phone) {
        toast.error(t('withdrawal.papara_id_or_phone_required'));
        return;
      }
    }

    // Crypto kontrolleri
    if (method === 'crypto') {
      if (!address.trim()) {
        toast.error(t('withdrawal.wallet_address_required'));
        return;
      }
    }

    createM.mutate({ 
      amount, 
      method,
      payout_details: method === 'bank' ? {
        iban: iban,
        account_holder_name: accountHolderName
      } : method === 'papara' ? {
        papara_id: paparaId,
        phone: phone
      } : method === 'crypto' ? {
        asset: asset,
        network: network,
        address: address,
        tag: tag
      } : {},
      // Also send individual fields for backward compatibility
      iban, 
      papara_id: paparaId, 
      phone, 
      asset, 
      network, 
      address, 
      tag 
    }, {
      onSuccess: (data: any) => {
        toast.success(t('withdrawal.request_sent_successfully'));
        setDetailedError(null);
        setAmount(0);
        setIban('');
        setAccountHolderName('');
        setPaparaId('');
        setPhone('');
        setAddress('');
        setTag('');

        // Show additional KYC info if available
        if (data?.kyc_info && !data.kyc_info.allowed) {
          toast.info(t('withdrawal.kyc_info', `KYC Bilgi: ${data.kyc_info.reason}`), {
            description: t('withdrawal.kyc_limits', `Günlük limit: ₺${data.kyc_info.daily_remaining}/${data.kyc_info.daily_limit} | Aylık limit: ₺${data.kyc_info.monthly_remaining}/${data.kyc_info.monthly_limit}`),
            duration: 8000
          });
        }
      },
      onError: (error: any) => {
        console.error('Withdrawal request error:', error);
        
        // Parse the error response more carefully
        let errorData: any = {};
        let primaryMessage = t('withdrawal.request_failed');
        
        try {
          // Handle different error formats
          if (error?.context?.body) {
            // Edge function error with context
            errorData = error.context.body;
          } else if (error?.message) {
            try {
              // Try to parse JSON from error message
              if (error.message.includes('{')) {
                const jsonStart = error.message.indexOf('{');
                const jsonStr = error.message.substring(jsonStart);
                errorData = JSON.parse(jsonStr);
              } else {
                errorData = { error: error.message };
              }
            } catch {
              errorData = { error: error.message };
            }
          } else if (typeof error === 'string') {
            errorData = { error: error };
          } else {
            errorData = error || { error: t('errors.unknownError', 'Unknown error occurred') };
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
            errorData = { error: t('withdrawal.server_error_response_parse_failed') };
        }

        // Set detailed error for Alert component
        setDetailedError(errorData);
        
        // Determine primary message based on error content
        if (errorData.error) {
          if (errorData.error.includes('Geçersiz miktar')) {
            primaryMessage = errorData.error;
          } else if (errorData.error.includes('Yetersiz bakiye')) {
            primaryMessage = t('withdrawal.insufficient_balance_error', `Yetersiz bakiye! ${errorData.current_balance ? `Mevcut: ₺${errorData.current_balance}` : ''}`);
          } else if (errorData.error.includes('KYC') || errorData.requires_kyc) {
            primaryMessage = t('withdrawal.kyc_verification_required');
          } else if (errorData.error.includes('limit aşım') || errorData.error.includes('limit exceeded')) {
            primaryMessage = t('withdrawal.limit_exceeded_manual_review');
          } else if (errorData.error.includes('Çekim yöntemi')) {
            primaryMessage = t('withdrawal.check_payment_details');
          } else if (errorData.error.includes('Profil hatası')) {
            primaryMessage = t('withdrawal.account_info_issue');
          } else {
            primaryMessage = errorData.error;
          }
        }
        
        toast.error(primaryMessage, {
          duration: 8000,
          description: errorData.details ? t('withdrawal.check_detailed_error_message') : undefined
        });
      }
    });
  };

  // Fee calculations removed - no more withdrawal fees
  const calculateNet = (amount: number) => amount;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: t('withdrawal.status.pending'), icon: Clock },
      approved: { variant: "default" as const, text: t('withdrawal.status.approved'), icon: CheckCircle },
      rejected: { variant: "destructive" as const, text: t('withdrawal.status.rejected'), icon: XCircle },
      processing: { variant: "outline" as const, text: t('withdrawal.status.processing'), icon: Clock },
      completed: { variant: "default" as const, text: t('withdrawal.status.completed'), icon: CheckCircle },
      paid: { variant: "default" as const, text: t('withdrawal.status.paid'), icon: CheckCircle },
      failed: { variant: "destructive" as const, text: t('withdrawal.status.failed'), icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const hasPendingWithdrawal = list.data?.some(w => w.status === "pending");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{t('withdrawal.title', 'Para Çekme')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{t('withdrawal.create_request', 'Çekim Talebi Oluştur')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Detailed Error Display */}
            {detailedError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('withdrawal.request_error')}</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <div className="font-medium">
                    {detailedError.error || detailedError.message || t('withdrawal.unknown_error')}
                  </div>
                  
                  {detailedError.current_balance !== undefined && (
                    <div className="text-sm bg-destructive/10 p-2 rounded">
                      <strong>{t('withdrawal.balance_info')}:</strong>
                      <br />• {t('withdrawal.current_balance')}: ₺{detailedError.current_balance?.toLocaleString('tr-TR')}
                      <br />• {t('withdrawal.requested_amount')}: ₺{detailedError.requested_amount?.toLocaleString('tr-TR')}
                    </div>
                  )}
                  
                  {detailedError.kyc_info && (
                    <div className="text-sm bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                      <strong>{t('withdrawal.kyc_limit_info')}:</strong>
                      <br />• {t('withdrawal.reason')}: {detailedError.kyc_info.reason}
                      <br />• {t('withdrawal.daily_remaining')}: ₺{detailedError.kyc_info.daily_remaining?.toLocaleString('tr-TR')} / ₺{detailedError.kyc_info.daily_limit?.toLocaleString('tr-TR')}
                      <br />• {t('withdrawal.monthly_remaining')}: ₺{detailedError.kyc_info.monthly_remaining?.toLocaleString('tr-TR')} / ₺{detailedError.kyc_info.monthly_limit?.toLocaleString('tr-TR')}
                    </div>
                  )}
                  
                  {detailedError.requires_kyc && (
                    <div className="text-sm bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                      <strong>⚠️ {t('withdrawal.kyc_verification_required_title')}:</strong>
                      <br />{t('withdrawal.upload_id_documents')}
                    </div>
                  )}
                  
                  {detailedError.details && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer">{t('withdrawal.technical_details')}</summary>
                      <pre className="mt-1 whitespace-pre-wrap bg-muted p-2 rounded">
                        {JSON.stringify(detailedError.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    💡 {t('withdrawal.contact_live_support')}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {userProfile && (
              <div className="p-4 bg-muted rounded-lg">
                 <p className="text-sm text-muted-foreground">{t('withdrawal.current_balance')}</p>
                <p className="text-2xl font-bold">₺{userProfile.balance?.toLocaleString("tr-TR") || 0}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="amount">{t('withdrawal.amount_try', 'Miktar (TRY)')}</Label>
                <Input
                  id="amount"
                  type="number" 
                  min="10"
                  max={userProfile?.balance || 0}
                  value={amount || ''} 
                  onChange={(e)=>setAmount(parseFloat(e.target.value) || 0)} 
                  placeholder="0.00"
                />
            </div>
            
            <div>
              <Label htmlFor="method">{t('withdrawal.method', 'Çekim Yöntemi')}</Label>
              <Select value={method} onValueChange={(value: WithdrawalMethod)=>setMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">{t('withdrawal.method.bank_transfer')}</SelectItem>
                  <SelectItem value="papara">{t('withdrawal.method.papara')}</SelectItem>
                  <SelectItem value="crypto">{t('withdrawal.method.crypto')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === 'bank' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="iban">{t('withdrawal.iban_format')}</Label>
                  <Input 
                    id="iban"
                    placeholder="TR000000000000000000000000" 
                    maxLength={26}
                    value={iban} 
                    onChange={(e)=>setIban(e.target.value.toUpperCase())} 
                  />
                </div>
                <div>
                  <Label htmlFor="accountHolder">{t('withdrawal.account_holder_name')}</Label>
                  <Input 
                    id="accountHolder"
                    placeholder="Ad Soyad" 
                    value={accountHolderName} 
                    onChange={(e)=>setAccountHolderName(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ {t('withdrawal.account_holder_warning')}
                    <br />
                    📝 {t('withdrawal.registered_name')}: <span className="font-medium text-primary">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </span>
                    <br />
                    🏦 {t('withdrawal.iban_format_info')}
                  </p>
                </div>
              </div>
            )}

            {method === 'papara' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="papara_id">{t('withdrawal.papara_id')}</Label>
                  <Input 
                    id="papara_id"
                    placeholder="1234567890" 
                    value={paparaId} 
                    onChange={(e)=>setPaparaId(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-muted-foreground">{t('withdrawal.or_phone')}</Label>
                  <Input 
                    id="phone"
                    placeholder="+905xxxxxxxxx" 
                    value={phone} 
                    onChange={(e)=>setPhone(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {method === 'crypto' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="asset">{t('withdrawal.crypto_currency')}</Label>
                  <Select value={asset} onValueChange={setAsset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="network">{t('withdrawal.network')}</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRC20">TRC20</SelectItem>
                      <SelectItem value="BEP20">BEP20</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="SOL">SOL</SelectItem>
                      <SelectItem value="MATIC">MATIC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">{t('withdrawal.wallet_address')}</Label>
                  <Input 
                    id="address"
                    placeholder="0x… / T… / bc1…" 
                    value={address} 
                    onChange={(e)=>setAddress(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="tag" className="text-muted-foreground">{t('withdrawal.memo_tag_optional')}</Label>
                  <Input 
                    id="tag"
                    value={tag} 
                    onChange={(e)=>setTag(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {amount > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>{t('withdrawal.withdrawal_amount')}:</span>
                  <span className="font-medium">₺{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-green-600">
                  <span>{t('withdrawal.withdrawn_amount')}:</span>
                  <span>₺{amount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-green-600 text-center mt-2">
                  ✨ {t('withdrawal.no_fees')}
                </p>
              </div>
            )}

            <Button 
              onClick={submit} 
              disabled={createM.isPending || amount <= 0 || hasPendingWithdrawal}
              className="w-full"
            >
              {createM.isPending ? t('withdrawal.processing') : t('withdrawal.send_request')}
            </Button>

            {hasPendingWithdrawal && (
              <p className="text-sm text-amber-600 text-center">
                {t('withdrawal.pending_request_exists')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>{t('withdrawal.history', 'Çekim Geçmişim')}</CardTitle>
          </CardHeader>
          <CardContent>
            {list.isLoading ? (
              <p>{t('withdrawal.loading')}</p>
            ) : (list.data ?? []).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t('withdrawal.no_withdrawals_yet')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('withdrawal.table.amount')}</TableHead>
                      <TableHead>{t('withdrawal.table.method')}</TableHead>
                      <TableHead>{t('withdrawal.table.status')}</TableHead>
                      <TableHead>{t('withdrawal.table.date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(list.data ?? []).map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">₺{w.amount} {w.currency}</TableCell>
                        <TableCell className="capitalize">{w.method}</TableCell>
                        <TableCell>
                          {getStatusBadge(w.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(w.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}