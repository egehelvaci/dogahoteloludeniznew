'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageKitImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  onClick?: () => void;
}

/**
 * ImageKit CDN'den resimleri yüklemek için optimize edilmiş görsel bileşeni
 */
const ImageKitImage: React.FC<ImageKitImageProps> = ({
  src,
  alt,
  width = 1000,
  height = 600,
  className = '',
  priority = false,
  quality = 80,
  objectFit = 'cover',
  onClick
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setError(null);
  }, [src]);

  const handleError = () => {
    setError('Görsel yüklenemedi');
    setIsLoading(false);
    // Eğer görsel URL'si ImageKit ise ve hata alındıysa, orijinal URL'ye dönüş yap
    if (src.includes('imagekit.io') || src.includes('ik.imagekit.io')) {
      // CDN hatası durumunda placeholder göster
      setImgSrc('/images/placeholder.jpg');
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // ImageKit URL'si değilse doğrudan kullan
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // URL'nin geçerli olup olmadığını kontrol et
  const finalSrc = isValidUrl(imgSrc) ? imgSrc : '/images/placeholder.jpg';

  return (
    <div className={`relative ${className}`} style={{ height: 'auto' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        quality={quality}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      />
    </div>
  );
};

export default ImageKitImage; 