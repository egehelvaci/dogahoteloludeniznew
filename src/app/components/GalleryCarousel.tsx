'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fixVideoUrl, fallbackThumbnail } from './VideoThumbGenerator';
import VideoThumbGenerator from './VideoThumbGenerator';
import { toast } from 'react-hot-toast';

interface GalleryItemData {
  id: string;
  title: string;
  description: string;
  media_type: string;
  media_url: string;
  order_num: number;
  created_at: string;
  thumbnail_url?: string;
}

interface GalleryCarouselProps {
  items: GalleryItemData[];
  lang: string;
}

export default function GalleryCarousel({ items, lang }: GalleryCarouselProps) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [selectedVideoItem, setSelectedVideoItem] = useState<GalleryItemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<string | null>(null);
  const [galleryColumns, setGalleryColumns] = useState(4);

  // Ekran boyutuna göre sütun sayısını ayarla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setGalleryColumns(1);
      } else if (window.innerWidth < 768) {
        setGalleryColumns(2);
      } else if (window.innerWidth < 1024) {
        setGalleryColumns(3);
      } else {
        setGalleryColumns(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Video modalını kapatma işlevi
  const closeVideoModal = useCallback(() => {
    setSelectedVideoItem(null);
    setVideoLoadError(null);
  }, []);

  // ESC tuşu ile modalı kapatma
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeVideoModal();
      }
    };

    if (selectedVideoItem) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedVideoItem, closeVideoModal]);

  // Video önizleme resmini oluşturma/güncelleme
  const handleThumbnailGenerated = (thumbnailUrl: string, id: string) => {
    setThumbnails(prev => ({
      ...prev,
      [id]: thumbnailUrl
    }));
  };

  // Video öğesine tıklandığında
  const handleVideoClick = (item: GalleryItemData) => {
    setSelectedVideoItem(item);
    setVideoLoadError(null);
    setLoading(true);
  };

  // Video oynatıcı bileşeni
  const VideoPlayer = ({ item }: { item: GalleryItemData }) => {
    const [videoLoading, setVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState<string | null>(null);
    const fixedUrl = fixVideoUrl(item.media_url);

    return (
      <div className="video-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <div 
          className="absolute inset-0 -z-10"
          onClick={closeVideoModal}
        ></div>
        
        <div className="relative max-w-4xl w-full bg-black rounded-lg overflow-hidden shadow-2xl">
          <button 
            className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            onClick={closeVideoModal}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-2"></div>
                <p>Video yükleniyor...</p>
              </div>
            </div>
          )}
          
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-center text-white p-4">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-semibold mb-2">Video oynatılamıyor</p>
                <p className="opacity-80">{videoError}</p>
              </div>
            </div>
          )}
          
          <video 
            className="w-full aspect-video" 
            controls 
            autoPlay
            src={fixedUrl}
            onLoadStart={() => {
              setVideoLoading(true);
              setVideoError(null);
            }}
            onLoadedData={() => {
              setVideoLoading(false);
            }}
            onError={(e) => {
              console.error('Video oynatma hatası:', e);
              setVideoLoading(false);
              setVideoError('Video yüklenemedi veya oynatılamıyor. Desteklenmeyen format olabilir.');
              toast.error('Video oynatılamıyor');
            }}
          >
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
          
          {item.title && (
            <div className="p-4 bg-gray-900">
              <h3 className="text-white text-lg font-medium">{item.title}</h3>
              {item.description && <p className="text-gray-300 mt-1">{item.description}</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Önbellek yönetimi: Öğeler değiştiğinde video önizlemeleri oluştur
  useEffect(() => {
    // Sadece video medya türündeki öğeleri filtrele
    const videoItems = items.filter(item => item.media_type === 'video');
    
    if (videoItems.length === 0) return;
    
    console.log(`${videoItems.length} video için önizleme oluşturuluyor...`);
    
    // Her video için ayrı ayrı işleme
    videoItems.forEach(item => {
      // Önizleme yoksa veya önizleme güncellenmediyse
      if (!thumbnails[item.id]) {
        console.log(`Video işleniyor: ${item.id}`);
      }
    });
  }, [items, thumbnails]);

  // Geçerli video sayısını göster
  const videoCount = items.filter(item => item.media_type === 'video').length;
  const imageCount = items.filter(item => item.media_type !== 'video').length;

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p>{lang === 'tr' ? 'Galeride hiç öğe yok.' : 'No items in the gallery.'}</p>
      </div>
    );
  }

  // Sütunlara göre öğeleri dağıt
  const columns: GalleryItemData[][] = Array.from({ length: galleryColumns }, () => []);
  items.forEach((item, index) => {
    columns[index % galleryColumns].push(item);
  });

  return (
    <div className="gallery-container">
      <div className="gallery-stats mb-4 text-sm text-gray-600">
        <p>
          {lang === 'tr' 
            ? `Toplam ${items.length} öğe (${imageCount} resim, ${videoCount} video)`
            : `Total ${items.length} items (${imageCount} images, ${videoCount} videos)`
          }
        </p>
      </div>

      <div className={`gallery-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}>
        {columns.map((columnItems, colIndex) => (
          <div key={`column-${colIndex}`} className="gallery-column flex flex-col gap-4">
            {columnItems.map(item => (
              <div 
                key={item.id} 
                className="gallery-item relative rounded-lg overflow-hidden shadow-md cursor-pointer transition transform hover:shadow-lg hover:scale-[1.01]"
                onClick={() => {
                  if (item.media_type === 'video') {
                    handleVideoClick(item);
                  }
                }}
              >
                {item.media_type === 'video' ? (
                  <div className="aspect-video relative overflow-hidden">
                    <VideoThumbGenerator 
                      videoUrl={item.media_url}
                      videoId={item.id}
                      onThumbnailGenerated={handleThumbnailGenerated}
                    />
                    <div className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors">
                      <div className="bg-red-600/90 rounded-full p-3 text-white shadow-lg transform hover:scale-110 transition-transform">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200">
                    <img 
                      src={`${item.media_url}?t=${new Date().getTime()}`} 
                      alt={item.title || 'Gallery item'} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                
                {(item.title || item.description) && (
                  <div className="p-3 bg-white">
                    {item.title && <h3 className="text-sm font-semibold mb-1 truncate">{item.title}</h3>}
                    {item.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {selectedVideoItem && <VideoPlayer item={selectedVideoItem} />}
      
      <style jsx>{`
        .gallery-container {
          width: 100%;
          margin: 0 auto;
        }
        
        .gallery-item {
          break-inside: avoid;
          display: grid;
          grid-template-rows: auto auto;
        }
        
        @media (max-width: 640px) {
          .gallery-grid {
            column-gap: 12px;
            row-gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}