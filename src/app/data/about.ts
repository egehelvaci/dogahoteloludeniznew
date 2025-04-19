import { v4 as uuidv4 } from 'uuid';

// About veri arayüzü
export interface AboutData {
  heroImage: string;
  mainImage: string;
  titleTR: string;
  titleEN: string;
  subtitleTR: string;
  subtitleEN: string;
  contentTR: string[];
  contentEN: string[];
  features: {
    id: string;
    iconName: string;
    titleTR: string;
    titleEN: string;
    descriptionTR: string;
    descriptionEN: string;
  }[];
  badgesTR: string[];
  badgesEN: string[];
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// JSON dosyasından about verilerini oku
export function readAboutData(): AboutData | null {
  try {
    // Bu client-side'da çalıştırılmadığından, sadece server-side'da kullanılacak
    // Gerçek implementasyon page.tsx içindedir
    return null;
  } catch (error) {
    console.error('About verisi okunurken hata:', error);
    return null;
  }
}

// Tüm about verilerini getir
export async function getAboutData(): Promise<AboutData | null> {
  try {
    const response = await fetch('/api/about', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`HTTP hata: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Veri alınamadı');
    }
    
    return result.data;
  } catch (error) {
    console.error('About verisi alınırken hata:', error);
    return null;
  }
}

// About verilerini güncelle
export async function updateAboutData(data: Partial<AboutData>): Promise<AboutData | null> {
  try {
    const response = await fetch('/api/about', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP hata: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Veri güncellenemedi');
    }
    
    return result.data;
  } catch (error) {
    console.error('About verisi güncellenirken hata:', error);
    return null;
  }
}

// Resim yükleme fonksiyonu - ImageKit'i kullanır
export async function uploadAboutImage(file: File): Promise<string | null> {
  try {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/about/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Resim yükleme hatası: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Resim yüklenemedi');
    }
    
    return result.url;
  } catch (error) {
    console.error('Resim yüklenirken hata:', error);
    return null;
  }
} 