import { NextRequest, NextResponse } from 'next/server';
import { uploadToTebi } from '../../../../lib/tebi';

// Yüklenebilecek maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// İzin verilen dosya tipleri
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    // İstek formunu al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'services';

    // Dosya kontrolü
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece JPEG, PNG, WebP, JPG ve GIF formatları desteklenir.' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'ı geçemez' },
        { status: 400 }
      );
    }
    
    console.log(`Admin Upload API: Dosya Tebi.io'ya yükleniyor - İsim: ${file.name}, Boyut: ${file.size} bytes`);
    
    // Tebi.io'ya yükle
    const tebiResult = await uploadToTebi({
      file,
      maxSizeInBytes: MAX_FILE_SIZE,
      checkFileType: true,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      path: `dogahotel/${folder}`
    });
    
    if (!tebiResult.success) {
      console.error('Admin Upload API: Tebi yükleme hatası', tebiResult.message);
      return NextResponse.json(
        { error: tebiResult.message || 'Dosya yüklenemedi' },
        { status: 500 }
      );
    }
    
    console.log(`Admin Upload API: Dosya başarıyla yüklendi: ${tebiResult.fileUrl}`);
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      filePath: tebiResult.fileUrl,
      url: tebiResult.fileUrl,
      fileName: file.name,
      fileType: file.type
    });
  } catch (error) {
    console.error('Admin Upload API hatası:', error);
    return NextResponse.json(
      { error: `Dosya yüklenirken bir hata oluştu: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 