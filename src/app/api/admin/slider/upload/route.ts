import { NextRequest, NextResponse } from 'next/server';
import { uploadToImageKit } from '../../../../../lib/imagekitServer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Slider medya yükleme başlatıldı');
    
    // Formdata'yı al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'slider';
    
    if (!file) {
      console.error('Dosya bulunamadı');
      return NextResponse.json(
        { success: false, message: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }
    
    console.log(`Yüklenen dosya: ${file.name}, Boyut: ${file.size} bytes, Tip: ${file.type}, Klasör: ${folder}`);
    
    // Dosya tipini doğrula
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (!allowedTypes.includes(file.type)) {
      console.error(`Desteklenmeyen dosya formatı: ${file.type}`);
      return NextResponse.json(
        { success: false, message: 'Geçersiz dosya formatı. Yalnızca JPEG, PNG, WebP, MP4, WebM veya OGG formatları desteklenir.' },
        { status: 400 }
      );
    }
    
    const isVideo = file.type.startsWith('video/');
    
    // Dosya boyutunu kontrol et (görseller için 30MB, videolar için 100MB)
    const maxSizeImage = 30 * 1024 * 1024; // 30MB
    const maxSizeVideo = 100 * 1024 * 1024; // 100MB
    const maxSize = isVideo ? maxSizeVideo : maxSizeImage;
    
    if (file.size > maxSize) {
      console.error(`Dosya boyutu çok büyük: ${file.size} bytes`);
      return NextResponse.json(
        { 
          success: false, 
          message: `Dosya boyutu çok büyük. ${isVideo ? 'Videolar için maksimum 100MB' : 'Görseller için maksimum 30MB'} desteklenir.`
        },
        { status: 400 }
      );
    }
    
    try {
      // Dosya içeriğini al
      const bytes = await file.arrayBuffer();
      const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
      
      console.log(`Buffer oluşturuldu, boyut: ${bytes.byteLength} bytes, ImageKit'e yükleniyor...`);
      
      // ImageKit'e yükle
      const imageKitFolder = `slider/${folder}`;
      const result = await uploadToImageKit(bytes, fileName, imageKitFolder);
      
      if (!result || !result.url) {
        console.error('ImageKit yükleme başarısız: URL döndürülmedi');
        return NextResponse.json(
          { success: false, message: 'ImageKit\'e dosya yükleme başarısız: URL alınamadı' },
          { status: 500 }
        );
      }
      
      console.log(`ImageKit'e başarıyla yüklendi. URL: ${result.url}`);
      
      // Başarılı yanıt döndür
      return NextResponse.json({
        success: true,
        fileUrl: result.url,
        fileId: result.fileId,
        fileType: result.fileType
      });
    } catch (uploadError) {
      console.error('ImageKit yükleme hatası:', uploadError);
      return NextResponse.json(
        { 
          success: false, 
          message: `ImageKit'e yükleme sırasında hata: ${uploadError instanceof Error ? uploadError.message : 'Bilinmeyen hata'}`,
          error: uploadError instanceof Error ? uploadError.message : 'Bilinmeyen hata'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Slider medya yükleme hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Dosya yüklenirken bir hata oluştu', 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 