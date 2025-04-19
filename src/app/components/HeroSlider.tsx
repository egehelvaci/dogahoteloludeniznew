'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getSliderData, SliderItem } from '../data/admin/sliderData';
import ImageKitImage from '../../components/ui/ImageKitImage';
import ImageKitVideo from '../../components/ui/ImageKitVideo';

type HeroSliderProps = {
  language: string;
};

const HeroSlider: React.FC<HeroSliderProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0); // -1: sol, 0: başlangıç, 1: sağ
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  
  // Scroll animasyonu için
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const translateY = useTransform(scrollY, [0, 300], [0, 100]);
  
  // Paralaks efekti için
  const bgScale = useTransform(scrollY, [0, 500], [1.05, 1.2]);
  const bgTranslateY = useTransform(scrollY, [0, 500], [0, 50]);
  const textTranslateY = useTransform(scrollY, [0, 500], [0, -70]);
  const textScale = useTransform(scrollY, [0, 500], [1, 0.9]);
  const buttonsTranslateY = useTransform(scrollY, [0, 500], [0, 30]);
  
  const headingColor = useTransform(
    scrollY, 
    [0, 300], 
    ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.5)']
  );

  // Önceden yükleme için görüntü referanslarını tut
  const preloadImageRefs = useRef<{[key: string]: HTMLImageElement}>({});

  // Slider verilerini yükle
  useEffect(() => {
    const fetchSliderData = async () => {
      setIsLoading(true);
      try {
        console.log("HeroSlider: Slider verileri alınıyor");
        
        // getSliderData fonksiyonunu kullan (axios yerine)
        const data = await getSliderData();
        console.log("HeroSlider: Slider verileri başarıyla alındı:", data.length, "öğe");
        console.log("İlk veri örneği:", data.length > 0 ? JSON.stringify(data[0]).substring(0, 100) : "Veri yok");
        
        if (data && data.length > 0) {
          // Verileri setSliderItems ile state'e ekle
          setSliderItems(data);
          
          // İlk görseli hemen yüklemeye başla
          if (data[0]?.image && typeof window !== 'undefined') {
            const imgElement = new window.Image();
            imgElement.src = data[0].image;
            console.log("İlk görsel ön yükleme:", data[0].image);
            imgElement.onload = () => {
              console.log('İlk resim önceden yüklendi');
              setImagesLoaded(prev => ({ ...prev, [data[0].image]: true }));
            };
            preloadImageRefs.current[data[0].image] = imgElement;
          }
        } else {
          console.warn("HeroSlider: Slider verisi bulunamadı, varsayılan veri kullanılacak");
          setSliderItems([{
            id: '1',
            image: '/images/hero-bg.jpg',
            titleTR: 'Doğa Tatil Evi',
            titleEN: 'Doğa Holiday House',
            subtitleTR: 'Doğa ile İç İçe',
            subtitleEN: 'In Harmony With Nature',
            descriptionTR: 'Huzur dolu bir tatil için ideal mekan',
            descriptionEN: 'Ideal place for a peaceful holiday',
            order: 0,
            active: true
          }]);
        }
      } catch (error) {
        console.error("HeroSlider: Slider verileri yüklenirken hata oluştu:", error);
        console.log("HeroSlider: Varsayılan veriler kullanılacak");
        setSliderItems([{
          id: '1',
          image: '/images/hero-bg.jpg',
          titleTR: 'Doğa Tatil Evi',
          titleEN: 'Doğa Holiday House',
          subtitleTR: 'Doğa ile İç İçe',
          subtitleEN: 'In Harmony With Nature',
          descriptionTR: 'Huzur dolu bir tatil için ideal mekan',
          descriptionEN: 'Ideal place for a peaceful holiday',
          order: 0,
          active: true
        }]);
      } finally {
        // Yükleme tamamlandı
        setIsLoading(false);
      }
    };

    fetchSliderData();
    
    // Temizleme işlevi
    return () => {
      // Önbelleğe alınmış görselleri temizle
      Object.values(preloadImageRefs.current).forEach(img => {
        img.onload = null;
      });
      preloadImageRefs.current = {};
    };
  }, []);

  // Otomatik slayt değiştirme için zamanlayıcı
  useEffect(() => {
    let slideTimer: NodeJS.Timeout;
    
    const rotateSlider = () => {
      if (isLoading || (sliderItems?.length || 0) <= 1 || isTransitioning) return;
      
      setIsTransitioning(true);
      setDirection(1);
      
      const nextSlideIndex = (currentIndex + 1) % (sliderItems?.length || 1);
      setCurrentIndex(nextSlideIndex);
      
      // Geçiş süresini
      slideTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000); // Daha hızlı geçiş
    };
    
    // Otomatik geçiş 8 saniye olsun
    const autoSlideTimer = setInterval(rotateSlider, 8000);
    
    return () => {
      clearInterval(autoSlideTimer);
      clearTimeout(slideTimer);
    };
  }, [sliderItems, currentIndex, isLoading, isTransitioning]);
  
  // Manuel geçişlerin süresi
  const prevSlide = () => {
    if (isTransitioning || (sliderItems?.length || 0) <= 1) return;
    
    setIsTransitioning(true);
    setDirection(-1);
    
    const prevSlideIndex = (currentIndex - 1 + (sliderItems?.length || 1)) % (sliderItems?.length || 1);
    setCurrentIndex(prevSlideIndex);
    
    // Manuel geçişler için daha kısa bekleme süresi
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // Daha hızlı geçiş
  };
  
  // Manuel geçişlerin süresini kısaltalım
  const nextSlide = () => {
    if (isTransitioning || (sliderItems?.length || 0) <= 1) return;
    
    setIsTransitioning(true);
    setDirection(1);
    
    const nextSlideIndex = (currentIndex + 1) % (sliderItems?.length || 1);
    setCurrentIndex(nextSlideIndex);
    
    // Manuel geçişler için daha kısa bekleme süresi
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // Daha hızlı geçiş
  };
  
  // Manuel geçişlerin süresini kısaltalım
  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    
    // Manuel geçişler için daha kısa bekleme süresi
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // Daha hızlı geçiş
  };

  // Preload images - optimize edildi
  useEffect(() => {
    if (!sliderItems || sliderItems.length === 0) return;
    
    // Sıradaki resmi ön belleğe al (şu anki gösterilen ve bir sonraki)
    const preloadNextImage = () => {
      const nextIndex = (currentIndex + 1) % sliderItems.length;
      
      // Şu anki ve sonraki görselleri ön belleğe al
      [currentIndex, nextIndex].forEach(index => {
        const item = sliderItems[index];
        if (item?.image && typeof window !== 'undefined') {
          // Browser Image API kullan, next/image değil
          const imgElement = new window.Image();
          imgElement.src = item.image;
        }
      });
    };
    
    preloadNextImage();
  }, [sliderItems, currentIndex]);

  // Yükleme durumunda veya slider boşsa
  if (isLoading || sliderItems.length === 0) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center bg-gray-800">
        <div className="text-white text-2xl font-semibold">
          {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // Mevcut görsel bilgisi
  const currentSlide = sliderItems[currentIndex];
  const title = language === 'tr' ? currentSlide.titleTR : currentSlide.titleEN;
  const subtitle = language === 'tr' ? currentSlide.subtitleTR : currentSlide.subtitleEN;
  const description = language === 'tr' ? currentSlide.descriptionTR : currentSlide.descriptionEN;

  // Slayt varyantları daha yumuşak ve hızlı
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '20%' : '-20%', // Daha az hareket
      opacity: 0.7, // Daha hızlı görünürlük için
      scale: 1.05, // Daha az ölçekleme
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }, // Daha kısa ve yumuşak
        opacity: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }, // Daha kısa
        scale: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-15%' : '15%', // Daha az hareket
      opacity: 0.5, // Daha hızlı kaybolma
      scale: 0.95, // Daha az ölçekleme
      transition: {
        x: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }, // Daha kısa ve yumuşak
        opacity: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }, // Daha kısa
        scale: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] },
      },
    }),
  };
  
  // İçerik varyantları
  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.2, // İçerik animasyonu biraz daha geç başlasın
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: { 
      opacity: 0, 
      y: -50,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
  
  // Buton varyantları
  const buttonVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: 0.8,
        ease: "easeOut" 
      } 
    },
    hover: {
      scale: 1.05,
      transition: { 
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: { 
      scale: 0.95,
      transition: { 
        duration: 0.15,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden"
      style={{ 
        minHeight: '500px',
        maxHeight: '100vh' 
      }}
    >
      {/* Arkaplan */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`slide-bg-${currentIndex}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 z-0"
        >
          {currentSlide.videoUrl ? (
            <div className="absolute inset-0 overflow-hidden">
              <ImageKitVideo 
                src={currentSlide.videoUrl}
                className="object-cover w-full h-full"
                controls={false}
                autoPlay={true}
                loop={true}
                muted={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40"></div>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <ImageKitImage 
                src={currentSlide.image}
                alt={title}
                width={1920}
                height={1080}
                className="object-cover w-full h-full"
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40"></div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* İçerik - Animasyonları daha hızlı */}
      <div className="absolute inset-0 z-10 container mx-auto flex flex-col items-center justify-center px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-content-${currentIndex}`}
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -30}}
            transition={{duration: 0.5, ease: "easeOut"}}
            className="text-center max-w-4xl"
          >
            {subtitle && (
              <motion.div 
                className="mb-6 inline-block"
                initial={{opacity: 0, y: 15}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.4, delay: 0.1}}
              >
                <span className="bg-amber-500 bg-opacity-90 text-white px-5 py-3 text-base md:text-lg lg:text-xl uppercase tracking-wider rounded-md font-semibold shadow-lg">
                  {subtitle}
                </span>
              </motion.div>
            )}
            
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 drop-shadow-xl text-shadow-lg"
              style={{color: headingColor, textShadow: '0 4px 12px rgba(0,0,0,0.5)'}}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.2}}
            >
              {title}
            </motion.h1>
            
            {description && (
              <motion.p 
                className="text-white text-xl md:text-2xl lg:text-3xl mb-10 max-w-4xl mx-auto drop-shadow-lg font-medium"
                style={{textShadow: '0 2px 6px rgba(0,0,0,0.7)'}}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: 0.3}}
              >
                {description}
              </motion.p>
            )}
            
            <motion.div
              style={{y: buttonsTranslateY}}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.4}}
              className="flex flex-wrap justify-center"
            >
              <Link 
                href={`/${language}/rooms`}
                className="bg-amber-500 hover:bg-amber-600 text-white py-4 px-10 rounded-md text-lg md:text-xl font-semibold inline-flex items-center transition-all duration-300 mx-2 my-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 border-2 border-amber-400"
              >
                {language === 'tr' ? 'Odaları Keşfet' : 'Explore Rooms'}
                <FaArrowRight className="ml-3 text-xl group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <Link 
                href={`/${language}/contact`}
                className="bg-white/90 hover:bg-white text-gray-800 py-4 px-10 rounded-md text-lg md:text-xl font-semibold inline-flex items-center transition-all duration-300 mx-2 my-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 border-2 border-white/50"
              >
                {language === 'tr' ? 'İletişim' : 'Contact'}
                <FaArrowRight className="ml-3 text-xl group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigasyon Okları - Daha belirgin ve animasyonlu */}
      {sliderItems.length > 1 && (
        <>
          <motion.button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-amber-500 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
            disabled={isTransitioning}
            aria-label={language === 'tr' ? 'Önceki' : 'Previous'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <motion.button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-amber-500 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
            disabled={isTransitioning}
            aria-label={language === 'tr' ? 'Sonraki' : 'Next'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronRight className="w-6 h-6" />
          </motion.button>
          
          {/* Noktalar - Daha hoş tasarım */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
            <div className="flex space-x-3 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              {sliderItems.map((_, index) => (
                <motion.button
                  key={`dot-${index}`}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 h-3 bg-amber-500' 
                      : 'w-3 h-3 bg-white/70 hover:bg-white/90'
                  } rounded-full`}
                  aria-label={`${language === 'tr' ? 'Slayt' : 'Slide'} ${index + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider; 