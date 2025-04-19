'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaUtensils, 
  FaSwimmingPool, 
  FaArrowLeft, 
  FaArrowRight, 
  FaSpa, 
  FaCar, 
  FaWifi, 
  FaCocktail,
  FaChevronRight,
  FaMapMarkedAlt 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

type ServicesPageProps = {
  lang: string;
};

type ServiceItemWithIcon = {
  id: string;
  title: string;
  description: string;
  details: string[];
  image: string;
  images: string[];
  icon: string;
  order: number;
};

export default function ServicesPage({ lang }: ServicesPageProps) {
  const language = lang;
  const [services, setServices] = useState<ServiceItemWithIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Verileri yükle
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const timestamp = Date.now();
        const baseUrl = window.location.origin;
        
        // API'den veri çek
        const response = await fetch(`${baseUrl}/api/services?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Servis verileri alınamadı: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Verileri dönüştür
          const formattedServices = data.items.map((item: any) => ({
            id: item.id,
            title: language === 'tr' ? item.titleTR : item.titleEN,
            description: language === 'tr' ? item.descriptionTR : item.descriptionEN,
            details: language === 'tr' 
              ? (item.detailsTR || []) 
              : (item.detailsEN || []),
            image: item.image,
            images: item.images?.length > 0 ? item.images : [item.image],
            icon: item.icon || 'utensils',
            order: item.order_number || 0
          })).sort((a: ServiceItemWithIcon, b: ServiceItemWithIcon) => a.order - b.order);
          
          setServices(formattedServices);
          
          // İlk servis aktif olarak ayarla
          if (formattedServices.length > 0) {
            setActiveService(formattedServices[0].id);
          }
        } else {
          throw new Error(data.message || 'API hatası');
        }
      } catch (error) {
        console.error('Hizmet verileri yüklenirken hata:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [lang, language]);

  // İkon bileşenini al
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return <FaUtensils className="text-3xl md:text-4xl" />;
      case 'swimming-pool':
        return <FaSwimmingPool className="text-3xl md:text-4xl" />;
      case 'spa':
        return <FaSpa className="text-3xl md:text-4xl" />;
      case 'car':
        return <FaCar className="text-3xl md:text-4xl" />;
      case 'wifi':
        return <FaWifi className="text-3xl md:text-4xl" />;
      case 'cocktail':
        return <FaCocktail className="text-3xl md:text-4xl" />;
      case 'map':
        return <FaMapMarkedAlt className="text-3xl md:text-4xl" />;
      default:
        return <FaUtensils className="text-3xl md:text-4xl" />;
    }
  };

  // Sonraki slayt
  const nextSlide = (imagesLength: number) => {
    setCurrentSlide((prev) => (prev + 1) % imagesLength);
  };

  // Önceki slayt
  const prevSlide = (imagesLength: number) => {
    setCurrentSlide((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  // Aktif hizmet objesi
  const activeServiceObject = services.find(s => s.id === activeService);
  
  // Otomatik slayt değişimi
  useEffect(() => {
    if (!activeServiceObject || activeServiceObject.images.length <= 1) return;
    
    const timer = setInterval(() => {
      nextSlide(activeServiceObject.images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [activeServiceObject, currentSlide]);

  // Sayfa yüklenirken
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-amber-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-800 font-medium">
            {language === 'tr' ? 'Hizmetler Yükleniyor...' : 'Loading Services...'}
          </p>
        </div>
      </div>
    );
  }

  // Servis bulunamadıysa
  if (services.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
        <Image
          src="/images/empty-services.jpg" 
          alt="Hizmet Bulunamadı"
          width={300}
          height={300}
          className="mb-8 rounded-lg shadow-lg"
        />
        <h2 className="text-2xl md:text-3xl font-bold text-amber-800 mb-4 text-center">
          {language === 'tr' ? 'Henüz Hizmet Bulunmuyor' : 'No Services Found'}
        </h2>
        <p className="text-gray-600 text-center max-w-md mb-8">
          {language === 'tr' 
            ? 'Şu anda görüntülenecek hizmet bulunmuyor. Lütfen daha sonra tekrar kontrol edin.' 
            : 'There are no services to display currently. Please check back later.'}
        </p>
        <Link 
          href={`/${language}`}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
        >
          {language === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Modern Hero Section - Gradient Arka Plan */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800">
        {/* Dekoratif elementler */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Dalga şekli */}
          <div className="absolute -bottom-10 left-0 right-0 h-20 opacity-30">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#f59e0b" className="opacity-25"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#ffffff" className="opacity-10"></path>
            </svg>
          </div>
          
          {/* Animasyonlu daireler */}
          <motion.div 
            className="absolute top-10 right-10 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl"
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-800/30 blur-3xl"
            animate={{ 
              x: [0, -20, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          {/* Geometrik şekiller */}
          <div className="absolute top-1/4 left-1/3 w-32 h-32 border-2 border-white/10 rounded-lg transform rotate-12"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border-2 border-white/10 rounded-full"></div>
          <div className="absolute top-2/3 left-1/4 w-16 h-16 border-2 border-white/5 transform rotate-45"></div>
          
          {/* Parıltı noktaları */}
          <div className="hidden md:block absolute top-20 left-20 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]"></div>
          <div className="hidden md:block absolute top-40 right-40 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_3px_rgba(255,255,255,0.6)]"></div>
          <div className="hidden md:block absolute bottom-32 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]"></div>
        </div>
      
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-wider">
              {language === 'tr' ? 'Hizmetlerimiz' : 'Our Services'}
            </h1>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-amber-50 max-w-3xl mx-auto font-light">
              {language === 'tr' 
                ? 'Size eşsiz bir konaklama deneyimi sunmak için özenle hazırladığımız hizmetlerimiz' 
                : 'Our carefully prepared services to offer you a unique accommodation experience'}
            </p>
            
            {/* Otel Bilgileri */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-8 py-4 text-white"
              >
                <span className="block text-4xl font-bold">58</span>
                <span className="text-sm uppercase tracking-wider">{language === 'tr' ? 'Konforlu Oda' : 'Comfortable Rooms'}</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-8 py-4 text-white"
              >
                <span className="block text-4xl font-bold">2</span>
                <span className="text-sm uppercase tracking-wider">{language === 'tr' ? 'Yüzme Havuzu' : 'Swimming Pools'}</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-8 py-4 text-white"
              >
                <span className="block text-4xl font-bold">3</span>
                <span className="text-sm uppercase tracking-wider">{language === 'tr' ? 'Restoran' : 'Restaurant'}</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-8 py-4 text-white"
              >
                <span className="block text-4xl font-bold">15</span>
                <span className="text-sm uppercase tracking-wider">{language === 'tr' ? 'Yıllık Tecrübe' : 'Years Experience'}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hizmet Navigasyonu */}
      <section className="py-10 bg-white border-b border-amber-100">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto">
            <ul className="flex space-x-2 md:space-x-4 justify-start md:justify-center min-w-max md:min-w-0 pb-2">
              {services.map((service) => (
                <motion.li key={service.id} whileHover={{ y: -5 }}>
                  <button
                    onClick={() => {
                      setActiveService(service.id);
                      setCurrentSlide(0);
                    }}
                    className={`px-4 md:px-6 py-3 md:py-4 rounded-xl transition-all ${
                      activeService === service.id
                        ? 'bg-amber-100 shadow-md border-b-4 border-amber-600'
                        : 'bg-gray-50 hover:bg-amber-50'
                    }`}
                  >
                    <span className={`text-base md:text-lg font-medium transition-colors whitespace-nowrap ${
                      activeService === service.id ? 'text-amber-800' : 'text-gray-700'
                    }`}>
                      {service.title}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Aktif Hizmet Gösterimi */}
      <AnimatePresence mode="wait">
        {activeServiceObject && (
          <motion.section 
            key={activeServiceObject.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-16 bg-amber-50"
          >
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Görsel Bölümü */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[600px] bg-white">
                    {activeServiceObject.images.length > 0 && (
                      <>
                        <div className="relative w-full h-full flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            className="relative max-w-full max-h-full flex justify-center items-center"
                          >
                            <Image 
                              src={activeServiceObject.images[currentSlide]}
                              alt={activeServiceObject.title}
                              width={1000}
                              height={800}
                              quality={95}
                              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-md"
                              priority
                            />
                          </motion.div>
                        </div>
                        
                        {/* Navigasyon Butonları */}
                        {activeServiceObject.images.length > 1 && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                prevSlide(activeServiceObject.images.length);
                              }} 
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-amber-600 hover:text-white p-3 md:p-4 rounded-full text-amber-800 z-10 transition-all duration-300 shadow-lg focus:outline-none"
                              aria-label="Önceki"
                            >
                              <FaArrowLeft className="text-lg md:text-xl" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                nextSlide(activeServiceObject.images.length);
                              }} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-amber-600 hover:text-white p-3 md:p-4 rounded-full text-amber-800 z-10 transition-all duration-300 shadow-lg focus:outline-none"
                              aria-label="Sonraki"
                            >
                              <FaArrowRight className="text-lg md:text-xl" />
                            </button>
                            
                            {/* Slider Göstergeleri */}
                            <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
                              {activeServiceObject.images.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentSlide(i);
                                  }}
                                  className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                                    currentSlide === i 
                                      ? 'bg-amber-600 w-8 md:w-10' 
                                      : 'bg-white/80 w-2 md:w-3 hover:bg-white'
                                  }`}
                                  aria-label={`Slayt ${i + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Bilgi Bölümü */}
                  <div className="flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-amber-800 border-b-2 border-amber-200 pb-4">
                        {activeServiceObject.title}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                        {activeServiceObject.description}
                      </p>
                      
                      {activeServiceObject.details && activeServiceObject.details.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xl md:text-2xl font-semibold text-amber-700">
                            {language === 'tr' ? 'Özellikler' : 'Features'}
                          </h3>
                          
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {activeServiceObject.details.map((detail, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                className="flex items-center bg-white p-3 rounded-lg shadow-sm"
                              >
                                <span className="w-2 h-6 bg-amber-500 rounded-full mr-3"></span>
                                <span className="text-gray-800">{detail}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* İletişim Bölümü */}
      <section className="py-16 bg-gradient-to-br from-amber-600 to-amber-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            {language === 'tr' ? 'Hizmetlerimiz Hakkında Daha Fazla Bilgi' : 'More Information About Our Services'}
          </h3>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-amber-100">
            {language === 'tr' 
              ? 'Size özel hizmetlerimiz hakkında daha detaylı bilgi almak için bizimle iletişime geçebilirsiniz.' 
              : 'You can contact us for more detailed information about our special services.'}
          </p>
          <Link 
            href={`/${language}/contact`}
            className="inline-block bg-white text-amber-800 hover:bg-amber-100 transition px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:-translate-y-1 hover:shadow-xl duration-300"
          >
            {language === 'tr' ? 'İletişime Geçin' : 'Contact Us'}
          </Link>
        </div>
      </section>
    </>
  );
} 