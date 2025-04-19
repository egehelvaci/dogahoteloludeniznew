'use client';

import React from 'react';
// AdminNavbar'ı kaldırıyoruz çünkü sayfalarda zaten mevcut
// import AdminNavbar from '../../components/AdminNavbar';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  // Next.js 15'te params Promise olduğu için React.use() ile unwrap ediyoruz
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang;
  
  // Mevcut yolu al ve "/login" sayfasında ise navbar'ı gösterme
  const pathname = usePathname();
  const isLoginPage = pathname?.includes('/admin/login');
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* AdminNavbar'ı kaldırıyoruz çünkü sayfalarda zaten mevcut */}
      {/* !isLoginPage && <AdminNavbar lang={lang} /> */}
      <main className={!isLoginPage ? "p-4" : ""}>{children}</main>
    </div>
  );
} 