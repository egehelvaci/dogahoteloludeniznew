"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Buton Dalga Efekti
export const RippleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      x,
      y,
      id: Date.now()
    };
    
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
    
    if (onClick) onClick();
  };
  
  return (
    <button
      className={`relative overflow-hidden rounded-md px-4 py-2 text-white bg-blue-600 ${className}`}
      onClick={handleClick}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white bg-opacity-30"
          initial={{ width: 0, height: 0, opacity: 0.5, x: ripple.x, y: ripple.y, transform: 'translate(-50%, -50%)' }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
      {children}
    </button>
  );
};

// Hover Card Efekti
export const HoverCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Toggle Switch
export const ToggleSwitch: React.FC<{
  isOn: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ isOn, onToggle, className = '' }) => {
  return (
    <div
      className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${isOn ? 'bg-blue-600' : 'bg-gray-300'} ${className}`}
      onClick={onToggle}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        animate={{ x: isOn ? 24 : 0 }}
      />
    </div>
  );
};

// Scroll Progress Bar
export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  React.useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = scrollPx / winHeightPx;
      setScrollProgress(scrolled);
    };
    
    window.addEventListener('scroll', updateScrollProgress);
    
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
      style={{ scaleX: scrollProgress }}
    />
  );
};

// Pulse Animation
export const PulseAnimation: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <motion.div
      className={`w-6 h-6 bg-red-500 rounded-full ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop"
      }}
    />
  );
};

// Shake Animation
export const ShakeInput: React.FC<{
  error?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ error = false, placeholder, className = '', onChange }) => {
  const variants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    },
    idle: { x: 0 }
  };
  
  return (
    <motion.input
      variants={variants}
      animate={error ? 'shake' : 'idle'}
      className={`border p-2 rounded-md outline-none ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};

// Animated Counter
export const AnimatedCounter: React.FC<{
  value: number;
  className?: string;
}> = ({ value, className = '' }) => {
  return (
    <motion.div
      className={`font-bold text-2xl ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={value}
    >
      {value}
    </motion.div>
  );
};

// Text Animation
export const AnimatedText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 }
    }
  };
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };
  
  return (
    <motion.div
      className={`flex overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}; 