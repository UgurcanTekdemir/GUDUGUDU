import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BonusFormData } from '@/lib/types/bonus';

interface BonusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  bonus?: any;
  mode: 'create' | 'edit';
}

const BONUS_TYPES = [
  { value: 'FIRST_DEPOSIT', label: 'İlk Yatırım Bonusu' },
  { value: 'RELOAD', label: 'Yeniden Yükle Bonusu' },
  { value: 'CASHBACK', label: 'Kayıp Bonusu' },
  { value: 'FREEBET', label: 'Bedava Bahis' }
];

export const BonusFormModal: React.FC<BonusFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bonus,
  mode
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [validFrom, setValidFrom] = useState<Date>();
  const [validTo, setValidTo] = useState<Date>();
  
  const [formData, setFormData] = useState<BonusFormData>({
    name: '',
    code: '',
    type: 'FIRST_DEPOSIT',
    amount_type: 'percent',
    amount_value: 0,
    max_cap: 0,
    min_deposit: 0,
    rollover_multiplier: 0,
    auto_grant: false,
    requires_code: false,
    max_per_user: 1,
    cooldown_hours: 0,
    is_active: true,
    description: '',
    image_url: ''
  });

  useEffect(() => {
    if (bonus && mode === 'edit') {
      setFormData({
        name: bonus.name || '',
        code: bonus.code || '',
        type: bonus.type || 'FIRST_DEPOSIT',
        amount_type: bonus.amount_type || 'percent',
        amount_value: bonus.amount_value || 0,
        max_cap: bonus.max_cap || 0,
        min_deposit: bonus.min_deposit || 0,
        rollover_multiplier: bonus.rollover_multiplier || 0,
        auto_grant: bonus.auto_grant || false,
        requires_code: bonus.requires_code || false,
        max_per_user: bonus.max_per_user || 1,
        cooldown_hours: bonus.cooldown_hours || 0,
        is_active: bonus.is_active || true,
        description: bonus.description || '',
        image_url: bonus.image_url || ''
      });
      
      if (bonus.valid_from) setValidFrom(new Date(bonus.valid_from));
      if (bonus.valid_to) setValidTo(new Date(bonus.valid_to));
    }
  }, [bonus, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        valid_from: validFrom?.toISOString(),
        valid_to: validTo?.toISOString(),
      };

      if (mode === 'create') {
        const { error } = await supabase
          .from('bonuses_new')
          .insert(submitData);
        
        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: "Bonus oluşturuldu.",
        });
      } else {
        const { error } = await supabase
          .from('bonuses_new')
          .update(submitData)
          .eq('id', bonus.id);
        
        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: "Bonus güncellendi.",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving bonus:', error);
      toast({
        title: "Hata",
        description: "Bonus kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Yeni Bonus' : 'Bonus Düzenle'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Yeni bir bonus oluşturun.' 
              : 'Mevcut bonusu düzenleyin.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bonus Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Hoşgeldin Bonusu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Bonus Kodu</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="HOSGELDIN100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Bonus Türü *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Bonus türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {BONUS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount_type">Miktar Türü *</Label>
              <Select value={formData.amount_type} onValueChange={(value: any) => setFormData({...formData, amount_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Yüzde (%)</SelectItem>
                  <SelectItem value="fixed">Sabit Miktar (₺)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_value">
                {formData.amount_type === 'percent' ? 'Yüzde Değeri' : 'Sabit Miktar'} *
              </Label>
              <Input
                id="amount_value"
                type="number"
                min="0"
                step={formData.amount_type === 'percent' ? '1' : '0.01'}
                value={formData.amount_value}
                onChange={(e) => setFormData({...formData, amount_value: parseFloat(e.target.value) || 0})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_cap">Maksimum Limit (₺)</Label>
              <Input
                id="max_cap"
                type="number"
                min="0"
                step="0.01"
                value={formData.max_cap || ''}
                onChange={(e) => setFormData({...formData, max_cap: parseFloat(e.target.value) || undefined})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_deposit">Minimum Yatırım (₺) *</Label>
              <Input
                id="min_deposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.min_deposit}
                onChange={(e) => setFormData({...formData, min_deposit: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rollover_multiplier">Çevrim Katsayısı *</Label>
              <Input
                id="rollover_multiplier"
                type="number"
                min="0"
                step="0.1"
                value={formData.rollover_multiplier}
                onChange={(e) => setFormData({...formData, rollover_multiplier: parseFloat(e.target.value) || 0})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_per_user">Kullanıcı Başına Limit *</Label>
              <Input
                id="max_per_user"
                type="number"
                min="1"
                value={formData.max_per_user}
                onChange={(e) => setFormData({...formData, max_per_user: parseInt(e.target.value) || 1})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooldown_hours">Bekleme Süresi (Saat)</Label>
            <Input
              id="cooldown_hours"
              type="number"
              min="0"
              value={formData.cooldown_hours}
              onChange={(e) => setFormData({...formData, cooldown_hours: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validFrom ? format(validFrom, "dd/MM/yyyy") : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validFrom}
                    onSelect={setValidFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validTo ? format(validTo, "dd/MM/yyyy") : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validTo}
                    onSelect={setValidTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_grant"
                checked={formData.auto_grant}
                onCheckedChange={(checked) => setFormData({...formData, auto_grant: checked})}
              />
              <Label htmlFor="auto_grant">Otomatik Ver</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requires_code"
                checked={formData.requires_code}
                onCheckedChange={(checked) => setFormData({...formData, requires_code: checked})}
              />
              <Label htmlFor="requires_code">Kod Gerektirir</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Bonus açıklaması..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Bonus Resmi</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: "Hata",
                        description: "Dosya boyutu 5MB'dan büyük olamaz.",
                        variant: "destructive"
                      });
                      e.target.value = ''; // Input'u temizle
                      return;
                    }

                    try {
                      const fileExt = file.name.split('.').pop()?.toLowerCase();
                      const cleanExt = fileExt?.replace(/[^a-z0-9]/g, '') || 'jpg'; // Clean extension
                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${cleanExt}`;
                      const filePath = `bonus-images/${fileName}`;

                      const { data, error } = await supabase.storage
                        .from('bonus-images')
                        .upload(filePath, file);

                      if (error) throw error;

                      const { data: { publicUrl } } = supabase.storage
                        .from('bonus-images')
                        .getPublicUrl(filePath);

                      setFormData({...formData, image_url: publicUrl});
                      
                      // Input'u temizle ki aynı dosya tekrar seçilebilsin
                      e.target.value = '';
                      toast({
                        title: "Başarılı",
                        description: "Resim başarıyla yüklendi.",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Hata",
                        description: error.message || "Resim yüklenirken bir hata oluştu.",
                        variant: "destructive"
                      });
                      e.target.value = ''; // Hata durumunda da input'u temizle
                    }
                  }}
                  className="hidden"
                  id="image_url"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image_url')?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Resim Seç</span>
                </Button>

                {formData.image_url && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({...formData, image_url: ''})}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                    <span>Kaldır</span>
                  </Button>
                )}
              </div>

              {formData.image_url && (
                <div className="mt-4">
                  <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Resim boyutu: 5MB'a kadar
                  </p>
                </div>
              )}

              {!formData.image_url && (
                <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Resim yok</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Oluştur' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};