'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';

type AdminNavbarProps = {
  lang: string;
}

export default function AdminNavbar({ lang }: AdminNavbarProps) {
  const pathname = usePathname();
  
  const handleLogout = () => {
    // Burada çıkış işlemleri yapılabilir
    console.log('Çıkış yapılıyor...');
    // localStorage veya session temizleme işlemleri
    window.location.href = `/${lang}/admin/login`;
  };
  
  return (
    <nav className="bg-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link className="text-xl font-bold" href={`/${lang}/admin/`}>
                Yönetici Paneli
              </Link>
            </div>
            <div className="ml-6 flex items-center space-x-4">
              <Link 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 ${
                  pathname === `/${lang}/admin/` ? 'bg-teal-600' : ''
                }`} 
                href={`/${lang}/admin/`}
              >
                <FaHome className="inline-block mr-1" />
                Ana Sayfa
              </Link>
              <Link 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 ${
                  pathname.includes(`/${lang}/admin/rooms`) ? 'bg-teal-600' : ''
                }`} 
                href={`/${lang}/admin/rooms/`}
              >
                Odalar
              </Link>
              <Link 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 ${
                  pathname.includes(`/${lang}/admin/hero-slider`) ? 'bg-teal-600' : ''
                }`} 
                href={`/${lang}/admin/hero-slider/`}
              >
                Slider
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 mr-3" 
              href={`/${lang}/`}
            >
              Siteyi Görüntüle
            </Link>
            <button 
              className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 flex items-center"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-1" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 