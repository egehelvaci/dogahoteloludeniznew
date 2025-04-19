import { NextRequest, NextResponse } from 'next/server';
import { uploadToTebi } from '../../../lib/tebi';

// Dynamic API - Önbelleğe alınmasını engeller
export const dynamic = 'force-dynamic';

// Yüklenebilecek maksimum dosya boyutu (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// İzin verilen dosya tipleri
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
];

export async function POST(request: NextRequest) {
  console.log('Tebi Upload API: İstek alındı');
  
  try {
    // Form verisini al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const thumbnailFile = formData.get('thumbnailFile') as File;
    const folder = (formData.get('folder') as string) || 'services';
    
    if (!file) {
      console.error('Tebi Upload API: Dosya bulunamadı');
      return NextResponse.json(
        { success: false, message: 'Dosya yüklenmedi' },
        { status: 400 }
      );
    }
    
    // Dosya bilgilerini logla
    console.log(`Tebi Upload API: Dosya alındı - İsim: ${file.name}, Tür: ${file.type}, Boyut: ${file.size} bytes`);
    if (thumbnailFile) {
      console.log(`Tebi Upload API: Thumbnail alındı - İsim: ${thumbnailFile.name}, Tür: ${thumbnailFile.type}, Boyut: ${thumbnailFile.size} bytes`);
    }
    
    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz dosya formatı. Sadece JPEG, PNG, WebP, JPG, GIF ve video formatları desteklenir.' },
        { status: 400 }
      );
    }
    
    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Dosya boyutu 50MB\'ı geçemez' },
        { status: 400 }
      );
    }
    
    // Tebi.io'ya dosyayı yükle
    const tebiResult = await uploadToTebi({
      file,
      maxSizeInBytes: MAX_FILE_SIZE,
      checkFileType: true,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'ogg', 'mov', 'quicktime'],
      path: `dogahotel/${folder}`
    });
    
    if (!tebiResult.success) {
      console.error('Tebi Upload API: Yükleme hatası', tebiResult.message);
      return NextResponse.json(
        { success: false, message: tebiResult.message || 'Dosya yüklenemedi' },
        { status: 500 }
      );
    }
    
    // Eğer thumbnail varsa ve dosya video türündeyse thumbnail'i de yükle
    let thumbnailUrl = '';
    if (thumbnailFile && file.type.startsWith('video/')) {
      try {
        // Thumbnail dosya bilgilerini kontrol et
        console.log(`Tebi Upload API: Video thumbnail'i işleniyor - İsim: ${thumbnailFile.name}, Boyut: ${thumbnailFile.size} bytes`);
        
        if (thumbnailFile.size === 0) {
          console.warn('Tebi Upload API: Thumbnail dosya boyutu 0, yükleme atlanıyor');
        } else {
          // Thumbnail'i yükle
          const thumbResult = await uploadToTebi({
            file: thumbnailFile,
            maxSizeInBytes: 5 * 1024 * 1024, // 5MB thumbnail için yeterli
            checkFileType: true,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp'],
            path: `dogahotel/${folder}/thumbnails`
          });
          
          if (thumbResult.success) {
            thumbnailUrl = thumbResult.fileUrl;
            console.log(`Tebi Upload API: Thumbnail başarıyla yüklendi: ${thumbnailUrl}`);
          } else {
            console.error('Tebi Upload API: Thumbnail yükleme hatası:', thumbResult.message);
          }
        }
      } catch (thumbError) {
        console.error('Tebi Upload API: Thumbnail yüklenirken hata:', thumbError);
        // Thumbnail yüklenemese bile ana dosya yüklendiyse devam et
      }
    }
    
    console.log(`Tebi Upload API: Dosya başarıyla yüklendi: ${tebiResult.fileUrl}`);
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      filePath: tebiResult.fileUrl,
      url: tebiResult.fileUrl,
      fileName: file.name,
      originalName: file.name,
      fileType: file.type,
      size: file.size,
      thumbnailUrl: thumbnailUrl || undefined
    });
  } catch (error) {
    console.error('Tebi Upload API: Hata:', error);
    return NextResponse.json(
      { success: false, message: `Dosya yüklenemedi: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
