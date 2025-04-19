'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes, FaExpand } from 'react-icons/fa';

interface RoomGalleryProps {
  images: string[];
  roomName: string;
  lang: string;
}

export default function RoomGallery({ images, roomName, lang }: RoomGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Önceki ve sonraki görsele geçiş fonksiyonları
  const goToPrevious = () => {
    setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Lightbox aç/kapat
  const toggleLightbox = () => {
    setLightboxOpen(!lightboxOpen);
  };

  return (
    <>
      <div className="relative w-full h-full group">
        {/* Ana Görsel */}
        <motion.div
          key={activeImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full cursor-pointer"
          onClick={toggleLightbox}
        >
          <Image
            src={images[activeImage]}
            alt={`${roomName} - ${activeImage + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-xl object-cover"
          />
          
          {/* Büyütme ikonu */}
          <div className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-teal-700">
            <FaExpand size={16} />
          </div>
        </motion.div>
        
        {/* Slider Kontrolleri */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-teal-700 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              aria-label={lang === 'tr' ? 'Önceki görsel' : 'Previous image'}
            >
              <FaChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-teal-700 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              aria-label={lang === 'tr' ? 'Sonraki görsel' : 'Next image'}
            >
              <FaChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeImage === index ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(index);
                  }}
                  aria-label={`${lang === 'tr' ? 'Görsel' : 'Image'} ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={toggleLightbox}
          >
            <button 
              className="absolute top-5 right-5 text-white hover:text-gray-300 z-50"
              onClick={toggleLightbox}
            >
              <FaTimes size={28} />
            </button>
            
            <div className="w-full max-w-6xl h-full max-h-screen relative flex items-center" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full h-auto flex items-center justify-center">
                <img
                  src={images[activeImage]}
                  alt={`${roomName} - ${activeImage + 1}`}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-50"
                  >
                    <FaChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-50"
                  >
                    <FaChevronRight size={24} />
                  </button>
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="flex space-x-2 bg-black/30 rounded-full px-3 py-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            activeImage === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
                          }`}
                          onClick={() => setActiveImage(index)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 