// ImageKit yanıt türleri
export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  size: number;
  filePath: string;
  fileType?: string;
  tags?: string[];
}

// Upload sonuç tipi
export interface UploadResult {
  success: boolean;
  url: string;
  fileId: string;
  fileType: string;
  message?: string;
}

// Yükleme yanıt yapısı
export interface UploadResponse {
  success: boolean;
  url: string;
  fileId: string;
  fileType: string;
  message?: string;
}

// Dönüştürme seçenekleri
export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  crop?: string;
  focus?: string;
  background?: string;
} 