'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface VideoThumbGeneratorProps {
  videoUrl: string;
  videoId: string;
  onThumbnailGenerated?: (thumbnailUrl: string, id: string) => void;
  file?: File; // Opsiyonel dosya parametresi ekledim
}

// Video URL'lerini düzeltmek için yardımcı fonksiyon
export const fixVideoUrl = (url: string): string => {
  if (!url) return '';
  
  let fixedUrl = url.trim();
  
  // URL'de boşlukları encode et
  fixedUrl = fixedUrl.replace(/ /g, '%20');
  
  // Tebi.io URL'leri için özel kontroller
  if (fixedUrl.includes('tebi.io')) {
    console.log('Tebi.io URL algılandı:', fixedUrl);
    
    // HTTPS kontrolü
    if (!fixedUrl.startsWith('https://') && !fixedUrl.startsWith('http://')) {
      fixedUrl = 'https://' + fixedUrl;
    }
    
    // .mp4 uzantısı ekle eğer yoksa
    if (!fixedUrl.toLowerCase().endsWith('.mp4')) {
      fixedUrl += '.mp4';
      console.log('URL\'ye .mp4 uzantısı eklendi:', fixedUrl);
    }
    
    // Tebi.io URL'lerinde önbelleğe almayı önlemek için timestamp ekle
    const hasQuery = fixedUrl.includes('?');
    fixedUrl += `${hasQuery ? '&' : '?'}t=${Date.now()}`;
    console.log('Önbelleğe almayı engellemek için timestamp eklendi:', fixedUrl);
  }
  
  // Herhangi bir URL için önbellek önleme
  if (!fixedUrl.includes('t=')) {
    const hasQuery = fixedUrl.includes('?');
    fixedUrl += `${hasQuery ? '&' : '?'}t=${Date.now()}`;
  }
  
  return fixedUrl;
};

// Yedek thumbnail oluşturma
export const fallbackThumbnail = (videoId: string): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Canvas oluşturulamadı');
      return '';
    }
    
    // Gradient arkaplan
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Oynat butonu
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fill();
    
    // Oynat simgesi
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 15, canvas.height / 2 - 20);
    ctx.lineTo(canvas.width / 2 - 15, canvas.height / 2 + 20);
    ctx.lineTo(canvas.width / 2 + 20, canvas.height / 2);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Kimlik gösterimi
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`Video: ${videoId}`, 20, canvas.height - 20);
    
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (error) {
    console.error('Yedek thumbnail oluşturma hatası:', error);
    return '';
  }
};

// Video önizleme oluşturma fonksiyonu
export const generateVideoThumbnail = async (videoSource: string, videoId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Video URL'yi düzelt (boşluklar ve uzantılar için)
      const fixedUrl = fixVideoUrl(videoSource);
      console.log(`Düzeltilmiş video URL'si: ${fixedUrl}`);
      
      const video = document.createElement('video');
      video.style.display = 'none';
      
      // Timeout kontrolü
      const timeoutId = setTimeout(() => {
        console.error(`Video yükleme zaman aşımı: ${videoId}`);
        video.remove();
        const fallback = fallbackThumbnail(videoId);
        if (fallback) {
          resolve(fallback);
        } else {
          reject(new Error('Video yükleme zaman aşımı ve yedek oluşturulamadı'));
        }
      }, 10000);
      
      // Crossorigin ayarları
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.autoplay = false;
      
      // Hata durumunda
      video.onerror = (e) => {
        clearTimeout(timeoutId);
        console.error(`Video yükleme hatası: ${videoId}`, e);
        video.remove();
        const fallback = fallbackThumbnail(videoId);
        if (fallback) {
          resolve(fallback);
        } else {
          reject(new Error('Video yüklenemedi ve yedek oluşturulamadı'));
        }
      };
      
      // Video yüklendiğinde
      video.onloadedmetadata = async () => {
        try {
          // Videonun ortasındaki kareyi yakala
          video.currentTime = Math.min(video.duration / 2, 3); // Maksimum 3 saniye
        } catch (error) {
          clearTimeout(timeoutId);
          console.error(`Metadata işleme hatası: ${videoId}`, error);
          video.remove();
          resolve(fallbackThumbnail(videoId));
        }
      };
      
      // Seek işlemi tamamlandığında
      video.onseeked = async () => {
        try {
          // Canvas oluştur ve resmi çiz
          const canvas = document.createElement('canvas');
          canvas.width = 640; 
          canvas.height = 360;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context oluşturulamadı');
          }
          
          // Video karesini canvas'a çiz
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Canvas'ı base64'e dönüştür
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Temizlik
          clearTimeout(timeoutId);
          video.remove();
          
          resolve(thumbnailUrl);
        } catch (error) {
          clearTimeout(timeoutId);
          console.error(`Thumbnail oluşturma hatası: ${videoId}`, error);
          video.remove();
          resolve(fallbackThumbnail(videoId));
        }
      };
      
      // Video kaynağını ayarla ve yüklemeye başla
      video.src = fixedUrl;
      document.body.appendChild(video);
      
      // Her şey hazır, videoyu yükle
      video.load();
    } catch (error) {
      console.error(`Video işleme hatası: ${videoId}`, error);
      reject(error);
    }
  });
};

