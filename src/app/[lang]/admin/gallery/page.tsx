// Server component - 'use client' direktifi olmadan
import GalleryAdminClient from './GalleryAdminClient';

// Sayfa props tipi
interface GalleryPageProps {
  params: {
    lang: string;
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  // Server componentlerde params'a async/await ile erişebiliriz
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'tr';
  
  // Client componenti render et ve lang prop'unu aktararak
  return <GalleryAdminClient lang={lang} />;
}
