import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteImage {
  id: string;
  name: string;
  category: string;
  image_url: string;
  created_at: string;
}

export const useSiteImages = () => {
  const query = useQuery({
    queryKey: ['site-images'],
    queryFn: async (): Promise<SiteImage[]> => {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const addImage = async (imageData: Omit<SiteImage, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('site_images')
      .insert(imageData)
      .select()
      .single();

    if (error) throw error;
    query.refetch();
    return data;
  };

  const updateImage = async (id: string, updates: Partial<SiteImage>) => {
    const { data, error } = await supabase
      .from('site_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    query.refetch();
    return data;
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase
      .from('site_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
    query.refetch();
  };

  return {
    images: query.data || [],
    loading: query.isLoading,
    error: query.error,
    addImage,
    updateImage,
    deleteImage,
    loadImages: query.refetch
  };
};

export const useSiteImageByCategory = (category: string) => {
  return useQuery({
    queryKey: ['site-images', category],
    queryFn: async (): Promise<SiteImage | null> => {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // If no image found, return null instead of throwing error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!category
  });
};