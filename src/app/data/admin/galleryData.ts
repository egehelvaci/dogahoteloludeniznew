import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Galeri öğesi arayüzü
export interface GalleryItem {
  id: string;
  image: string;
  videoUrl?: string;
  title: string;
  description: string;
  order: number;
  type: 'image' | 'video';
}

// API bağlantıları
const API_URL = '/api/gallery';
const REORDER_API_URL = '/api/gallery/reorder';
const UPLOAD_API_URL = '/api/admin/gallery/upload';

// Medya yükleme fonksiyonu (ImageKit kullanarak)
export async function uploadGalleryMedia(file: File): Promise<{fileUrl: string, fileType: string} | null> {
  try {
    console.log('Admin: Galeri medyası yükleniyor');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'gallery');
    
    const response = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Medya yüklenirken bir hata oluştu');
    }
    
    const data = await response.json();
    
    if (data.success && data.fileUrl) {
      console.log('Admin: Medya başarıyla yüklendi:', data.fileUrl);
      return {
        fileUrl: data.fileUrl,
        fileType: data.fileType
      };
    } else {
      throw new Error('Medya yükleme yanıtı geçersiz');
    }
  } catch (error) {
    console.error('Admin: Galeri medyası yüklenirken hata oluştu:', error);
    return null;
  }
}

// Tüm galeri öğelerini getir (admin için)
export async function getAllGalleryData(): Promise<GalleryItem[]> {
  try {
    console.log('Admin: Tüm galeri verilerini getir - API URL:', API_URL);
    
    const response = await axios.get(API_URL, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (response.status === 200 && response.data) {
      // Success kontrolü ekle
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Galeri verileri alınırken bir hata oluştu');
      }
      
      const items = Array.isArray(response.data) ? response.data : 
                    (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
                    
      console.log(`Admin: ${items.length} galeri öğesi başarıyla yüklendi`);
      return items;
    } else {
      throw new Error(`API beklenmeyen yanıt döndürdü: ${response.status}`);
    }
  } catch (error) {
    console.error('Admin: Galeri verileri getirilirken hata oluştu:', error);
    return [];
  }
}

// ID'ye göre galeri öğesi getir
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    console.log('Admin: Galeri öğesi getiriliyor - ID:', id);
    
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (response.status === 200 && response.data) {
      // Success kontrolü ekle
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Galeri öğesi alınırken bir hata oluştu');
      }
      
      const item = response.data.data || response.data;
      console.log('Admin: Galeri öğesi başarıyla getirildi');
      return item;
    } else {
      throw new Error(`API beklenmeyen yanıt döndürdü: ${response.status}`);
    }
  } catch (error) {
    console.error('Admin: Galeri öğesi getirilirken hata oluştu:', error);
    return null;
  }
}

// Görsel URL'sini düzenle
function formatImageUrl(image: any): string {
  // Eğer image undefined veya null ise boş string döndür
  if (!image) {
    return '';
  }
  
  // Eğer image bir nesne ise
  if (typeof image === 'object') {
    // Nesne içinde url, fileUrl veya src özellikleri var mı kontrol et
    if (image.url) return image.url;
    if (image.fileUrl) return image.fileUrl;
    if (image.src) return image.src;
    
    // Olası özellikler yoksa ve nesne stringifiy edilebiliyorsa
    try {
      console.warn('Görsel nesnesi düzeltilemiyor, nesne detayları:', JSON.stringify(image));
    } catch (e) {
      console.error('Görsel nesnesi loglanamadı');
    }
    return '';
  }
  
  // Eğer image string ise ve URL formatında değilse
  if (typeof image === 'string') {
    if (!image.startsWith('http') && !image.startsWith('/')) {
      return `/${image}`;
    }
    return image;
  }
  
  // Diğer veri tipleri için boş string döndür
  console.warn('Beklenmeyen görsel veri tipi:', typeof image);
  return '';
}

