'use client';

import React from 'react';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 p-4 mb-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link href="/tr/admin" className="text-blue-600 hover:text-blue-800 transition-colors">
          <FaHome className="h-5 w-5" aria-hidden="true" />
        </Link>
        
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
    </header>
  );
} 