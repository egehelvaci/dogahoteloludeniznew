/**
 * Galeri görsellerini yüklemek için yardımcı fonksiyonlar
 */

// API URL - düzeltildi
const GALLERY_API_URL = '/api/gallery';

// Kategori yapılandırması
export const galleryCategories = [
  { id: 'all', nameTR: 'Tümü', nameEN: 'All' },
  { id: 'garden', nameTR: 'Bahçe', nameEN: 'Garden' },
  { id: 'pool', nameTR: 'Havuz', nameEN: 'Pool' },
  { id: 'reception', nameTR: 'Resepsiyon', nameEN: 'Reception' },
];

// Galeri öğesi arayüzü
export interface GalleryItem {
  id: string;
  image: string;
  videoUrl?: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  order: number;
  type: 'image' | 'video';
  category?: string;
}

// Sabit görsel listesi - yedek olarak
export const staticGalleryImages = [
  // Bahçe görseleri
  { path: '/images/gallery/garden.jpg', category: 'garden' },
  { path: '/images/gallery/garden2.jpg', category: 'garden' },
  { path: '/images/gallery/garden4.jpg', category: 'garden' },
  { path: '/images/gallery/garden6.jpg', category: 'garden' },
  { path: '/images/gallery/garden7.jpg', category: 'garden' },
  { path: '/images/gallery/garden9.jpg', category: 'garden' },
  { path: '/images/gallery/garden10.jpg', category: 'garden' },
  // Havuz görseleri
  { path: '/images/gallery/pool.jpg', category: 'pool' },
  { path: '/images/gallery/pool2.jpg', category: 'pool' },
  { path: '/images/gallery/pool3.jpg', category: 'pool' },
  // Resepsiyon görseleri
  { path: '/images/gallery/resepsiyon.jpg', category: 'reception' },
];

/**
 * API'den galeri öğelerini getir
 */
export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  try {
    console.log('Galeri öğeleri API\'den alınıyor...');
    const timestamp = new Date().getTime(); // Önbellek sorunlarını önlemek için
    
    const response = await fetch(`${GALLERY_API_URL}?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`API yanıtı başarısız: ${response.status} ${response.statusText}`);
      
      // API başarısız olursa statik görsel listesini kullan - yedek çözüm
      console.log('Statik galeri görsellerine dönülüyor...');
      return staticGalleryImages.map((img, index) => ({
        id: `static-${index}`,
        image: img.path,
        thumbnail: '',
        title: '',
        description: '',
        order: index,
        type: 'image',
        category: img.category
      }));
    }

    const responseData = await response.json();
    
    // API yanıtını kontrol et ve dönüştür
    if (responseData && responseData.success && Array.isArray(responseData.items)) {
      console.log(`${responseData.items.length} galeri öğesi başarıyla alındı`);
      
      // Galeri öğelerini dönüştür
      return responseData.items
        .filter((item: any) => item !== null) // Null öğeleri filtrele
        .map((item: any) => {
          // URL'leri doğru şekilde al
          const videoUrl = item.videoUrl || item.video_url || '';
          const imageUrl = item.imageUrl || item.image_url || '';
          const thumbnailUrl = item.thumbnailUrl || ''; // API'den gelen özel thumbnail
          const isVideo = item.type === 'video' || videoUrl;
          
          // Video için thumbnail kontrolü
          let finalThumbnailUrl = '';
          if (isVideo) {
            // Öncelik sırası: 
            // 1. API'den gelen özel thumbnail
            // 2. item.thumbnail
            // 3. imageUrl (thumbnailUrl olmasa da kullanılabilir)
            // 4. Varsayılan placeholder
            if (thumbnailUrl) {
              finalThumbnailUrl = thumbnailUrl;
            } 
            else if (item.thumbnail) {
              finalThumbnailUrl = item.thumbnail;
            } 
            else if (imageUrl) {
              finalThumbnailUrl = imageUrl;
            }
            else {
              finalThumbnailUrl = '/images/placeholder.jpg'; // Video preview yerine placeholder kullan
            }
            
            // Logla
            console.log(`Video [${item.id}] | Thumbnail kaynağı: ${
              thumbnailUrl ? 'API' : 
              (item.thumbnail ? 'item.thumbnail' : 
              (imageUrl ? 'imageUrl' : 'varsayılan'))
            }, URL: ${finalThumbnailUrl}`);
          }
          
          return {
            id: item.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
            image: imageUrl,
            videoUrl: videoUrl,
            thumbnail: finalThumbnailUrl,
            title: item.titleTR || item.title_tr || item.title || '',
            description: item.descriptionTR || item.description_tr || item.description || '',
            order: item.orderNumber || item.order_number || item.order || 0,
            type: item.type || (videoUrl ? 'video' : 'image'),
            category: item.category || 'all'
          };
        });
    } else {
      // Eğer API beklenen formatta veri dönmediyse
      console.warn('API geçersiz veri formatında yanıt döndürdü:', responseData);
      // Yine de responseData bir dizi ise onu kullanmaya çalış
      if (Array.isArray(responseData)) {
        return responseData
          .filter((item: any) => item !== null)
          .map((item: any) => ({
            id: item.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
            image: item.imageUrl || item.image_url || '',
            videoUrl: item.videoUrl || item.video_url || '',
            thumbnail: '',
            title: item.titleTR || item.title_tr || item.title || '',
            description: item.descriptionTR || item.description_tr || item.description || '',
            order: item.orderNumber || item.order_number || item.order || 0,
            type: item.type || ((item.videoUrl || item.video_url) ? 'video' : 'image'),
            category: item.category || 'all'
          }));
      }
      
      // Hiçbir veri dönmediyse statik listeyi kullan
      console.log('Statik galeri görsellerine dönülüyor...');
      return staticGalleryImages.map((img, index) => ({
        id: `static-${index}`,
        image: img.path,
        thumbnail: '',
        title: '',
        description: '',
        order: index,
        type: 'image',
        category: img.category
      }));
    }
  } catch (error) {
    console.error('Galeri öğeleri alınırken hata oluştu:', error);
    // Hata durumunda statik görsel listesi döndür
    console.log('Statik galeri görsellerine dönülüyor...');
    return staticGalleryImages.map((img, index) => ({
      id: `static-${index}`,
      image: img.path,
      thumbnail: '',
      title: '',
      description: '',
      order: index,
      type: 'image',
      category: img.category
    }));
  }
}

/**
 * Görsel yollarını içeren bir dizi döndürür
 */
export function getImagePaths(): string[] {
  return staticGalleryImages.map(img => img.path);
}

/**
 * Tüm görselleri kategorilerine göre filtreleme
 */
export function filterImagesByCategory(images: GalleryItem[], category: string): GalleryItem[] {
  if (category === 'all') return images;
  return images.filter(image => image.category === category);
}
