'use client';

import React, { ReactNode } from 'react';
import AdminNavbar from './AdminNavbar';
import { usePathname } from 'next/navigation';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const lang = pathname?.startsWith('/tr') ? 'tr' : 'en';
  
  // Login sayfasında navbar gösterme
  const isLoginPage = pathname?.includes('/admin/login');
  
  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoginPage && <AdminNavbar lang={lang} />}
      <main className="p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
} 