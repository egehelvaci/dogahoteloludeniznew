'use client';

import React, { useState, useRef, useEffect } from 'react';
import { isImageKitUrl, transformVideo } from '../../lib/imagekit';
import { Skeleton } from "./skeleton";
import { Alert, AlertDescription } from "./alert";
import { AlertCircle } from "lucide-react";

interface VideoProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string; // Video poster/thumbnail
}

// Video bileşeni - Tebi.io servisine uygun
export const TebiVideo: React.FC<VideoProps> = ({ 
  src, 
  alt = "Video",
  width, 
  height, 
  className = "", 
  controls = false,
  autoPlay = false,
  loop = false,
  muted = false,
  poster
}) => {
  return (
    <video
      src={src}
      poster={poster}
      width={width}
      height={height}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      className={className}
    >
      <source src={src} type="video/mp4" />
      {alt && <p>{alt}</p>}
    </video>
  );
};

interface ImageKitVideoProps {
  src: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  poster?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ImageKit CDN'den videoları yüklemek için optimize edilmiş video bileşeni
 */
const ImageKitVideo: React.FC<ImageKitVideoProps> = ({
  src,
  width = '100%',
  height = 'auto',
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  playsInline = true,
  poster,
  onLoad,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Video yüklenemedi');
    if (onError) onError();
  };

  // URL'nin geçerli olup olmadığını kontrol et
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // URL kontrol et ve düzelt
  const videoSrc = isValidUrl(src) ? src : '';

  if (!videoSrc) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
      >
        <p className="text-gray-500">Video kaynağı bulunamadı</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
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
      
      <video
        ref={videoRef}
        src={videoSrc}
        width={width}
        height={height}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        poster={poster}
        onLoadedData={handleLoad}
        onError={handleError}
        className={`w-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};

export default ImageKitVideo; 