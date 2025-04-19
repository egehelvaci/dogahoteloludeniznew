import React from 'react';
import { Metadata } from 'next';
import { getDictionary } from '../../../app/dictionaries';
import GalleryPage from './GalleryPage';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  
  return {
    title: 'Doğa Hotel - Galeri',
    description: 'Doğa Hotel Fethiye Ölüdeniz Galeri - Otel odaları, bahçe, havuz ve daha fazla fotoğraf ve videolar.',
  };
}

export default function GalleryPageWrapper({ params }: { params: { lang: string } }) {
  const { lang } = params;
  // Client tarafı bileşenine veriler aktarılıyor
  return <GalleryPage lang={lang} />;
} 