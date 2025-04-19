import React from 'react';
import HomePage from './HomePage';

export const runtime = 'nodejs';

// Revalidate etiketi - her istekte yeni veri al
export const revalidate = 0;

interface PageProps {
  params: {
    lang: string;
  };
  searchParams?: Record<string, string | string[]>;
}

export default async function Page({ params }: PageProps) {
  const lang = params.lang || 'tr';
  
  return <HomePage lang={lang} />;
} 