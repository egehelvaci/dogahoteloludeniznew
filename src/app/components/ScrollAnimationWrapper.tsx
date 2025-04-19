'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useAnimation, Variant } from 'framer-motion';
import { useInView } from 'framer-motion';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'zoomIn' | 'slide';
}

const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  slide: {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 }
  }
};

const ScrollAnimationWrapper = ({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  once = true,
  animation = 'fadeInUp'
}: ScrollAnimationWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });
  
  const selectedVariants = animations[animation];
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={selectedVariants}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimationWrapper; 