// Yeni galeri öğesi ekle
export async function addGalleryItem(item: Omit<GalleryItem, 'id' | 'order'>): Promise<GalleryItem | null> {
  try {
    console.log('Admin: Yeni galeri öğesi ekleniyor');
    
    // İçeriği hazırla ve görsel URL'lerini formatla
    const formattedItem = {
      ...item,
      image: formatImageUrl(item.image)
    };
    
    if (item.videoUrl) {
      formattedItem.videoUrl = formatImageUrl(item.videoUrl);
    }

    const response = await axios.post(API_URL, formattedItem, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

    if (response.status === 201 && response.data) {
      // Success kontrolü ekle
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Galeri öğesi eklenirken bir hata oluştu');
      }
      
      const newItem = response.data.data || response.data;
      console.log('Admin: Yeni galeri öğesi başarıyla eklendi:', newItem);
      return newItem;
    } else {
      throw new Error(`API beklenmeyen yanıt döndürdü: ${response.status}`);
    }
  } catch (error) {
    console.error('Admin: Galeri öğesi eklenirken hata oluştu:', error);
    return null;
  }
}

// Galeri öğesini güncelle
export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  try {
    console.log('Admin: Galeri öğesi güncelleniyor:', id);
    
    // Görsel/video URL'lerini formatla
    const formattedUpdates = { ...updates };
    
    if (updates.image !== undefined) {
      formattedUpdates.image = formatImageUrl(updates.image);
    }
    
    if (updates.videoUrl !== undefined) {
      formattedUpdates.videoUrl = formatImageUrl(updates.videoUrl);
    }
    
    const response = await axios.put(`${API_URL}/${id}`, formattedUpdates, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

    if (response.status === 200 && response.data) {
      // Success kontrolü ekle
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Galeri öğesi güncellenirken bir hata oluştu');
      }
      
      const updatedItem = response.data.data || response.data;
      console.log('Admin: Galeri öğesi başarıyla güncellendi:', updatedItem);
      return updatedItem;
    } else {
      throw new Error(`API beklenmeyen yanıt döndürdü: ${response.status}`);
    }
  } catch (error) {
    console.error('Admin: Galeri öğesi güncellenirken hata oluştu:', error);
    return null;
  }
}

// Galeri öğesini sil
export async function deleteGalleryItem(id: string): Promise<boolean> {
  try {
    console.log('Admin: Galeri öğesi siliniyor:', id);
    const timestamp = new Date().getTime(); // Önbellek sorunlarını önlemek için
    
    const response = await axios.delete(`${API_URL}/${id}?t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

    if (response.status === 200) {
      // Success kontrolü ekle
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Galeri öğesi silinirken bir hata oluştu');
      }
      
      console.log('Admin: Galeri öğesi başarıyla silindi');
      return true;
    } else {
      throw new Error(`API beklenmeyen yanıt döndürdü: ${response.status}`);
    }
  } catch (error) {
    console.error('Admin: Galeri öğesi silinirken hata oluştu:', error);
    return false;
  }
}

// Galeri öğelerini yeniden sırala
export async function reorderGalleryItems(items: {id: string, order: number}[]): Promise<boolean> {
  try {
    console.log('Admin: Galeri öğeleri yeniden sıralanıyor');
    const timestamp = new Date().getTime(); // Önbellek sorunlarını önlemek için
    
    const response = await axios.post(`${REORDER_API_URL}?t=${timestamp}`, { items }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

    if (response.status === 200) {
      // Success kontrolü ekle
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Galeri öğeleri yeniden sıralanırken bir hata oluştu');
      }
      
      console.log('Admin: Galeri öğeleri başarıyla yeniden sıralandı');
      return true;
    } else {
      throw new Error(`API beklenmeyen yanıt döndürdü: ${response.status}`);
    }
  } catch (error) {
    console.error('Admin: Galeri öğeleri yeniden sıralanırken hata oluştu:', error);
    return false;
  }
} 