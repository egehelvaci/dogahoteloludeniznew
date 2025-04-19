'use client';

import ImageKit from 'imagekit';
import { Readable } from 'stream';

// ------ CLIENT SIDE FUNCTIONS ------

// Güvenli istemci tarafında kullanılacak fonksiyonlar
export interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  blur?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

/**
 * ImageKit URL olup olmadığını kontrol eder
 */
export function isImageKitUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    // ImageKit URL'leri genellikle şu formatta olur: *.imagekit.io/
    const imageKitDomain = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'ik.imagekit.io';
    return url.includes(imageKitDomain);
  } catch (e) {
    console.error('ImageKit URL kontrolü hatası:', e);
    return false;
  }
}

/**
 * ImageKit resim URL'ini optimize eder
 */
export function transformImage(url: string, options: ImageKitTransformOptions = {}): string {
  if (!url || !isImageKitUrl(url)) return url;

  try {
    const urlObj = new URL(url);
    
    // Mevcut tr parametrelerini temizle
    urlObj.searchParams.delete('tr');
    
    // Dönüştürme parametrelerini oluştur
    const transformations: string[] = [];
    
    if (options.width) transformations.push(`w-${options.width}`);
    if (options.height) transformations.push(`h-${options.height}`);
    
    const quality = options.quality === 'auto' ? 'q-auto' : options.quality ? `q-${options.quality}` : '';
    if (quality) transformations.push(quality);
    
    const format = options.format === 'auto' ? 'f-auto' : options.format ? `f-${options.format}` : '';
    if (format) transformations.push(format);
    
    if (options.blur && options.blur > 0) transformations.push(`bl-${options.blur}`);
    
    // Dönüştürme parametresi yoksa orijinal URL'i döndür
    if (transformations.length === 0) return url;
    
    // Dönüştürme parametrelerini URL'e ekle
    const trParam = transformations.join(',');
    urlObj.searchParams.append('tr', trParam);
    
    return urlObj.toString();
  } catch (e) {
    console.error('ImageKit resim dönüştürme hatası:', e);
    return url;
  }
}

/**
 * Video URL'ini dönüştürme opsiyonları
 */
export interface VideoTransformOptions {
  quality?: number | 'auto';
  format?: 'auto' | 'mp4' | 'webm' | 'ogg';
}

/**
 * ImageKit video URL'ini optimize eder
 */
export function transformVideo(url: string, options: VideoTransformOptions = {}): string {
  if (!url || !isImageKitUrl(url)) return url;
  
  try {
    const urlObj = new URL(url);
    
    // Mevcut tr parametrelerini temizle
    urlObj.searchParams.delete('tr');
    
    // Dönüştürme parametrelerini oluştur
    const transformations: string[] = [];
    
    const quality = options.quality === 'auto' ? 'q-auto' : options.quality ? `q-${options.quality}` : '';
    if (quality) transformations.push(quality);
    
    const format = options.format === 'auto' ? 'f-auto' : options.format ? `f-${options.format}` : '';
    if (format) transformations.push(format);
    
    // Dönüştürme parametresi yoksa orijinal URL'i döndür
    if (transformations.length === 0) return url;
    
    // Dönüştürme parametrelerini URL'e ekle
    const trParam = transformations.join(',');
    urlObj.searchParams.append('tr', trParam);
    
    return urlObj.toString();
  } catch (e) {
    console.error('ImageKit video dönüştürme hatası:', e);
    return url;
  }
}

// ImageKit entegrasyonu için kullanılacak yapılandırma
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
};

// Güvenli istemci tarafında ImageKit public key ve URL endpoint değerlerine erişim
export const getImageKitClientConfig = () => {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'demo_public_key';
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/demo';
  
  return { publicKey, urlEndpoint };
};

// ------ SERVER SIDE FUNCTIONS ------
// Bu fonksiyonlar sadece server component'lerde kullanılmalıdır

export const getImageKitInstance = () => {
  if (typeof window !== 'undefined') {
    console.warn('ImageKit instance should not be created on the client side');
    return null;
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error('ImageKit yapılandırma değerleri eksik');
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
};

// Dosyayı ImageKit'e yükleme (sadece sunucu tarafında kullanılabilir)
export const uploadToImageKit = async (
  file: Buffer,
  fileName: string,
  folder: string = 'uploads'
) => {
  const imagekit = getImageKitInstance();
  if (!imagekit) {
    throw new Error('ImageKit instance oluşturulamadı');
  }

  try {
    const result = await imagekit.upload({
      file,
      fileName,
      folder,
    });

    // Dosya türünü belirle
    const fileType = result.fileType?.startsWith('image') ? 'image' : 'video';

    return {
      success: true,
      data: result,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      fileId: result.fileId,
      fileType: fileType
    };
  } catch (error) {
    console.error('ImageKit yükleme hatası:', error);
    return {
      success: false,
      error: `Dosya yüklenemedi: ${(error as Error).message}`,
    };
  }
};

// Dosyayı ImageKit'ten silme (sadece sunucu tarafında kullanılabilir)
export const deleteFromImageKit = async (fileId: string) => {
  const imagekit = getImageKitInstance();
  if (!imagekit) {
    throw new Error('ImageKit instance oluşturulamadı');
  }

  try {
    await imagekit.deleteFile(fileId);
    return { success: true };
  } catch (error) {
    console.error('ImageKit silme hatası:', error);
    return {
      success: false,
      error: `Dosya silinemedi: ${(error as Error).message}`,
    };
  }
}; 