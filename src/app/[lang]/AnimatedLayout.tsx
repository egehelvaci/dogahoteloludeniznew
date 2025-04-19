'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface AnimatedLayoutProps {
  children: ReactNode;
}

const AnimatedLayout = ({ children }: AnimatedLayoutProps) => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  
  // Cihaz türünü kontrol et
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // İlk kontrol
    checkDevice();
    
    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  // Mobil cihazlarda daha hafif animasyon kullan veya hiç kullanma
  const variants = {
    initial: isMobile 
      ? { opacity: 0 } 
      : { opacity: 0, y: 20 },
    animate: isMobile 
      ? { opacity: 1, transition: { duration: 0.2 } } 
      : { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: isMobile 
      ? { opacity: 0, transition: { duration: 0.1 } } 
      : { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className="mobile-scroll"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedLayout; 