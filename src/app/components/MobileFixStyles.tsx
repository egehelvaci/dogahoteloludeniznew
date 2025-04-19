'use client';

import React, { useEffect } from 'react';

const MobileFixStyles = () => {
  // Mobil cihazlarda viewport yüksekliğini doğru ayarlamak için
  useEffect(() => {
    const setVH = () => {
      // CSS değişkeni olarak viewport yüksekliğini ayarla
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // İlk yüklemede çağır
    setVH();

    // Yeniden boyutlandırma olayını dinle
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <style jsx global>{`
      /* Mobil düzeltmeler için ekstra CSS kuralları */
      :root {
        /* Mobil tarayıcılar için viewport yüksekliği düzeltmesi */
        --vh: 1vh;
      }
      
      /* Yükseklik hesabı için viewport yüksekliği kullanımı düzeltmesi */
      .h-screen {
        height: 100vh; /* Fallback */
        height: calc(var(--vh, 1vh) * 100);
      }
      
      .min-h-screen {
        min-height: 100vh; /* Fallback */
        min-height: calc(var(--vh, 1vh) * 100);
      }
      
      /* iOS için form elemanlarının stillemesini düzelt */
      @supports (-webkit-touch-callout: none) {
        input,
        textarea,
        select {
          font-size: 16px !important;
        }
        
        /* Sabit konumlu elementlerin iPhone'da alt çubuk yüzünden kesilmesini önle */
        .fixed-bottom {
          bottom: env(safe-area-inset-bottom, 0);
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        /* iPhone X ve sonrası için çentiği dikkate al */
        .safe-top {
          padding-top: env(safe-area-inset-top, 0px);
        }
        
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      }
      
      /* Mobil cihazlar için kaydırma davranışını düzelt */
      @media (max-width: 767px) {
        /* Yatay kaydırmayı önle */
        body {
          overflow-x: hidden;
          width: 100%;
          position: relative;
        }
        
        /* Dokunmatik hedefler için minimum boyut */
        button,
        a,
        [role="button"],
        input[type="submit"],
        input[type="reset"],
        input[type="button"] {
          touch-action: manipulation;
        }
        
        /* Mobil menü ve sayfa içeriği için düzgün kaydırma */
        .mobile-scroll {
          -webkit-overflow-scrolling: touch;
          overflow-y: auto;
        }
        
        /* Lightbox ve modal içerikleri için kaydırma desteği */
        .modal-content {
          max-height: 85vh;
          max-height: calc(var(--vh, 1vh) * 85);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
    `}</style>
  );
};

export default MobileFixStyles; 