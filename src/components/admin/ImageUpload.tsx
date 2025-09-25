import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Resim",
  accept = "image/*",
  maxSize = 5
}) => {
  console.log('ImageUpload component rendered with value:', value);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Hata",
        description: `Dosya boyutu ${maxSize}MB'dan büyük olamaz.`,
        variant: "destructive"
      });
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Sadece resim dosyaları yüklenebilir.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Dosya adını benzersiz yap
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `bonus-images/${fileName}`;

      // Supabase Storage'a yükle
      const { data, error } = await supabase.storage
        .from('bonus-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Public URL'i al
      const { data: { publicUrl } } = supabase.storage
        .from('bonus-images')
        .getPublicUrl(filePath);

      // Preview'ı güncelle
      setPreview(publicUrl);
      onChange(publicUrl);

      toast({
        title: "Başarılı",
        description: "Resim başarıyla yüklendi.",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Hata",
        description: error.message || "Resim yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">{label}</Label>
      
      <div className="flex items-center space-x-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleClickUpload}
          disabled={uploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'Yükleniyor...' : 'Resim Seç'}</span>
        </Button>

        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            <span>Kaldır</span>
          </Button>
        )}
      </div>

      {preview && (
        <div className="mt-4">
          <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Resim boyutu: {maxSize}MB'a kadar
          </p>
        </div>
      )}

      {!preview && (
        <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Resim yok</p>
          </div>
        </div>
      )}
    </div>
  );
};
