import { NextRequest, NextResponse } from 'next/server';
import { uploadToTebi } from '../../../../../lib/tebi';
import { executeQuery } from '../../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Galeri medya yükleme başlatıldı');
    
    // Formdata'yı al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const fileType = formData.get('type') as string || 'image';

    if (!file) {
      console.error('Dosya bulunamadı');
      return NextResponse.json(
        { success: false, message: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    console.log(`Yüklenen dosya: ${file.name}, Boyut: ${file.size} bytes, Tip: ${file.type}, İstenen tip: ${fileType}`);

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
    const resourceType = isVideo ? 'video' : 'image';

    // Dosya boyutunu kontrol et (görseller için 25MB, videolar için 50MB)
    const maxSizeImage = 25 * 1024 * 1024; // 25MB
    const maxSizeVideo = 50 * 1024 * 1024; // 50MB
    const maxSize = isVideo ? maxSizeVideo : maxSizeImage;
    
    if (file.size > maxSize) {
      console.error(`Dosya boyutu çok büyük: ${file.size} bytes`);
      return NextResponse.json(
        { 
          success: false, 
          message: `Dosya boyutu çok büyük. ${isVideo ? 'Videolar için maksimum 50MB' : 'Görseller için maksimum 25MB'} desteklenir.`
        },
        { status: 400 }
      );
    }
    
    try {
      console.log('Tebi yükleme hazırlıkları başlıyor...');
      
      // Tebi'ye yükle
      const fileName = `gallery_${Date.now()}_${file.name}`;
      console.log(`Yükleme yolu: dogahotel/gallery, Dosya: ${fileName}`);
      
      const result = await uploadToTebi({
        file,
        path: 'dogahotel/gallery'
      });
      
      console.log('Tebi yanıtı:', JSON.stringify(result));
      
      if (!result.success || !result.fileUrl) {
        console.error('Tebi yükleme başarısız:', result);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Tebi\'ye dosya yükleme başarısız: ' + (result.message || 'Bilinmeyen hata'),
            error: result.message
          },
          { status: 500 }
        );
      }
      
      console.log(`Tebi'ye yüklendi. URL: ${result.fileUrl}`);
      console.log('Medya türü:', isVideo ? 'Video' : 'Resim');
    
      // Galeri öğesini veritabanına ekle
      const id = uuidv4();
      
      // Mevcut sıra numaralarını al
      const orderResult = await executeQuery(`
        SELECT MAX(order_number) as max_order FROM gallery
      `);
      
      console.log('Sıra numarası sonucu:', orderResult.rows);
      const maxOrder = orderResult.rows[0]?.max_order || 0;
      const nextOrder = maxOrder + 1;
      
      console.log('Veritabanına eklenecek veriler:', {
        id, 
        image_url: isVideo ? null : result.fileUrl, 
        video_url: isVideo ? result.fileUrl : null,
        title: title || null, 
        description: description || null, 
        order: nextOrder, 
        type: resourceType
      });
      
      // Veritabanına ekle
      await executeQuery(`
        INSERT INTO gallery (
          id, 
          image_url, 
          video_url, 
          title_tr, 
          description_tr, 
          order_number, 
          type,
          created_at,
          updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [
        id, 
        isVideo ? null : result.fileUrl,
        isVideo ? result.fileUrl : null, 
        title || null, 
        description || null, 
        nextOrder, 
        resourceType
      ]);
      
      // Yanıt döndür
      return NextResponse.json({
        success: true,
        url: result.fileUrl,
        data: {
          id,
          image: isVideo ? null : result.fileUrl,
          videoUrl: isVideo ? result.fileUrl : null,
          title,
          description,
          order: nextOrder,
          type: resourceType
        }
      });
    } catch (tebiError) {
      console.error('Tebi yükleme işlemi sırasında hata:', tebiError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tebi yükleme işlemi başarısız: ' + (tebiError instanceof Error ? tebiError.message : 'Bilinmeyen hata'),
          error: tebiError instanceof Error ? tebiError.stack : null 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Galeri yükleme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 