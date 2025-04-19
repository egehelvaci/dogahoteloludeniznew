'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes, FaExpand, FaPlay, FaImage, FaVideo, FaFilter } from 'react-icons/fa';
import ScrollAnimationWrapper from '../../components/ScrollAnimationWrapper';
import { fetchGalleryItems, GalleryItem } from '../../utils/galleryUtils';

type GalleryPageProps = {
  lang: string;
};

// Galeri filtreleme seçenekleri
type GalleryFilter = 'photos' | 'videos';

export default function GalleryPage({ lang }: GalleryPageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItemIndex, setLightboxItemIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('photos');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Galeri verilerini yükle
  useEffect(() => {
    async function loadGalleryData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const items = await fetchGalleryItems();
        if (items.length > 0) {
          setGalleryItems(items);
        } else {
          setError('Galeri öğeleri yüklenemedi, lütfen daha sonra tekrar deneyin.');
        }
      } catch (err) {
        console.error('Galeri yükleme hatası:', err);
        setError('Galeri öğeleri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadGalleryData();
  }, []);

  // Filtre değiştiğinde öğeleri filtrele
  useEffect(() => {
    if (galleryItems.length > 0) {
      if (activeFilter === 'photos') {
        setFilteredItems(galleryItems.filter(item => item.type === 'image'));
      } else if (activeFilter === 'videos') {
        setFilteredItems(galleryItems.filter(item => item.type === 'video'));
      }
    }
  }, [galleryItems, activeFilter]);

  const openLightbox = (index: number) => {
    setLightboxItemIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
    
    // Video oynatılıyorsa durdur
    if (videoRef.current && filteredItems[lightboxItemIndex]?.type === 'video') {
      videoRef.current.pause();
    }
  };

  const nextLightboxImage = () => {
    setLightboxItemIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  const prevLightboxImage = () => {
    setLightboxItemIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextLightboxImage();
    } else if (isRightSwipe) {
      prevLightboxImage();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Filtre değiştirme işlevi
  const changeFilter = (filter: GalleryFilter) => {
    setActiveFilter(filter);
    setIsFilterOpen(false);
  };

  // Yükleme durumunda loading göster
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Hata durumunda hata mesajı göster
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
          >
            {lang === 'tr' ? 'Yeniden Dene' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // Veri yoksa mesaj göster
  if (galleryItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 mt-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              {lang === 'tr' ? 'Galeri' : 'Gallery'}
            </h2>
          </div>
          <p className="text-center text-gray-500">
            {lang === 'tr' ? 'Henüz galeri öğesi eklenmemiş.' : 'No gallery items added yet.'}
          </p>
        </div>
      </div>
    );
  }

  // Seçilen filtreye göre öğeleri sayalım
  const photoCount = galleryItems.filter(item => item.type === 'image').length;
  const videoCount = galleryItems.filter(item => item.type === 'video').length;

  return (
    <div className="relative min-h-screen">
      {/* Modern Video Hero Section */}
      <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hotel-background.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <img 
              src="/images/hotel-exterior.jpg" 
              alt="Hotel" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-800/80 to-blue-900/80 z-10"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 container mx-auto h-full flex items-center justify-center px-4">
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <FaImage className="text-teal-600 text-xl" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {lang === 'tr' ? 'Görsel Galeri' : 'Visual Gallery'}
            </motion.h1>
            
            <motion.div 
              className="w-16 sm:w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            ></motion.div>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {lang === 'tr' 
                ? 'Otelimizin güzelliğini keşfedin ve unutulmaz anılar biriktirin.' 
                : 'Discover the beauty of our hotel and create unforgettable memories.'}
            </motion.p>
            
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button
                onClick={() => {
                  const gallerySection = document.getElementById('gallery-section');
                  if (gallerySection) {
                    gallerySection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {lang === 'tr' ? 'Galeriyi Keşfet' : 'Explore Gallery'}
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent z-10"></div>
        <div className="absolute -bottom-5 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-teal-500/20 rounded-full blur-2xl"></div>
      </section>

      {/* Filters & Gallery */}
      <section id="gallery-section" className="relative bg-white py-16 md:py-24 px-4">
        <div className="container mx-auto relative">
          {/* Decorative Elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {lang === 'tr' ? 'Medya Koleksiyonumuz' : 'Our Media Collection'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {lang === 'tr' 
                ? 'Otelimizin en güzel fotoğrafları ve videoları. Unutulmaz bir tatil deneyimi için sizleri bekliyor.' 
                : 'The most beautiful photos and videos of our hotel. Waiting for you for an unforgettable holiday experience.'}
            </p>
          </div>
          
          {/* Modern Filter Bar */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="flex bg-white shadow-md rounded-full p-1 border border-gray-200">
                <button
                  className={`px-5 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${
                    activeFilter === 'photos'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => changeFilter('photos')}
                >
                  <FaImage className="mr-2" />
                  <span>{lang === 'tr' ? `Fotoğraflar (${photoCount})` : `Photos (${photoCount})`}</span>
                </button>
                <button
                  className={`px-5 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${
                    activeFilter === 'videos'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => changeFilter('videos')}
                >
                  <FaVideo className="mr-2" />
                  <span>{lang === 'tr' ? `Videolar (${videoCount})` : `Videos (${videoCount})`}</span>
                </button>
              </div>
              
              {/* Mobile Filter Button */}
              <div className="md:hidden mt-4">
                <button
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 rounded-md"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <FaFilter />
                  <span>{lang === 'tr' ? 'Filtreler' : 'Filters'}</span>
                </button>
                
                {isFilterOpen && (
                  <motion.div 
                    className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md overflow-hidden z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center"
                      onClick={() => changeFilter('photos')}
                    >
                      <FaImage className="mr-2" />
                      {lang === 'tr' ? `Fotoğraflar (${photoCount})` : `Photos (${photoCount})`}
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center"
                      onClick={() => changeFilter('videos')}
                    >
                      <FaVideo className="mr-2" />
                      {lang === 'tr' ? `Videolar (${videoCount})` : `Videos (${videoCount})`}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Gallery Items Grid with Animation */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-700"></div>
            </div>
          ) : (
            <>
              {filteredItems.length === 0 ? (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-7xl mb-6 opacity-50">😕</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {lang === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {lang === 'tr' 
                      ? 'Bu kategoride henüz içerik bulunmuyor.' 
                      : 'There is no content in this category yet.'}
                  </p>
                  <button
                    className="px-6 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-md"
                    onClick={() => changeFilter('photos')}
                  >
                    {lang === 'tr' ? 'Tümünü Göster' : 'Show All'}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white relative group transform hover:-translate-y-2"
                      onClick={() => openLightbox(index)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="relative pb-[66.67%] overflow-hidden">
                        {item.type === 'video' ? (
                          <div className="absolute inset-0">
                            <video
                              className="w-full h-full object-cover"
                              src={item.videoUrl}
                              poster={item.thumbnail || item.image || "/images/placeholder.jpg"}
                              preload="none"
                              muted
                              onClick={(e) => {
                                e.stopPropagation();
                                openLightbox(index);
                              }}
                            >
                              <source src={item.videoUrl} type="video/mp4" />
                            </video>
                            
                            {/* Play butonu overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-300">
                              <div className="w-16 h-16 rounded-full bg-teal-600 bg-opacity-90 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                <FaPlay className="text-2xl ml-1" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.title || 'Gallery image'}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              console.log("Görsel yüklenemedi, placeholder kullanılıyor");
                              (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                            }}
                          />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 text-white transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        {item.title && <h3 className="text-lg font-semibold mb-1">{item.title}</h3>}
                        {item.description && <p className="text-sm opacity-90">{item.description}</p>}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-teal-700 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            {lang === 'tr' ? 'Lüks ve Konforun Keyfini Çıkarın' : 'Enjoy Luxury and Comfort'}
          </h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            {lang === 'tr' 
              ? 'Otelimizde unutulmaz bir tatil deneyimi için hemen rezervasyon yapın.'
              : 'Book now for an unforgettable holiday experience at our hotel.'}
          </p>
          <button className="px-8 py-3 bg-white text-teal-700 rounded-full hover:bg-gray-100 transition-colors shadow-md font-medium">
            {lang === 'tr' ? 'Rezervasyon Yap' : 'Make a Reservation'}
          </button>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="max-w-7xl max-h-[90vh] relative">
            {/* Lightbox Navigation */}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-10 hover:text-teal-400 transition-colors bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                prevLightboxImage();
              }}
            >
              <FaChevronLeft />
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-10 hover:text-teal-400 transition-colors bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                nextLightboxImage();
              }}
            >
              <FaChevronRight />
            </button>
            
            {/* Close Button */}
            <button
              className="absolute right-4 top-4 text-white text-xl z-10 hover:text-red-500 transition-colors bg-black/30 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={closeLightbox}
            >
              <FaTimes />
            </button>
            
            {/* Lightbox Content */}
            <motion.div 
              className="w-full h-full flex items-center justify-center" 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredItems[lightboxItemIndex]?.type === 'video' ? (
                <div className="w-full max-w-4xl">
                  <video 
                    ref={videoRef}
                    src={filteredItems[lightboxItemIndex].videoUrl} 
                    poster={filteredItems[lightboxItemIndex].thumbnail || filteredItems[lightboxItemIndex].image || "/images/placeholder.jpg"}
                    controls 
                    autoPlay 
                    className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
                  >
                    Tarayıcınız video etiketini desteklemiyor.
                  </video>
                </div>
              ) : (
                <img
                  src={filteredItems[lightboxItemIndex].image}
                  alt={filteredItems[lightboxItemIndex]?.title || 'Gallery image'}
                  className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
                />
              )}
            </motion.div>
            
            {/* Caption */}
            {(filteredItems[lightboxItemIndex]?.title || filteredItems[lightboxItemIndex]?.description) && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-70 text-white backdrop-blur-sm rounded-b-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {filteredItems[lightboxItemIndex]?.title && <h3 className="text-xl font-bold">{filteredItems[lightboxItemIndex].title}</h3>}
                {filteredItems[lightboxItemIndex]?.description && <p className="mt-1 opacity-90">{filteredItems[lightboxItemIndex].description}</p>}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
} 