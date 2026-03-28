import { createClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';

const supabase = createClient();

export const imageService = {
  async compressAndUpload(file: File, path: string): Promise<string> {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    try {
      // Compress image
      const compressedFile = await imageCompression(file, options);
      
      // Convert to WebP if not already (options.fileType handles this in some versions, but let's be safe)
      const fileName = `${path}-${Date.now()}.webp`;
      
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, compressedFile, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error in compressAndUpload:', error);
      throw error;
    }
  },

  async deleteImage(url: string) {
    try {
      const fileName = url.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('products')
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteImage:', error);
    }
  }
};