// Video dosyasından önizleme oluşturma fonksiyonu
export const generateThumbnailFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!file || !file.type.startsWith('video/')) {
        reject(new Error('Geçersiz video dosyası'));
        return;
      }
      
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      
      // Timeout kontrolü
      const timeoutId = setTimeout(() => {
        console.error('Video thumbnail oluşturma zaman aşımı');
        video.remove();
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Video yükleme zaman aşımı'));
      }, 15000);
      
      // Hata durumunda
      video.onerror = (e) => {
        clearTimeout(timeoutId);
        console.error('Video yükleme hatası:', e);
        video.remove();
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Video yüklenemedi'));
      };
      
      // Video yüklendiğinde
      video.onloadeddata = () => {
        try {
          // Videonun ortasındaki kareyi yakala
          video.currentTime = Math.min(video.duration / 2, 3);
        } catch (error) {
          clearTimeout(timeoutId);
          video.remove();
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };
      
      // Seek işlemi tamamlandığında
      video.onseeked = () => {
        try {
          // Canvas oluştur ve resmi çiz
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 360;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context oluşturulamadı');
          }
          
          // Video karesini canvas'a çiz
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Canvas'ı base64'e dönüştür
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Temizlik
          clearTimeout(timeoutId);
          video.remove();
          URL.revokeObjectURL(objectUrl);
          
          resolve(thumbnailUrl);
        } catch (error) {
          clearTimeout(timeoutId);
          video.remove();
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };
      
      video.src = objectUrl;
      document.body.appendChild(video);
      video.load();
      
    } catch (error) {
      console.error('Video thumbnail oluşturma hatası:', error);
      reject(error);
    }
  });
};

const VideoThumbGenerator: React.FC<VideoThumbGeneratorProps> = ({ 
  videoUrl, 
  videoId, 
  onThumbnailGenerated,
  file
}) => {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let thumbnailUrl = '';
        
        // Eğer dosya sağlanmışsa dosyadan önizleme oluştur
        if (file) {
          thumbnailUrl = await generateThumbnailFromFile(file);
        } 
        // Değilse video URL'sinden önizleme oluştur
        else if (videoUrl) {
          thumbnailUrl = await generateVideoThumbnail(videoUrl, videoId);
        } else {
          throw new Error('Video kaynağı bulunamadı');
        }
        
        setThumbnail(thumbnailUrl);
        
        // Callback fonksiyonu çağır
        if (onThumbnailGenerated && thumbnailUrl) {
          onThumbnailGenerated(thumbnailUrl, videoId);
        }
      } catch (error) {
        console.error('Önizleme oluşturma hatası:', error);
        setError('Video önizlemesi oluşturulamadı');
        setThumbnail(fallbackThumbnail(videoId));
        
        // Hata durumunda yedek thumbnail ile callback çağır
        if (onThumbnailGenerated) {
          onThumbnailGenerated(fallbackThumbnail(videoId), videoId);
        }
      } finally {
        setLoading(false);
      }
    };
    
    generateThumbnail();
    
    return () => {
      // Temizlik işlemleri
      if (videoRef.current) {
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [videoUrl, videoId, onThumbnailGenerated, file]);
  
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm opacity-70">Video önizlemesi oluşturuluyor...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="text-center text-white">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="video-thumbnail w-full h-full">
      {thumbnail ? (
        <img 
          src={thumbnail} 
          alt={`Video önizleme: ${videoId}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <p className="text-sm text-white opacity-70">Önizleme yüklenemedi</p>
        </div>
      )}
    </div>
  );
};

export default VideoThumbGenerator; 