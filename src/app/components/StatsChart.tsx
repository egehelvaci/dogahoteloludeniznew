'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

type StatsChartProps = {
  language: string;
};

const StatsChart = ({ language }: StatsChartProps) => {
  const [inView, setInView] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setInView(true);
    
    if (inView) {
      controls.start((i) => ({
        width: i.width,
        transition: { duration: 1.5, delay: i.delay }
      }));
    }
  }, [controls, inView]);

  const stats = [
    {
      id: 1,
      title: language === 'tr' ? 'Hastane & Klinik' : 'Hospitals & Clinics',
      value: 200,
      prefix: '+',
      width: '85%',
      delay: 0
    },
    {
      id: 2,
      title: language === 'tr' ? 'Yıllık Deneyim' : 'Years of Experience',
      value: 20,
      prefix: '+',
      width: '75%',
      delay: 0.2
    },
    {
      id: 3,
      title: language === 'tr' ? 'Teknik Uzman' : 'Technical Experts',
      value: 50,
      prefix: '+',
      width: '65%',
      delay: 0.4
    },
    {
      id: 4,
      title: language === 'tr' ? 'Müşteri Memnuniyeti' : 'Customer Satisfaction',
      value: 98,
      prefix: '%',
      width: '98%',
      delay: 0.6
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
      {stats.map((stat) => (
        <div key={stat.id} className="flex flex-col">
          <div className="mb-2 flex items-baseline">
            <div className="text-3xl md:text-4xl font-bold mr-2">
              <CountUp
                end={stat.value}
                duration={2}
                delay={stat.delay + 0.5}
                start={inView ? 0 : null}
              />
              {stat.prefix}
            </div>
            <div className="text-lg text-white/90">{stat.title}</div>
          </div>
          <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={controls}
              custom={{ width: stat.width, delay: stat.delay }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// İstatistik animasyonu için CountUp bileşeni
const CountUp = ({ end, start = 0, duration = 2, delay = 0 }) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (start === null) return;

    let startTime;
    let animationFrame;

    const callback = (timestamp) => {
      if (!startTime) startTime = timestamp;
      
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = Math.floor(progress * (end - start) + start);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(callback);
      }
    };

    const startAnimation = () => {
      animationFrame = requestAnimationFrame(callback);
    };

    const timeout = setTimeout(startAnimation, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [start, end, duration, delay]);

  return <>{count}</>;
};

export default StatsChart; 