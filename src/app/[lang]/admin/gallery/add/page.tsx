'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes } from 'react-icons/fa';
import MediaUploader from '../../../../../components/ui/MediaUploader';

interface GalleryAddProps {
  params: {
    lang: string;
  };
}

export default function GalleryAdd({ params }: GalleryAddProps) {
  const router = useRouter();
  const { lang } = params;
  
  // State'ler
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Medya yükleme
  const handleMediaUpload = (result: { url: string; fileId: string; fileType: string }) => {
    if (result.fileType === 'video') {
      setVideoUrl(result.url);
      setType('video');
    } else {
      setImage(result.url);
      setType('image');
    }
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Temel doğrulama
    if (!image && !videoUrl) {
      setError(lang === 'tr' 
        ? 'Lütfen bir görsel veya video yükleyin.' 
        : 'Please upload an image or video.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: type === 'image' ? image : '',
          video_url: type === 'video' ? videoUrl : '',
          type: type
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Galeri öğesi eklenirken bir hata oluştu.');
      }
      
      setSuccess(lang === 'tr' 
        ? 'Galeri öğesi başarıyla eklendi!' 
        : 'Gallery item added successfully!');
        
      // Kısa bir süre sonra ana galeri sayfasına yönlendir
      setTimeout(() => {
        router.push(`/${lang}/admin/gallery`);
      }, 1500);

    } catch (err: unknown) {
      console.error('Galeri öğesi eklenirken hata:', err);
      let errorMessage = 'Galeri öğesi eklenirken bir hata oluştu.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // İptal
  const handleCancel = () => {
    router.push(`/${lang}/admin/gallery`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {lang === 'tr' ? 'Galeri Öğesi Ekle' : 'Add Gallery Item'}
          </h1>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medya Yükleme */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              {lang === 'tr' ? 'Medya Yükle' : 'Upload Media'} *
            </label>
            <div className="mt-1">
              <MediaUploader
                onUpload={handleMediaUpload}
                initialUrl={type === 'image' ? image : videoUrl}
                type="any"
                folder="gallery"
                label={lang === 'tr' ? 'Görsel veya Video Yükle' : 'Upload Image or Video'}
                maxSizeMB={50}
              />
              <p className="mt-2 text-sm text-gray-500">
                {lang === 'tr' 
                  ? 'Görsel veya video yükleyebilirsiniz. Maksimum boyut: 50MB' 
                  : 'You can upload an image or video. Maximum size: 50MB'}
              </p>
            </div>
          </div>
          
          {/* Butonlar */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              {lang === 'tr' ? 'İptal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">{lang === 'tr' ? 'Kaydediliyor...' : 'Saving...'}</span>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {lang === 'tr' ? 'Kaydet' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
    </div>
  );
}
