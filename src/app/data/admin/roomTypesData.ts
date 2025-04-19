// RoomType arayüzü
export interface RoomType {
  id: string;
  nameTR: string;
  nameEN: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Temel URL'ler
const API_URL = '/api/admin/room-types';

// getBaseUrl yardımcı fonksiyonu
const getBaseUrl = (): string => {
  // Vercel'de çalıştığında
  if (process.env.VERCEL_URL) {
    console.log('Vercel URL kullanılıyor:', `https://${process.env.VERCEL_URL}`);
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Production URL (Vercel için)
  if (process.env.VERCEL) {
    console.log('Production URL kullanılıyor: https://dogahoteloludeniznew.vercel.app');
    return 'https://dogahoteloludeniznew.vercel.app';
  }
  
  // Tarayıcıda çalışıyorsa
  if (typeof window !== 'undefined') {
    console.log('Tarayıcı origin kullanılıyor:', window.location.origin);
    return window.location.origin;
  }
  
  // Default (Geliştirme ortamında)
  console.log('Varsayılan localhost kullanılıyor');
  return 'http://localhost:3000';
};

// Tüm oda tiplerini getir
export async function getAllRoomTypes(): Promise<RoomType[]> {
  try {
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}${API_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Oda tipleri alınamadı');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('API hatası:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Oda tipleri çekilirken hata oluştu:', error);
    return [];
  }
}

// ID'ye göre oda tipi getir
export async function getRoomTypeById(id: string): Promise<RoomType | null> {
  try {
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Oda tipi alınamadı: ${id}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('API hatası:', data.message);
      return null;
    }
  } catch (error) {
    console.error(`Oda tipi bilgisi alınırken hata oluştu (ID: ${id}):`, error);
    return null;
  }
}

// Yeni oda tipi ekle
export async function addRoomType(roomType: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomType | null> {
  try {
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomType)
    });
    
    if (!response.ok) {
      throw new Error('Oda tipi eklenemedi');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('API hatası:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Oda tipi eklenirken hata oluştu:', error);
    return null;
  }
}

// Oda tipini güncelle
export async function updateRoomType(id: string, roomType: Partial<RoomType>): Promise<RoomType | null> {
  try {
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomType)
    });
    
    if (!response.ok) {
      throw new Error(`Oda tipi güncellenemedi: ${id}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('API hatası:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Oda tipi güncellenirken hata oluştu:', error);
    return null;
  }
}

// Oda tipini sil
export async function deleteRoomType(id: string): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Oda tipi silinemedi: ${id}`);
    }
    
    const data = await response.json();
    
    return data.success;
  } catch (error) {
    console.error('Oda tipi silinirken hata oluştu:', error);
    return false;
  }
}

// Oda tipinin görünürlüğünü değiştir
export async function toggleRoomTypeVisibility(id: string): Promise<boolean> {
  try {
    // Önce oda tipini getir
    const roomType = await getRoomTypeById(id);
    
    if (!roomType) {
      return false;
    }
    
    // Görünürlüğü değiştir
    const updatedRoomType = await updateRoomType(id, {
      active: !roomType.active
    });
    
    return !!updatedRoomType;
  } catch (error) {
    console.error('Oda tipi görünürlüğü değiştirilirken hata oluştu:', error);
    return false;
  }
}