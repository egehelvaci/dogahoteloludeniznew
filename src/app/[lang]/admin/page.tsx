'use client';

import React from 'react';
import Link from 'next/link';
import { FaHome, FaList, FaImage, FaBed, FaBookmark, FaUser, FaServer, FaInfoCircle } from 'react-icons/fa';
import { FaUtensils } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

interface AdminPageProps {
  params: Promise<{ lang: string }>;
}

export default function AdminPage({ params }: AdminPageProps) {
  // Next.js 15'te params Promise olduğu için React.use() ile unwrap ediyoruz
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang;
  
  const adminModules = [
    {
      id: 'hero-slider',
      title: lang === 'tr' ? 'Ana Sayfa Slider' : 'Homepage Slider',
      description: lang === 'tr' 
        ? 'Ana sayfa hero bölümündeki slider görsellerini ve içeriklerini yönetin.' 
        : 'Manage slider images and content in the homepage hero section.',
      icon: <FaImage className="w-8 h-8 text-teal-600" />,
      url: `/${lang}/admin/hero-slider`
    },
    {
      id: 'rooms',
      title: lang === 'tr' ? 'Odalar' : 'Rooms',
      description: lang === 'tr' 
        ? 'Mevcut 4 oda tipini düzenleyin, görsellerini ve özelliklerini yönetin.' 
        : 'Edit the existing 4 room types, manage images and features.',
      icon: <FaBed className="w-8 h-8 text-teal-600" />,
      url: `/${lang}/admin/rooms`
    },
    {
      id: 'about',
      title: lang === 'tr' ? 'Hakkımızda' : 'About Us',
      description: lang === 'tr' 
        ? 'Hakkımızda sayfasındaki içeriği ve görselleri düzenleyin.' 
        : 'Edit content and images on the About Us page.',
      icon: <FaInfoCircle className="w-8 h-8 text-teal-600" />,
      url: `/${lang}/admin/about`
    },
    {
      id: 'gallery',
      title: lang === 'tr' ? 'Galeri' : 'Gallery',
      description: lang === 'tr' 
        ? 'Galeri görsellerini ekleyin, düzenleyin ve sıralayın.' 
        : 'Add, edit and order gallery images.',
      icon: <FaImage className="w-8 h-8 text-teal-600" />,
      url: `/${lang}/admin/gallery`
    },
    {
      id: 'services',
      title: lang === 'tr' ? 'Hizmetler' : 'Services',
      description: lang === 'tr' 
        ? 'Otel hizmetlerini ve özelliklerini düzenleyin.' 
        : 'Edit hotel services and features.',
      icon: <FaUtensils className="w-8 h-8 text-teal-600" />,
      url: `/${lang}/admin/services`
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {lang === 'tr' ? 'Yönetici Paneli' : 'Admin Panel'}
          </h1>
          <p className="text-gray-600">
            {lang === 'tr' 
              ? 'Web sitenizi yönetmek için aşağıdaki modüllerden birini seçin.' 
              : 'Choose one of the modules below to manage your website.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Link 
              key={module.id} 
              href={module.url}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-t-4 border-teal-600"
            >
              <div className="flex items-center mb-4">
                <div className="mr-3">{module.icon}</div>
                <h2 className="text-xl font-semibold text-gray-800">{module.title}</h2>
              </div>
              <p className="text-gray-600 mb-3">{module.description}</p>
              <div className="flex justify-end">
                <span className="text-teal-600 font-medium">
                  {lang === 'tr' ? 'Yönet →' : 'Manage →'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
} 