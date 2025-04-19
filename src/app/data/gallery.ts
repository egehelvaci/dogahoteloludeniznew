import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../lib/prisma';

// GalleryItem arayüzü
export interface GalleryItem {
  id: string;
  image: string;
  image_url?: string; // Database field uyumu için
  videoUrl?: string;
  video_url?: string; // Database field uyumu için
  title?: string;
  titleTR?: string;
  titleEN?: string;
  description?: string;
  descriptionTR?: string;
  descriptionEN?: string;
  order: number;
  order_number?: number; // Database field uyumu için
  type: 'image' | 'video';
  active?: boolean;
  category?: string;
  youtubeId?: string;
}

// YouTube video ID'sini URL'den çıkaran yardımcı fonksiyon
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  
  // YouTube URL formatları:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[7].length === 11) ? match[7] : null;
}

// Tüm galeri öğelerini getirme API'si - Server Component'ler için
export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  try {
    // Sunucu tarafında doğrudan prisma kullanır
    if (typeof window === 'undefined') {
      const galleryItems = await prisma.gallery.findMany({
        orderBy: {
          orderNumber: 'asc',
        },
      });

      // Veri formatını uygulama için standartlaştır
      return galleryItems.map(item => ({
        id: item.id,
        image: item.imageUrl || '',
        imageUrl: item.imageUrl || '',
        videoUrl: item.videoUrl || '',
        title: item.titleTR || '',
        description: item.descriptionTR || '',
        order: item.orderNumber || 0,
        type: item.type as 'image' | 'video',
        active: true
      }));
    }
    
    // Client tarafında ise fetch kullanır
    const timestamp = Date.now(); // Önbelleği kırmak için
    const baseUrl = window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/gallery?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Her bir öğeyi işleyerek doğru formata dönüştür
    if (data && data.success && Array.isArray(data.items)) {
      const items = data.items;
      
      // Veri yapısı uyumsuzluklarını düzelt
      return items.map(item => ({
        id: item.id,
        image: item.imageUrl || item.image_url || '',
        videoUrl: item.videoUrl || item.video_url || '',
        title: item.titleTR || item.title || '',
        description: item.descriptionTR || item.description || '',
        order: item.orderNumber || item.order || item.order_number || 0,
        type: item.type || (item.videoUrl || item.video_url ? 'video' : 'image'),
        active: item.active !== false
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Galeri verileri getirilirken hata:', error);
    return [];
  }
}

// ID'ye göre galeri öğesi getirme
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    // Sunucu tarafında doğrudan prisma kullanır
    if (typeof window === 'undefined') {
      const item = await prisma.gallery.findUnique({
        where: { id }
      });
      
      if (!item) return null;
      
      return {
        id: item.id,
        image: item.imageUrl || '',
        videoUrl: item.videoUrl || '',
        title: item.titleTR || '',
        description: item.descriptionTR || '',
        order: item.orderNumber || 0,
        type: item.type as 'image' | 'video',
        active: true
      };
    }
    
    const timestamp = Date.now();
    const baseUrl = window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/gallery/${id}?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.success && data.item) {
      const item = data.item;
      return {
        id: item.id,
        image: item.imageUrl || item.image_url || '',
        videoUrl: item.videoUrl || item.video_url || '',
        title: item.titleTR || item.title || '',
        description: item.descriptionTR || item.description || '',
        order: item.orderNumber || item.order || item.order_number || 0,
        type: item.type || (item.videoUrl || item.video_url ? 'video' : 'image'),
        active: item.active !== false
      };
    }
    
    return null;
  } catch (error) {
    console.error(`ID: ${id} ile galeri öğesi getirilirken hata:`, error);
    return null;
  }
}

// Yeni galeri öğesi ekleme - Client'dan çağrılır
export async function addGalleryItem(item: Omit<GalleryItem, 'id' | 'order'>): Promise<GalleryItem | null> {
  try {
    const baseUrl = window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Galeri öğesi eklenirken hata:', error);
    return null;
  }
}

// Galeri öğesi güncelleme - Client'dan çağrılır
export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  try {
    const baseUrl = window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`ID: ${id} ile galeri öğesi güncellenirken hata:`, error);
    return null;
  }
}

// Galeri öğesi silme - Client'dan çağrılır
export async function deleteGalleryItem(id: string): Promise<boolean> {
  try {
    const baseUrl = window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error(`ID: ${id} ile galeri öğesi silinirken hata:`, error);
    return false;
  }
}

// Galeri öğelerini sıralama - Client'dan çağrılır
export async function reorderGalleryItems(items: {id: string, order: number}[]): Promise<boolean> {
  try {
    const baseUrl = window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/gallery/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Galeri öğeleri sıralanırken hata:', error);
    return false;
  }
}