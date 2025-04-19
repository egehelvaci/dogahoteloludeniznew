import React from 'react';
import ServicesPage from './ServicesPage';

export const runtime = 'nodejs';
export const revalidate = 0; // Her istekte yeniden oluştur

type PageProps = {
  params: {
    lang: string;
  };
};

// Next.js 15'te, params'a erişim için önce params nesnesini await etmeliyiz
export default async function Page({ params }: PageProps) {
  // Önce tüm params nesnesini await et
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'tr';
  
  return <ServicesPage lang={lang} />;
} 