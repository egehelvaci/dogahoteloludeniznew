'use client';

import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

type WhatsAppButtonProps = {
  language: string;
};

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ language }) => {
  // Başlangıçta görünür olsun
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  // usePathname ile doğrudan URL'i alalım
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/admin');

  // Scroll kontrolünü yapıyoruz ama varsayılan olarak görünür
  useEffect(() => {
    // Başlangıçta zaten görünür olsun
    setIsVisible(true);
    
    const handleScroll = () => {
      // Sadece yukarı çıktığında gizlensin
      if (window.scrollY < 100) {
        setIsOpen(false); // Yukarıdayken açık mesaj kutusunu kapat
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // WhatsApp numarası ve varsayılan mesaj
  const phoneNumber = '905320664808'; // Başında + işareti olmadan
  const defaultMessage = language === 'tr'
    ? 'Merhaba, Rezarvasyon hakkında bilgi almak istiyorum'
    : 'Hello, I would like to get information about reservation';

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
  };

  // Admin sayfalarında veya sayfa henüz yeterince kaydırılmadığında gösterme
  if (isAdminPage || !isVisible) return null;

  return (
    <div className="fixed-bottom safe-bottom z-50">
      <div className={`fixed flex flex-col items-end transition-all duration-300 ease-in-out ${isOpen ? 'space-y-3' : 'space-y-0'}`} style={{ bottom: '30px', right: '30px' }}>  
        {/* Mesaj Balonu */}
        {isOpen && (
          <div className="bg-white shadow-xl rounded-lg p-4 max-w-[280px] animate-fade-in transform transition-all mb-2 border border-green-100">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsOpen(false)}
              aria-label="Kapat"
            >
              <FaTimes size={14} />
            </button>
            <p className="text-gray-700 text-sm mb-3">
              {language === 'tr' ? 'Rezervasyon için WhatsApp üzerinden ulaşın!' : 'Contact us via WhatsApp for reservation!'}       
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 w-full rounded-md transition-all duration-300 flex items-center justify-center text-sm"
            >
              <FaWhatsapp className="mr-2" />
              {language === 'tr' ? 'Sohbet Başlat' : 'Start Chat'}
            </button>
          </div>
        )}

        {/* Ana WhatsApp Butonu */}
        <button
          onClick={toggleOpen}
          className="bg-green-500 hover:bg-green-600 w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none border-2 border-white"
          aria-label="WhatsApp ile İletişim"
        >
          <FaWhatsapp className="text-white" size={32} />
          {/* Animasyonlu Pulse Efekti */}
          <span className="absolute animate-ping w-6 h-6 rounded-full bg-green-400 opacity-75"></span>      
        </button>
      </div>
    </div>
  );
};

export default WhatsAppButton; 