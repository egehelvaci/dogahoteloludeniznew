import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Dynamic API
export const dynamic = 'force-dynamic';

// Yüklenebilecek maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// İzin verilen dosya tipleri
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];

// Dosya uzantılarını belirleme
const getExtensionFromMimeType = (mimeType: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  };
  return map[mimeType] || '.jpg';
};

// Yükleme dizinini oluştur ve kontrol et
const ensureUploadDir = (folder: string) => {
  const folderPath = path.join('uploads', folder);
  const fullFolderPath = path.join(process.cwd(), 'public', folderPath);
  
  if (!fs.existsSync(fullFolderPath)) {
    fs.mkdirSync(fullFolderPath, { recursive: true });
  }
  return { folderPath, fullFolderPath };
};

export async function POST(request: NextRequest) {
  console.log('Çoklu Upload API: İstek alındı');
  
  try {
    // Form verisini al
    const formData = await request.formData();
    const folder = (formData.get('folder') as string) || 'services';
    
    // Tüm dosyaları al
    const filesEntries = Array.from(formData.entries())
      .filter(([key, value]) => value instanceof File && key.startsWith('files'));
    
    if (filesEntries.length === 0) {
      console.error('Çoklu Upload API: Dosya bulunamadı');
      return NextResponse.json(
        { success: false, message: 'Dosya yüklenmedi' },
        { status: 400 }
      );
    }
    
    const { folderPath } = ensureUploadDir(folder);
    const uploadedFiles = [];
    
    // Her dosyayı işle
    for (const [, file] of filesEntries) {
      const currentFile = file as File;
      
      // Dosya bilgilerini logla
      console.log(`Çoklu Upload API: Dosya işleniyor - İsim: ${currentFile.name}, Tür: ${currentFile.type}, Boyut: ${currentFile.size} bytes`);
      
      // Dosya tipi kontrolü
      if (!ALLOWED_TYPES.includes(currentFile.type)) {
        console.log(`Dosya atlandı: ${currentFile.name} - Geçersiz format: ${currentFile.type}`);
        continue;
      }
      
      // Dosya boyutu kontrolü
      if (currentFile.size > MAX_FILE_SIZE) {
        console.log(`Dosya atlandı: ${currentFile.name} - Boyut çok büyük: ${currentFile.size} bytes`);
        continue;
      }
      
      // Dosya adını güvenli hale getir ve benzersiz yap
      const fileName = currentFile.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
      const fileExtension = getExtensionFromMimeType(currentFile.type);
      const uniqueFileName = `${Date.now()}-${uuidv4().substring(0, 8)}${fileExtension}`;
      
      // Tam dosya yolu
      const filePath = path.join(folderPath, uniqueFileName);
      const fullPath = path.join(process.cwd(), 'public', filePath);
      
      console.log(`Çoklu Upload API: Dosya kaydediliyor: ${fullPath}`);
      
      // Dosyayı buffer'a dönüştür ve kaydet
      const bytes = await currentFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      fs.writeFileSync(fullPath, buffer);
      
      // URL oluştur
      const fileUrl = `/${filePath.replace(/\\/g, '/')}`;
      
      uploadedFiles.push({
        success: true,
        filePath: fileUrl,
        url: fileUrl,
        fileName: uniqueFileName,
        originalName: fileName,
        fileType: currentFile.type,
        size: currentFile.size
      });
    }
    
    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Hiçbir dosya yüklenemedi' },
        { status: 400 }
      );
    }
    
    console.log(`Çoklu Upload API: ${uploadedFiles.length} dosya başarıyla yüklendi`);
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      totalUploaded: uploadedFiles.length,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Çoklu Upload API: Hata:', error);
    return NextResponse.json(
      { success: false, message: `Dosyalar yüklenemedi: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 