"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { imageService } from "@/lib/services/imageService";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  defaultImage?: string | null;
  path: string;
}

export function ImageUpload({ onImageUploaded, defaultImage, path }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Create local preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      const publicUrl = await imageService.compressAndUpload(file, path);
      onImageUploaded(publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("فشل تحميل الصورة");
      setPreview(defaultImage || null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div 
          className="relative w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors"
        >
          {preview ? (
            <>
              <img src={preview} alt="Product" className="w-full h-full object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-white/20" />
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-bold text-white/50 mb-2">صورة المنتج</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
              disabled={uploading}
            >
              <Upload className="w-4 h-4 ml-2" />
              {preview ? "تغيير الصورة" : "رفع صورة"}
            </Button>
          </div>
          <p className="text-[10px] text-white/30 mt-2">WebP, Max 1024x1024, Auto-compressed</p>
        </div>
      </div>
    </div>
  );
}
