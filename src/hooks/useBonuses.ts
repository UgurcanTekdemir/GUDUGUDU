import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Bonus, UserBonus } from "@/lib/types/bonus";

export function useAdminBonuses() {
  return useQuery({
    queryKey: ["admin","bonuses"],
    queryFn: async (): Promise<Bonus[]> => {
      console.log('📊 Admin bonusları yükleniyor...');
      const { data, error } = await supabase
        .from("bonuses_new")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('❌ Admin bonusları yükleme hatası:', error);
        throw error;
      }
      
      console.log('✅ Admin bonusları yüklendi:', data?.length || 0, 'adet');
      return data as Bonus[];
    }
  });
}

// Alias for compatibility
export const useBonuses = useAdminBonuses;

export function useCreateBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any): Promise<Bonus> => {
      // Eğer kod varsa benzersizlik kontrolü yap
      if (payload.code) {
        const { data: existing } = await supabase
          .from("bonuses_new")
          .select("id")
          .eq("code", payload.code)
          .single();
        
        if (existing) {
          throw new Error(`Bu kod zaten kullanılıyor: ${payload.code}`);
        }
      }
      
      const { data, error } = await supabase.from("bonuses_new").insert(payload).select("*").single();
      if (error) throw error;
      return data as Bonus;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin","bonuses"] }); }
  });
}

export function useUpdateBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: any): Promise<Bonus> => {
      const { data, error } = await supabase.from("bonuses_new").update(patch).eq("id", id).select("*").single();
      if (error) throw error;
      return data as Bonus;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin","bonuses"] }); }
  });
}

export function useDeleteBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🗑️ Bonus silme işlemi başlatılıyor:', id);
      
      // Önce mevcut kullanıcının admin olup olmadığını kontrol et
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Kullanıcı doğrulanamadı:', authError);
        throw new Error('Kullanıcı doğrulanamadı');
      }
      
      console.log('👤 Mevcut kullanıcı:', user.id);
      
      // Kullanıcının admin olup olmadığını kontrol et
      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("id, role_type, is_active")
        .eq("id", user.id)
        .eq("is_active", true)
        .single();
      
      console.log('🔐 Admin kontrolü:', { admin, adminError });
      
      if (adminError) {
        if (adminError.code === 'PGRST116') {
          console.error('❌ Admin kaydı bulunamadı:', user.id);
          throw new Error('Bu işlem için admin yetkisi gereklidir');
        } else {
          console.error('❌ Admin kontrol hatası:', adminError);
          throw new Error('Admin kontrolü yapılamadı');
        }
      }
      
      if (!admin || !admin.is_active) {
        console.error('❌ Admin kaydı aktif değil:', admin);
        throw new Error('Admin hesabı aktif değil');
      }
      
      console.log('✅ Admin yetkisi onaylandı:', admin.role_type);
      
      // Önce bonusun var olup olmadığını kontrol et
      const { data: existingBonus, error: checkError } = await supabase
        .from("bonuses_new")
        .select("*")
        .eq("id", id)
        .single();
      
      console.log('🔍 Mevcut bonus kontrolü:', { existingBonus, checkError });
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Bonus kontrol hatası:', checkError);
        throw checkError;
      }
      
      if (!existingBonus) {
        console.warn('⚠️ Bonus bulunamadı, zaten silinmiş olabilir:', id);
        return; // Bonus zaten yok, başarılı say
      }
      
      console.log('✅ Bonus bulundu, silme işlemi başlatılıyor:', existingBonus.name);
      
      const { data, error } = await supabase
        .from("bonuses_new")
        .delete()
        .eq("id", id)
        .select(); // Silinen kayıtları döndür
      
      console.log('🗑️ Silme sonucu:', { data, error });
      
      if (error) {
        console.error('❌ Bonus silme hatası:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Silme işlemi hiçbir kayıt etkilemedi:', id);
        throw new Error('Bonus silinemedi - kayıt bulunamadı');
      }
      
      console.log('✅ Bonus başarıyla silindi:', data[0].name);
    },
    onSuccess: (data, id) => { 
      console.log('🎉 Bonus silme başarılı, cache invalidate ediliyor:', id);
      
      // Tüm bonus ile ilgili query'leri invalidate et
      qc.invalidateQueries({ queryKey: ["admin","bonuses"] });
      qc.invalidateQueries({ queryKey: ["bonuses", "available"] });
      qc.invalidateQueries({ queryKey: ["bonuses"] });
      qc.invalidateQueries({ queryKey: ["promotions", "combined"] });
      
      console.log('🔄 Cache invalidate tamamlandı');
    },
    onError: (error, id) => {
      console.error('💥 Bonus silme hatası:', { error, id });
    }
  });
}

export function useMyBonuses(status?: UserBonus["status"]) {
  return useQuery({
    queryKey: ["me","bonuses", status],
    queryFn: async (): Promise<UserBonus[]> => {
      let q = supabase.from("user_bonus_tracking").select("*").order("created_at", { ascending: false });
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return data as UserBonus[];
    }
  });
}

// Aliases for compatibility
export const useUserBonuses = (userId?: string) => useMyBonuses();
export const useAvailableBonuses = () => {
  return useQuery({
    queryKey: ["bonuses", "available"],
    queryFn: async (): Promise<Bonus[]> => {
      console.log('🎁 Mevcut bonuslar yükleniyor...');
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("bonuses_new")
        .select("*")
        .eq("is_active", true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_to.is.null,valid_to.gte.${now}`)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('❌ Mevcut bonuslar yükleme hatası:', error);
        throw error;
      }
      
      console.log('✅ Mevcut bonuslar yüklendi:', data?.length || 0, 'adet');
      return data as Bonus[];
    }
  });
};

// Promotions sayfası için özel hook - Sadece admin panelden oluşturulan bonusları göster
export const usePromotionsData = () => {
  return useQuery({
    queryKey: ["promotions", "combined"],
    queryFn: async () => {
      console.log('🎯 Admin panelden oluşturulan bonuslar yükleniyor...');
      
      // Sadece bonuses_new tablosundan veri çek
      const bonusesResult = await supabase
        .from('bonuses_new')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (bonusesResult.error) {
        console.error('❌ Bonuses yükleme hatası:', bonusesResult.error);
        throw bonusesResult.error;
      }

      const bonuses = bonusesResult.data || [];

      console.log('🎁 Admin panelden oluşturulan bonuslar:', bonuses.length, 'adet');

      // Transform bonuses to match promotion structure
      const transformedBonuses = bonuses.map(bonus => {
        const category = bonus.name.toLowerCase().includes('vip') ? 'vip' :
                        bonus.type.toLowerCase().includes('first') ? 'welcome' : 
                        bonus.type.toLowerCase().includes('reload') ? 'deposit' :
                        bonus.type.toLowerCase().includes('cashback') ? 'cashback' :
                        bonus.type.toLowerCase().includes('freebet') ? 'freebet' : 'special';
        
        return {
          id: bonus.id,
          title: bonus.name,
          description: bonus.description || `${bonus.type} - ${bonus.amount_type === 'percent' ? `%${bonus.amount_value}` : `₺${bonus.amount_value}`} bonus`,
          detailed_description: bonus.description || '',
          image_url: bonus.image_url || '', // Use bonus image if available
          category,
          bonus_amount: bonus.amount_type === 'fixed' ? bonus.amount_value : null,
          bonus_percentage: bonus.amount_type === 'percent' ? bonus.amount_value : null,
          min_deposit: bonus.min_deposit,
          max_bonus: bonus.max_cap,
          wagering_requirement: bonus.rollover_multiplier,
          promo_code: bonus.code,
          terms_conditions: `Wagering requirement: ${bonus.rollover_multiplier}x. Min. deposit: ₺${bonus.min_deposit}. ${bonus.max_cap ? `Max bonus: ₺${bonus.max_cap}` : ''}`,
          start_date: bonus.valid_from || bonus.created_at,
          end_date: bonus.valid_to || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
          max_participants: null,
          current_participants: 0,
          source: 'bonus' // Mark as coming from bonuses_new table
        };
      });

      // Sadece admin panelden oluşturulan bonusları döndür
      console.log('✅ Admin panelden oluşturulan bonuslar:', transformedBonuses.length, 'adet');
      return transformedBonuses;
    }
  });
};

export const useBonusProgress = (userBonusId: string) => {
  return useQuery({
    queryKey: ["bonus-progress", userBonusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_bonus_tracking")
        .select("*")
        .eq("id", userBonusId)
        .single();
      if (error) throw error;
      return {
        ...data,
        progress_percentage: data.remaining_rollover > 0 
          ? (data.progress / (data.progress + data.remaining_rollover)) * 100 
          : 100,
        recent_events: []
      };
    },
    enabled: !!userBonusId
  });
};

export const useBonusEvents = (userId?: string, userBonusId?: string) => {
  return useQuery({
    queryKey: ["bonus-events", userId, userBonusId],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from("bonus_events")
        .select("*")
        .eq("user_id", userId);
      
      if (userBonusId) {
        query = query.eq("user_bonus_id", userBonusId);
      }
      
      const { data, error } = await query
        .order("occurred_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
};

export function useClaimBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bonus_id: string; deposit_amount?: number; code?: string }) => {
      console.log('🚀 useClaimBonus başlatılıyor:', params);
      
      // Kullanıcı ID'sini al
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ Kullanıcı doğrulanamadı:', userError);
        throw new Error('Kullanıcı doğrulanamadı');
      }
      console.log('✅ Kullanıcı doğrulandı:', user.id);

      // profiles tablosundan user bilgisini al (users yerine profiles kullan)
      const { data: userData, error: userDataError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id) // auth user id ile profile id aynı
        .single();
        
      if (userDataError || !userData) {
        console.error('❌ Kullanıcı profili bulunamadı:', userDataError);
        throw new Error('Kullanıcı profili bulunamadı');
      }
      console.log('✅ Kullanıcı profili bulundu:', userData.id);

      // Bonus talebi oluştur
      const bonusTypeMapping: Record<string, string> = {
        'FIRST_DEPOSIT': 'welcome',
        'RELOAD': 'deposit', 
        'CASHBACK': 'cashback',
        'FREEBET': 'freebet'
      };

      // Bonus bilgilerini al
      const { data: bonus, error: bonusError } = await supabase
        .from('bonuses_new')
        .select('type')
        .eq('id', params.bonus_id)
        .single();
      
      if (bonusError) {
        console.error('❌ Bonus bilgisi alınamadı:', bonusError);
        throw bonusError;
      }
      console.log('✅ Bonus bilgisi alındı:', bonus);

      const bonusType = bonusTypeMapping[bonus.type] || 'deposit';

      // Bonus talebi oluştur
      const requestData = {
        user_id: userData.id, // profiles tablosundan alınan ID
        bonus_type: bonusType as any,
        requested_amount: params.deposit_amount,
        deposit_amount: params.deposit_amount,
        metadata: {
          bonus_id: params.bonus_id,
          code: params.code
        }
      };

      console.log('📝 Bonus talebi oluşturuluyor:', requestData);

      const { data, error } = await supabase
        .from('bonus_requests')
        .insert(requestData)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Bonus talebi oluşturulamadı:', error);
        throw error;
      }
      
      console.log('✅ Bonus talebi oluşturuldu:', data);
      return { ok: true, request_id: data.id, status: 'pending' };
    },
    onSuccess: (data) => {
      console.log('🎉 Bonus talebi başarılı:', data);
      qc.invalidateQueries({ queryKey: ["me","bonuses"] });
      qc.invalidateQueries({ queryKey: ["my_bonus_requests"] });
      qc.invalidateQueries({ queryKey: ["admin_bonus_requests"] });
    },
    onError: (error) => {
      console.error('💥 Bonus talebi hatası:', error);
    }
  });
}